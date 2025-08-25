// import { Controller, Post, Get, Param, Body, UseGuards } from '@nestjs/common';
// import { BlockchainService } from './blockchain.service';
// import { AuthGuard } from '../auth/guards/auth.guard';

// @Controller('blockchain')
// @UseGuards(AuthGuard)
// export class BlockchainController {
// constructor(private readonly blockchainService: BlockchainService) {}

// @Post('deploy')
// async deployContract(@Body() propertyData: any) {
//     const contractAddress = await this.blockchainService.deployContract(propertyData);
//     return {
//     success: true,
//     contractAddress,
//     message: 'Contract deployed successfully',
//     };
// }

// @Post('mint')
// async mintTokens(@Body() body: { contractAddress: string; amount: number; recipient: string }) {
//     const transactionHash = await this.blockchainService.mintTokens(
//     body.contractAddress,
//     body.amount,
//     body.recipient,
//     );
//     return {
//     success: true,
//     transactionHash,
//     message: 'Tokens minted successfully',
//     };
// }

// @Post('distribute-rent')
// async distributeRent(@Body() body: { contractAddress: string; totalAmount: number }) {
//     const transactionHash = await this.blockchainService.distributeRent(
//     body.contractAddress,
//     body.totalAmount,
//     );
//     return {
//     success: true,
//     transactionHash,
//     message: 'Rent distributed successfully',
//     };
// }

// @Get('balance/:contractAddress/:walletAddress')
// async getTokenBalance(
//     @Param('contractAddress') contractAddress: string,
//     @Param('walletAddress') walletAddress: string,
// ) {
//     const balance = await this.blockchainService.getTokenBalance(contractAddress, walletAddress);
//     return {
//     success: true,
//     balance,
//     };
// }

// @Get('contract/:contractAddress')
// async getContractInfo(@Param('contractAddress') contractAddress: string) {
//     const info = await this.blockchainService.getContractInfo(contractAddress);
//     return {
//     success: true,
//     data: info,
//     };
// }
// }