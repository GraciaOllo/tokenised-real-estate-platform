import { Injectable, Logger } from '@nestjs/common';
import { ethers } from 'ethers';
import * as fs from 'fs';
import * as path from 'path';

interface PropertyTokenizationData {
  ownerWallet: string;
  ipfsMetadata: string;
  valuation: number;
  monthlyRent: number;
  // ERC-20 tokenization options
  fractionalize?: boolean;
  totalShares?: number;
  sharePrice?: number;
  tokenName?: string;
  tokenSymbol?: string;
}

interface TokenizationResult {
  erc721TokenId: number;
  erc20ContractAddress?: string;
  transactionHash: string;
  contractAddress: string;
  totalShares?: number;
  sharePrice?: number;
}

interface TradingData {
  propertyId: number;
  amount: number;
  price: number;
  orderType: 'buy' | 'sell';
}

interface MarketListing {
  propertyId: number;
  seller: string;
  price: number;
  isActive: boolean;
  createdAt: Date;
  expiresAt: Date;
  listingType: 'full_property' | 'fractional_tokens';
}

@Injectable()
export class BlockchainService {
  private readonly logger = new Logger(BlockchainService.name);
  private provider: ethers.JsonRpcProvider;
  private wallet: ethers.Wallet;
  private erc721Contract: ethers.Contract | null = null;
  private contractAddress: string = '';
  private contractArtifact: any;
  private erc20ContractArtifact: any;

  constructor() {
    this.initializeBlockchain();
  }

  // Enumerate ERC-20 holders by scanning Transfer events
  private async getErc20Holders(erc20ContractAddress: string): Promise<string[]> {
    if (!this.erc20ContractArtifact) {
      throw new Error('ERC-20 contract artifact not loaded');
    }
    const erc20 = new ethers.Contract(
      erc20ContractAddress,
      this.erc20ContractArtifact.abi,
      this.wallet
    );
    const zeroAddress = '0x0000000000000000000000000000000000000000';
    const transferFilter = erc20.filters.Transfer();
    const logs = await erc20.queryFilter(transferFilter, 0, 'latest');
    const holders = new Set<string>();
    for (const log of logs) {
      const parsed = erc20.interface.parseLog(log);
      const from = (parsed?.args as any)?.from as string;
      const to = (parsed?.args as any)?.to as string;
      if (from && from.toLowerCase() !== zeroAddress) holders.add(from.toLowerCase());
      if (to && to.toLowerCase() !== zeroAddress) holders.add(to.toLowerCase());
    }
    return Array.from(holders);
  }

  // Off-chain ETH distribution to holders based on ERC-20 balances (pro-rata)
  async distributeDividendsOffchain(
    erc20ContractAddress: string,
    amountEth: number
  ): Promise<{ totalWei: bigint; payouts: { to: string; wei: bigint; txHash: string }[] }> {
    if (!this.erc20ContractArtifact) {
      throw new Error('ERC-20 contract artifact not loaded');
    }
    if (!amountEth || amountEth <= 0) {
      throw new Error('Amount must be positive');
    }

    const erc20 = new ethers.Contract(
      erc20ContractAddress,
      this.erc20ContractArtifact.abi,
      this.wallet
    );

    const totalSupply: bigint = await erc20.totalSupply();
    if (totalSupply <= BigInt(0)) {
      throw new Error('Total supply is zero');
    }

    const holders = await this.getErc20Holders(erc20ContractAddress);
    const totalWei = ethers.parseUnits(amountEth.toString(), 'ether');

    const payouts: { to: string; wei: bigint; txHash: string }[] = [];
    for (const holder of holders) {
      const balance: bigint = await erc20.balanceOf(holder);
      if (balance <= BigInt(0)) continue;
      const shareWei = (totalWei * balance) / totalSupply;
      if (shareWei <= BigInt(0)) continue;
      const tx = await this.wallet.sendTransaction({ to: holder, value: shareWei });
      const receipt = await tx.wait();
      payouts.push({ to: holder, wei: shareWei, txHash: receipt.hash });
    }

    return { totalWei, payouts };
  }

  // Read ETH balance for a wallet (in wei and ether)
  async getEthBalance(walletAddress: string): Promise<{ wei: bigint; ether: string }> {
    const wei = await this.provider.getBalance(walletAddress);
    return { wei, ether: ethers.formatEther(wei) };
  }

