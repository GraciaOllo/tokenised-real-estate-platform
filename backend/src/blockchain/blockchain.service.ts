// import { Injectable } from '@nestjs/common';
// import { ethers } from 'ethers';
// import GreenTokenABI from '../contracts/GreenTokenABI.json';

// @Injectable()
// export class BlockchainService {
// async distributeRent(contractAddress: string, ownerPrivateKey: string) {
// const provider = new ethers.providers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
// const wallet = new ethers.Wallet(ownerPrivateKey, provider);
// const contract = new ethers.Contract(contractAddress, GreenTokenABI, wallet);
// const tx = await contract.distributeRent();
// await tx.wait();
// return tx.hash;
// }
// }
