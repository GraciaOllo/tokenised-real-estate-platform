import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Property, PropertyDocument } from './schemas/property.schema';
import { CreatePropertyDto, UpdatePropertyDto } from './dto/property.dto';
import { UserDocument } from '../users/schemas/user.schema';
import { BlockchainService } from '../blockchain/blockchain.service';

@Injectable()
export class PropertyService {
  constructor(
    @InjectModel(Property.name) private propertyModel: Model<PropertyDocument>,
    private readonly blockchainService: BlockchainService
  ) {}

  async createProperty(dto: CreatePropertyDto, manager: any): Promise<Property> {
    if (manager.role !== 'manager') {
      throw new ForbiddenException('Only managers can create properties');
    }
    
    const created = new this.propertyModel({ 
      ...dto,
      ownerId: manager.userId || manager._id,
      ownerName: manager.name || manager.email
    });
    return created.save();
  }

  async getAllProperties(): Promise<Property[]> {
    return this.propertyModel.find().exec();
  }

  // Fetch all properties created by a specific owner (manager)
  async getPropertiesByOwner(ownerId: string): Promise<Property[]> {
    return this.propertyModel.find({ ownerId }).exec();
  }

  async getPropertyById(id: string): Promise<Property> {
    const prop = await this.propertyModel.findById(id).exec();
    if (!prop) throw new NotFoundException('Property not found');
    return prop;
  }

  // Get all properties owned by the current authenticated user
  async getMyProperties(userId: string): Promise<Property[]> {
    return this.propertyModel.find({ ownerId: userId }).exec();
  }

  // Add the missing findById method for backward compatibility
  async findById(id: string): Promise<Property> {
    return this.getPropertyById(id);
  }

  async updateProperty(id: string, dto: UpdatePropertyDto, user: UserDocument): Promise<Property> {
    const prop = await this.getPropertyById(id);

    // Only admin or property owner (manager) can update
    if (user.role !== 'admin' && user.role !== 'manager') {
      throw new ForbiddenException('Not authorized');
    }

    Object.assign(prop, dto);
    return prop.save();
  }

  async publishProperty(id: string, admin: UserDocument, blockchainData: Partial<Property>): Promise<Property> {
    if (admin.role !== 'admin') {
      throw new ForbiddenException('Only admin can publish to blockchain');
    }

    const prop = await this.getPropertyById(id);

    try {
      // Prepare metadata for IPFS (in a real implementation, you'd upload to IPFS first)
      const ipfsMetadata = JSON.stringify({
        title: prop.title,
        location: prop.location,
        description: prop.description,
        images: prop.images,
        documents: prop.documents,
        expectedYield: prop.expectedYield,
        tokenPrice: prop.tokenPrice,
        totalTokens: prop.totalTokens
      });

      // Ensure owner wallet is provided; accept both ownerWallet and ownerWalletAddress keys
      const zeroAddress = '0x0000000000000000000000000000000000000000';
      const ownerWalletCandidate =
        (blockchainData as any)?.ownerWallet ||
        (blockchainData as any)?.ownerWalletAddress ||
        (admin as any)?.walletAddress ||
        zeroAddress;

      if (!ownerWalletCandidate || ownerWalletCandidate === zeroAddress) {
        throw new ForbiddenException('Valid owner wallet address is required for publishing');
      }

      const ownerWallet = ownerWalletCandidate;

      // Call the existing ERC-721 upload flow
      const blockchainResult = await this.blockchainService.uploadPropertyToBlockchain({
        ownerWallet,
        ipfsMetadata,
        valuation: prop.valuation,
        monthlyRent: prop.monthlyRent,
      });

      // Update property with blockchain data
      Object.assign(prop, {
        ...blockchainData,
        isPublished: true,
        status: 'tokenized',
        contractAddress: blockchainResult.contractAddress,
        tokenId: blockchainResult.tokenId,
        transactionHash: blockchainResult.transactionHash,
        network: 'ganache',
        tokenStandard: 'ERC721',
        tokenSymbol: 'PROP',
        tokenName: 'Property Token',
      });

      return prop.save();
    } catch (error) {
      throw new ForbiddenException(`Failed to publish property to blockchain: ${error.message}`);
    }
  }

  async getPropertyFromBlockchain(tokenId: number): Promise<any> {
    return this.blockchainService.getPropertyFromBlockchain(tokenId);
  }

  async getBlockchainInfo(): Promise<any> {
    return this.blockchainService.getContractInfo();
  }

  async getERC20TokenInfo(contractAddress: string): Promise<any> {
    return this.blockchainService.getERC20TokenInfo(contractAddress);
  }

  async mintTokens(contractAddress: string, recipient: string, amount: number): Promise<any> {
    return this.blockchainService.mintFractionalTokens(contractAddress, recipient, amount);
  }