  // Read ERC-20 token balance for a wallet
  async getErc20Balance(erc20ContractAddress: string, walletAddress: string): Promise<{ balance: bigint; decimals: number; human: string }> {
    if (!this.erc20ContractArtifact) {
      throw new Error('ERC-20 contract artifact not loaded');
    }
    const erc20 = new ethers.Contract(
      erc20ContractAddress,
      this.erc20ContractArtifact.abi,
      this.provider
    );
    const [balance, decimals] = await Promise.all([
      erc20.balanceOf(walletAddress) as Promise<bigint>,
      erc20.decimals() as Promise<number>,
    ]);
    const human = ethers.formatUnits(balance, decimals);
    return { balance, decimals, human };
  }
  // Public wrapper to fractionalize an already existing ERC-721 property
  async deployERC20ForExistingProperty(options: {
    tokenId: number;
    valuation: number;
    totalShares: number;
    sharePrice: number;
    tokenName?: string;
    tokenSymbol?: string;
  }): Promise<{ contractAddress: string; totalShares: number; sharePrice: number }> {
    const { tokenId, valuation, totalShares, sharePrice, tokenName, tokenSymbol } = options;
    const payload: PropertyTokenizationData = {
      ownerWallet: '0x0000000000000000000000000000000000000000', // unused by ERC-20 deployment
      ipfsMetadata: '', // unused by ERC-20 deployment
      valuation,
      monthlyRent: 0, // unused by ERC-20 deployment
      fractionalize: true,
      totalShares,
      sharePrice,
      tokenName,
      tokenSymbol,
    };
    // We don't have the original ERC-721 tx hash here; pass a placeholder
    return this.deployERC20Contract(tokenId, payload, '0x');
  }

  private async initializeBlockchain() {
    try {
      // Ganache default configuration
      const GANACHE_RPC_URL = process.env.GANACHE_RPC_URL || 'http://127.0.0.1:7545';
      const PRIVATE_KEY = process.env.PRIVATE_KEY || '0xd6d87e646bbeb39f6e0614bef0427e616cce3ebf7418b63407b6fc2d9c785019';
      const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

      this.provider = new ethers.JsonRpcProvider(GANACHE_RPC_URL);
      this.wallet = new ethers.Wallet(PRIVATE_KEY, this.provider);
      
      // Load contract artifacts
      await this.loadContractArtifacts();
      
      if (CONTRACT_ADDRESS) {
        this.contractAddress = CONTRACT_ADDRESS;
        this.erc721Contract = new ethers.Contract(CONTRACT_ADDRESS, this.contractArtifact.abi, this.wallet);
        this.logger.log(`Connected to existing ERC-721 contract at ${CONTRACT_ADDRESS}`);
      } else {
        await this.deployERC721Contract();
      }
    } catch (error) {
      this.logger.error('Failed to initialize blockchain connection:', error);
      throw error;
    }
  }

  private async loadContractArtifacts() {
    try {
      // Load ERC-721 contract artifact
      const erc721ArtifactPath = path.join(__dirname, '../../build/contracts/PropertyRegistryERC721.json');
      const erc20ArtifactPath = path.join(__dirname, '../../build/contracts/PropertyTokenERC20.json');
      const addressPath = path.join(__dirname, '../../build/contracts/contract-address.json');
      
      if (fs.existsSync(erc721ArtifactPath)) {
        this.contractArtifact = JSON.parse(fs.readFileSync(erc721ArtifactPath, 'utf8'));
        this.logger.log('ERC-721 contract artifact loaded successfully');
      } else {
        this.logger.warn('ERC-721 contract artifact not found. Please compile with: npm run compile');
        throw new Error('ERC-721 contract artifact not found');
      }

      // Load ERC-20 contract artifact
      if (fs.existsSync(erc20ArtifactPath)) {
        this.erc20ContractArtifact = JSON.parse(fs.readFileSync(erc20ArtifactPath, 'utf8'));
        this.logger.log('ERC-20 contract artifact loaded successfully');
      } else {
        this.logger.warn('ERC-20 contract artifact not found. Please compile with: npm run compile');
        throw new Error('ERC-20 contract artifact not found');
      }
      
      // Try to load contract address if available
      if (fs.existsSync(addressPath)) {
        const addressData = JSON.parse(fs.readFileSync(addressPath, 'utf8'));
        process.env.CONTRACT_ADDRESS = addressData.erc721ContractAddress;
        this.logger.log(`Loaded ERC-721 contract address: ${addressData.erc721ContractAddress}`);
      }
    } catch (error) {
      this.logger.error('Failed to load contract artifacts:', error);
      throw error;
    }
  }

