import { Controller, Post, Get, Param, Body, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
import { BlockchainService } from './blockchain.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';

interface UploadPropertyDto {
  ownerWallet: string;
  ipfsMetadata: string;
  valuation: number;
  monthlyRent: number;
}

interface TokenizePropertyDto {
  ownerWallet: string;
  ipfsMetadata: string;
  valuation: number;
  monthlyRent: number;
  fractionalize?: boolean;
  totalShares?: number;
  sharePrice?: number;
  tokenName?: string;
  tokenSymbol?: string;
}

interface MintTokensDto {
  erc20ContractAddress: string;
  recipient: string;
  amount: number;
}

@Controller('blockchain')
@UseGuards(AuthGuard)
export class BlockchainController {
  constructor(private readonly blockchainService: BlockchainService) {}

  @Post('tokenize-property')
  async tokenizeProperty(@Body() propertyData: TokenizePropertyDto) {
    try {
      // For now, just call the existing uploadPropertyToBlockchain method
      // until we implement the full tokenization flow
      const result = await this.blockchainService.uploadPropertyToBlockchain({
        ownerWallet: propertyData.ownerWallet,
        ipfsMetadata: propertyData.ipfsMetadata,
        valuation: propertyData.valuation,
        monthlyRent: propertyData.monthlyRent
      });
      
      return {
        success: true,
        data: {
          erc721TokenId: result.tokenId,
          erc20ContractAddress: null, // Not implemented yet
          transactionHash: result.transactionHash,
          contractAddress: result.contractAddress,
          totalShares: null,
          sharePrice: null
        },
        message: 'Property tokenized successfully',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to tokenize property',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Read ETH balance of a wallet
  @Get('eth-balance/:wallet')
  async getEthBalance(@Param('wallet') wallet: string) {
    try {
      const balance = await this.blockchainService.getEthBalance(wallet);
      return {
        success: true,
        data: { wallet, wei: balance.wei.toString(), ether: balance.ether },
        message: 'ETH balance retrieved successfully',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to retrieve ETH balance',
          error: (error as any).message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Read ERC-20 token balance of a wallet
  @Get('erc20-balance/:contract/:wallet')
  async getErc20Balance(@Param('contract') contract: string, @Param('wallet') wallet: string) {
    try {
      const res = await this.blockchainService.getErc20Balance(contract, wallet);
      return {
        success: true,
        data: { contract, wallet, balance: res.balance.toString(), decimals: res.decimals, human: res.human },
        message: 'ERC-20 balance retrieved successfully',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to retrieve ERC-20 balance',
          error: (error as any).message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('mint-tokens')
  async mintTokens(@Body() mintData: MintTokensDto) {
    try {
      const result = await this.blockchainService.mintFractionalTokens(
        mintData.erc20ContractAddress,
        mintData.recipient,
        mintData.amount
      );
      
      return {
        success: true,
        data: result,
        message: 'Tokens minted successfully',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to mint tokens',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('erc20-token/:contractAddress')
  async getERC20TokenInfo(@Param('contractAddress') contractAddress: string) {
    try {
      const tokenInfo = await this.blockchainService.getERC20TokenInfo(contractAddress);
      return {
        success: true,
        data: tokenInfo,
        message: 'ERC-20 token information retrieved successfully',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to retrieve ERC-20 token information',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('upload-property')
  async uploadProperty(@Body() propertyData: UploadPropertyDto) {
    try {
      const result = await this.blockchainService.uploadPropertyToBlockchain(propertyData);
      return {
        success: true,
        data: result,
        message: 'Property uploaded to blockchain successfully',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to upload property to blockchain',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('property/:tokenId')
  async getProperty(@Param('tokenId') tokenId: string) {
    try {
      const property = await this.blockchainService.getPropertyFromBlockchain(Number(tokenId));
      return {
        success: true,
        data: property,
        message: 'Property retrieved from blockchain successfully',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to retrieve property from blockchain',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('balance/:walletAddress')
  async getTokenBalance(@Param('walletAddress') walletAddress: string) {
    try {
      const balance = await this.blockchainService.getTokenBalance(walletAddress);
      return {
        success: true,
        data: { walletAddress, balance },
        message: 'Token balance retrieved successfully',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to retrieve token balance',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('total-supply')
  async getTotalSupply() {
    try {
      const totalSupply = await this.blockchainService.getTotalSupply();
      return {
        success: true,
        data: { totalSupply },
        message: 'Total supply retrieved successfully',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to retrieve total supply',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('contract-info')
  async getContractInfo() {
    try {
      const info = await this.blockchainService.getContractInfo();
      return {
        success: true,
        data: info,
        message: 'Contract information retrieved successfully',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to retrieve contract information',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('connection-status')
  async checkConnection() {
    try {
      const isConnected = await this.blockchainService.checkConnection();
      return {
        success: true,
        data: { isConnected },
        message: isConnected ? 'Blockchain connection successful' : 'Blockchain connection failed',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to check blockchain connection',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}