  // Server-side listing mirror (optional to sync with marketplace contract)
  async setListing(id: string, dto: { listingPrice: number; listingType: string; listingAmount?: number; listingExpiresAt?: string }, user: UserDocument): Promise<Property> {
    const prop = await this.getPropertyById(id);
    if (user.role !== 'admin' && user.role !== 'manager') {
      throw new ForbiddenException('Not authorized');
    }
    prop.isListed = true;
    prop.listingPrice = dto.listingPrice;
    prop.listingType = dto.listingType;
    prop.listingAmount = dto.listingAmount || 0;
    prop.listingExpiresAt = dto.listingExpiresAt ? new Date(dto.listingExpiresAt) : undefined;
    return prop.save();
  }

  async delistProperty(id: string, user: UserDocument): Promise<Property> {
    const prop = await this.getPropertyById(id);
    if (user.role !== 'admin' && user.role !== 'manager') {
      throw new ForbiddenException('Not authorized');
    }
    prop.isListed = false;
    prop.listingPrice = 0;
    prop.listingAmount = 0;
    prop.listingExpiresAt = undefined;
    return prop.save();
  }

  // Investor purchase flow (server-minted tokens)
  async buyTokens(
    id: string,
    amount: number,
    walletAddress: string,
    user: UserDocument
  ): Promise<{ transactionHash: string; property: Property; amount: number; totalCost: number }> {
    // Only investors can buy
    if (user.role !== 'investor') {
      throw new ForbiddenException('Only investors can buy tokens');
    }

    const prop = await this.getPropertyById(id);

    // Require fractional token contract to exist
    if (!prop.erc20ContractAddress) {
      throw new ForbiddenException('Property is not fractionalized');
    }

    // Validate listing state (must be listed for fractional tokens)
    if (!prop.isListed || (prop.listingType !== 'FRACTIONAL_TOKENS' && prop.listingType !== 'FRACTIONAL_TOKENS'.toUpperCase())) {
      throw new ForbiddenException('Property is not listed for fractional token sale');
    }

    // Basic input validations
    const zeroAddress = '0x0000000000000000000000000000000000000000';
    if (!walletAddress || walletAddress === zeroAddress) {
      throw new ForbiddenException('Valid recipient wallet address is required');
    }
    if (!amount || amount <= 0 || !Number.isFinite(amount)) {
      throw new ForbiddenException('Amount must be a positive number');
    }

    // Check available supply if tracked
    if (typeof prop.availableTokens === 'number' && prop.availableTokens < amount) {
      throw new ForbiddenException('Not enough tokens available');
    }

    // Pricing: prefer listingPrice, fallback to tokenPrice
    const unitPrice = prop.listingPrice && prop.listingPrice > 0 ? prop.listingPrice : (prop.tokenPrice || 0);
    const totalCost = amount * unitPrice;

    // TODO: Integrate real payment processing before minting

    // Mint tokens to investor
    const { transactionHash } = await this.mintTokens(
      prop.erc20ContractAddress,
      walletAddress,
      amount
    );

    // Decrease available tokens if tracked
    if (typeof prop.availableTokens === 'number') {
      prop.availableTokens = Math.max(0, (prop.availableTokens || 0) - amount);
    }
    await prop.save();

    return { transactionHash, property: prop, amount, totalCost };
  }

  // Admin fractionalize flow: deploy ERC-20 and persist to property
  async fractionalizeProperty(
    id: string,
    dto: { totalShares: number; sharePrice: number; tokenName?: string; tokenSymbol?: string },
    user: UserDocument
  ): Promise<Property> {
    if (user.role !== 'admin') {
      throw new ForbiddenException('Only admin can fractionalize properties');
    }

    const prop = await this.getPropertyById(id);

    if (!prop.tokenId) {
      throw new ForbiddenException('Property must be published (ERC-721) before fractionalization');
    }

    // Deploy ERC-20 fractional token
    const res = await this.blockchainService.deployERC20ForExistingProperty({
      tokenId: Number(prop.tokenId),
      valuation: prop.valuation,
      totalShares: dto.totalShares,
      sharePrice: dto.sharePrice,
      tokenName: dto.tokenName,
      tokenSymbol: dto.tokenSymbol,
    });

    // Persist economics
    prop.erc20ContractAddress = res.contractAddress;
    prop.totalTokens = dto.totalShares;
    prop.availableTokens = dto.totalShares;
    prop.tokenPrice = dto.sharePrice;
    prop.tokenStandard = 'ERC721+ERC20';
    if (dto.tokenName) prop.tokenName = dto.tokenName;
    if (dto.tokenSymbol) prop.tokenSymbol = dto.tokenSymbol;

    await prop.save();
    return prop;
  }
}