  private async deployERC721Contract(): Promise<string> {
    try {
      this.logger.log('Deploying PropertyRegistryERC721 contract...');
      
      if (!this.contractArtifact) {
        throw new Error('Contract artifact not loaded');
      }
      
      // Create contract factory using Truffle artifact
      const contractFactory = new ethers.ContractFactory(
        this.contractArtifact.abi,
        this.contractArtifact.bytecode,
        this.wallet
      );
      
      // Deploy the contract
      const deployedContract = await contractFactory.deploy('PropertyRegistry', 'PROP');
      await deployedContract.waitForDeployment();
      
      this.contractAddress = await deployedContract.getAddress();
      this.erc721Contract = deployedContract as ethers.Contract;
      
      this.logger.log(`ERC-721 contract deployed at: ${this.contractAddress}`);
      
      // Save the contract address
      const addressPath = path.join(__dirname, '../../build/contracts/contract-address.json');
      const buildDir = path.dirname(addressPath);
      if (!fs.existsSync(buildDir)) {
        fs.mkdirSync(buildDir, { recursive: true });
      }
      
      fs.writeFileSync(addressPath, JSON.stringify({
        erc721ContractAddress: this.contractAddress,
        network: 'ganache',
        deployedAt: new Date().toISOString()
      }, null, 2));
      
      return this.contractAddress;
    } catch (error) {
      this.logger.error('Failed to deploy ERC-721 contract:', error);
      throw error;
    }
  }

  async tokenizeProperty(propertyData: PropertyTokenizationData): Promise<TokenizationResult> {
    try {
      this.logger.log('Tokenizing property on blockchain...', propertyData);

      // Ensure we have a contract instance
      if (!this.erc721Contract) {
        await this.initializeBlockchain();
      }

      if (!this.erc721Contract) {
        throw new Error('ERC-721 contract not initialized');
      }

      // Step 1: Mint ERC-721 token (property deed)
      const erc721Tx = await this.erc721Contract.createProperty(
        propertyData.ownerWallet,
        propertyData.ipfsMetadata,
        ethers.parseUnits(propertyData.valuation.toString(), 'ether'),
        ethers.parseUnits(propertyData.monthlyRent.toString(), 'ether')
      );

      // Wait for ERC-721 transaction confirmation
      const erc721Receipt = await erc721Tx.wait();
      
      // Get the token ID from the event
      const event = erc721Receipt.logs.find(log => {
        try {
          const parsed = this.erc721Contract!.interface.parseLog(log);
          return parsed.name === 'PropertyCreated';
        } catch {
          return false;
        }
      });

      let tokenId = 0;
      if (event) {
        const parsed = this.erc721Contract!.interface.parseLog(event);
        tokenId = Number(parsed.args[0]);
      }

      this.logger.log(`ERC-721 token minted successfully. Token ID: ${tokenId}`);

      let erc20ContractAddress: string | undefined;
      let totalShares: number | undefined;
      let sharePrice: number | undefined;

      // Step 2: If fractionalization is requested, deploy ERC-20 contract
      if (propertyData.fractionalize && propertyData.totalShares && propertyData.sharePrice) {
        const erc20Result = await this.deployERC20Contract(
          tokenId,
          propertyData,
          erc721Receipt.hash
        );
        erc20ContractAddress = erc20Result.contractAddress;
        totalShares = erc20Result.totalShares;
        sharePrice = erc20Result.sharePrice;
      }

      return {
        erc721TokenId: tokenId,
        erc20ContractAddress,
        transactionHash: erc721Receipt.hash,
        contractAddress: this.contractAddress,
        totalShares,
        sharePrice
      };
    } catch (error) {
      this.logger.error('Failed to tokenize property on blockchain:', error);
      throw error;
    }
  }

  private async deployERC20Contract(
    tokenId: number,
    propertyData: PropertyTokenizationData,
    erc721TxHash: string
  ): Promise<{ contractAddress: string; totalShares: number; sharePrice: number }> {
    try {
      this.logger.log('Deploying ERC-20 fractional token contract...');
      
      if (!this.erc20ContractArtifact) {
        throw new Error('ERC-20 contract artifact not loaded');
      }
      
      // Create ERC-20 contract factory
      const contractFactory = new ethers.ContractFactory(
        this.erc20ContractArtifact.abi,
        this.erc20ContractArtifact.bytecode,
        this.wallet
      );
      
      // Prepare token details
      const tokenName = propertyData.tokenName || `Property ${tokenId} Shares`;
      const tokenSymbol = propertyData.tokenSymbol || `PROP${tokenId}`;
      const totalShares = propertyData.totalShares || 100000;
      const sharePrice = propertyData.sharePrice || Math.floor(propertyData.valuation / totalShares);
      
      // Deploy the ERC-20 contract
      const deployedContract = await contractFactory.deploy(
        tokenName,
        tokenSymbol,
        tokenId.toString(),
        ethers.parseUnits(propertyData.valuation.toString(), 'ether'),
        totalShares,
        ethers.parseUnits(sharePrice.toString(), 'ether')
      );
      
      await deployedContract.waitForDeployment();
      const contractAddress = await deployedContract.getAddress();
      
      this.logger.log(`ERC-20 contract deployed at: ${contractAddress}`);
      
      // Update contract addresses file
      const addressPath = path.join(__dirname, '../../build/contracts/contract-address.json');
      const addressData = JSON.parse(fs.readFileSync(addressPath, 'utf8'));
      addressData.erc20Contracts = addressData.erc20Contracts || {};
      addressData.erc20Contracts[tokenId] = {
        contractAddress,
        tokenName,
        tokenSymbol,
        totalShares,
        sharePrice: sharePrice.toString(),
        deployedAt: new Date().toISOString(),
        erc721TxHash
      };
      
      fs.writeFileSync(addressPath, JSON.stringify(addressData, null, 2));
      
      return {
        contractAddress,
        totalShares,
        sharePrice
      };
    } catch (error) {
      this.logger.error('Failed to deploy ERC-20 contract:', error);
      throw error;
    }
  }

  async mintFractionalTokens(
    erc20ContractAddress: string,
    recipient: string,
    amount: number
  ): Promise<{ transactionHash: string }> {
    try {
      if (!this.erc20ContractArtifact) {
        throw new Error('ERC-20 contract artifact not loaded');
      }

      const erc20Contract = new ethers.Contract(
        erc20ContractAddress,
        this.erc20ContractArtifact.abi,
        this.wallet
      );

      const tx = await erc20Contract.mintShares(recipient, amount);
      const receipt = await tx.wait();

      this.logger.log(`Minted ${amount} fractional tokens to ${recipient}`);

      return {
        transactionHash: receipt.hash
      };
    } catch (error) {
      this.logger.error('Failed to mint fractional tokens:', error);
      throw error;
    }
  }

  async getERC20TokenInfo(erc20ContractAddress: string): Promise<any> {
    try {
      if (!this.erc20ContractArtifact) {
        throw new Error('ERC-20 contract artifact not loaded');
      }

      const erc20Contract = new ethers.Contract(
        erc20ContractAddress,
        this.erc20ContractArtifact.abi,
        this.provider
      );

      const [
        propertyInfo,
        totalSupply,
        name,
        symbol,
        decimals
      ] = await Promise.all([
        erc20Contract.getPropertyInfo(),
        erc20Contract.totalSupply(),
        erc20Contract.name(),
        erc20Contract.symbol(),
        erc20Contract.decimals()
      ]);

      return {
        contractAddress: erc20ContractAddress,
        name,
        symbol,
        decimals: Number(decimals),
        totalSupply: Number(totalSupply),
        propertyId: propertyInfo[0],
        propertyValuation: ethers.formatUnits(propertyInfo[1], 'ether'),
        totalShares: Number(propertyInfo[2]),
        sharePrice: ethers.formatUnits(propertyInfo[3], 'ether'),
        totalRentCollected: ethers.formatUnits(propertyInfo[4], 'ether'),
        lastDistributionBlock: Number(propertyInfo[5])
      };
    } catch (error) {
      this.logger.error('Failed to get ERC-20 token info:', error);
      throw error;
    }
  }

  async uploadPropertyToBlockchain(propertyData: {
    ownerWallet: string;
    ipfsMetadata: string;
    valuation: number;
    monthlyRent: number;
  }): Promise<{ tokenId: number; transactionHash: string; contractAddress: string }> {
    // For backward compatibility, call the new tokenizeProperty method
    const result = await this.tokenizeProperty({
      ...propertyData,
      fractionalize: false
    });
    
    return {
      tokenId: result.erc721TokenId,
      transactionHash: result.transactionHash,
      contractAddress: result.contractAddress
    };
  }

  async getPropertyFromBlockchain(tokenId: number): Promise<any> {
    try {
      if (!this.erc721Contract) {
        await this.initializeBlockchain();
      }

      if (!this.erc721Contract) {
        throw new Error('Contract not initialized');
      }

      const property = await this.erc721Contract.getProperty(tokenId);
      
      return {
        tokenId: Number(property.tokenId),
        ownerWallet: property.ownerWallet,
        ipfsMetadata: property.ipfsMetadata,
        valuation: ethers.formatUnits(property.valuation, 'ether'),
        monthlyRent: ethers.formatUnits(property.monthlyRent, 'ether'),
        createdAt: new Date(Number(property.createdAt) * 1000)
      };
    } catch (error) {
      this.logger.error(`Failed to get property ${tokenId} from blockchain:`, error);
      throw error;
    }
  }

  async getTokenBalance(walletAddress: string): Promise<number> {
    try {
      if (!this.erc721Contract) {
        await this.initializeBlockchain();
      }

      if (!this.erc721Contract) {
        throw new Error('Contract not initialized');
      }

      const balance = await this.erc721Contract.balanceOf(walletAddress);
      return Number(balance);
    } catch (error) {
      this.logger.error(`Failed to get balance for ${walletAddress}:`, error);
      throw error;
    }
  }

  async getTotalSupply(): Promise<number> {
    try {
      if (!this.erc721Contract) {
        await this.initializeBlockchain();
      }

      if (!this.erc721Contract) {
        throw new Error('Contract not initialized');
      }

      const totalSupply = await this.erc721Contract.totalSupply();
      return Number(totalSupply);
    } catch (error) {
      this.logger.error('Failed to get total supply:', error);
      throw error;
    }
  }

  async getContractInfo(): Promise<any> {
    try {
      if (!this.erc721Contract) {
        await this.initializeBlockchain();
      }

      if (!this.erc721Contract) {
        throw new Error('Contract not initialized');
      }

      const totalSupply = await this.getTotalSupply();
      
      return {
        erc721ContractAddress: this.contractAddress,
        totalProperties: totalSupply,
        network: await this.provider.getNetwork(),
        blockNumber: await this.provider.getBlockNumber()
      };
    } catch (error) {
      this.logger.error('Failed to get contract info:', error);
      throw error;
    }
  }

  async checkConnection(): Promise<boolean> {
    try {
      const blockNumber = await this.provider.getBlockNumber();
      this.logger.log(`Connected to blockchain. Current block: ${blockNumber}`);
      return true;
    } catch (error) {
      this.logger.error('Blockchain connection failed:', error);
      return false;
    }
  }

  async placeTradeOrder(tradingData: TradingData): Promise<{ orderId: number; transactionHash: string }> {
    try {
      const property = await this.getPropertyFromBlockchain(tradingData.propertyId);
      
      if (!property.erc20ContractAddress) {
        throw new Error('Property not fractionalized');
      }

      const erc20Contract = new ethers.Contract(
        property.erc20ContractAddress,
        this.erc20ContractArtifact.abi,
        this.wallet
      );

      let tx;
      if (tradingData.orderType === 'sell') {
        // Place sell order
        tx = await erc20Contract.placeSellOrder(
          tradingData.amount,
          ethers.parseUnits(tradingData.price.toString(), 'ether')
        );
      } else {
        // Place buy order
        const totalCost = tradingData.amount * tradingData.price;
        tx = await erc20Contract.placeBuyOrder(
          tradingData.amount,
          ethers.parseUnits(tradingData.price.toString(), 'ether'),
          { value: ethers.parseUnits(totalCost.toString(), 'ether') }
        );
      }

      const receipt = await tx.wait();
      
      // Extract order ID from event
      const event = receipt.logs.find(log => {
        try {
          const parsed = erc20Contract.interface.parseLog(log);
          return parsed.name === 'OrderPlaced';
        } catch {
          return false;
        }
      });

      let orderId = 0;
      if (event) {
        const parsed = erc20Contract.interface.parseLog(event);
        orderId = Number(parsed.args[0]);
      }

      return {
        orderId,
        transactionHash: receipt.hash
      };
    } catch (error) {
      this.logger.error('Failed to place trade order:', error);
      throw error;
    }
  }

  async cancelOrder(propertyId: number, orderId: number, orderType: 'buy' | 'sell'): Promise<{ transactionHash: string }> {
    try {
      const property = await this.getPropertyFromBlockchain(propertyId);
      
      if (!property.erc20ContractAddress) {
        throw new Error('Property not fractionalized');
      }

      const erc20Contract = new ethers.Contract(
        property.erc20ContractAddress,
        this.erc20ContractArtifact.abi,
        this.wallet
      );

      const orderTypeEnum = orderType === 'buy' ? 0 : 1; // 0 = BUY, 1 = SELL
      
      const tx = await erc20Contract.cancelOrder(orderId, orderTypeEnum);
      const receipt = await tx.wait();

      return {
        transactionHash: receipt.hash
      };
    } catch (error) {
      this.logger.error('Failed to cancel order:', error);
      throw error;
    }
  }

  async distributeDividends(erc20ContractAddress: string, amountEth: number): Promise<{ transactionHash: string }> {
    try {
      if (!this.erc20ContractArtifact) {
        throw new Error('ERC-20 contract artifact not loaded');
      }

      const erc20Contract = new ethers.Contract(
        erc20ContractAddress,
        this.erc20ContractArtifact.abi,
        this.wallet
      );

      // Feature-detect method support
      const hasMethod = (erc20Contract as any)?.distributeDividends && typeof (erc20Contract as any).distributeDividends === 'function';
      if (!hasMethod) {
        // Do not log as error; caller will fallback to off-chain
        const notSupported = new Error('METHOD_NOT_SUPPORTED');
        (notSupported as any).code = 'METHOD_NOT_SUPPORTED';
        throw notSupported;
      }

      // Send ETH value representing the rent to distribute
      const value = ethers.parseUnits(amountEth.toString(), 'ether');
      const tx = await (erc20Contract as any).distributeDividends({ value });
      const receipt = await tx.wait();

      return {
        transactionHash: receipt.hash
      };
    } catch (error: any) {
      if (error?.code === 'METHOD_NOT_SUPPORTED') {
        // Expected path for ABIs without the method — don't spam error logs
        throw error;
      }
      this.logger.error('Failed to distribute dividends:', error);
      throw error;
    }
  }

  async claimDividends(erc20ContractAddress: string): Promise<{ transactionHash: string; amount: number }> {
    try {
      if (!this.erc20ContractArtifact) {
        throw new Error('ERC-20 contract artifact not loaded');
      }

      const erc20Contract = new ethers.Contract(
        erc20ContractAddress,
        this.erc20ContractArtifact.abi,
        this.wallet
      );

      // Get claimable amount first
      const claimableAmount = await erc20Contract.getClaimableDividends(this.wallet.address);
      
      if (claimableAmount <= 0) {
        throw new Error('No dividends to claim');
      }

      const tx = await erc20Contract.claimDividends();
      const receipt = await tx.wait();

      return {
        transactionHash: receipt.hash,
        amount: Number(ethers.formatEther(claimableAmount))
      };
    } catch (error) {
      this.logger.error('Failed to claim dividends:', error);
      throw error;
    }
  }

  async getMarketListings(): Promise<MarketListing[]> {
    try {
      // This would interact with the PropertyMarketplace contract
      // For now, return empty array - implement based on your marketplace contract
      return [];
    } catch (error) {
      this.logger.error('Failed to get market listings:', error);
      throw error;
    }
  }
}
