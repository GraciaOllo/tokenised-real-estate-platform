import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PropertyDocument = Property & Document;

@Schema({ timestamps: true })
export class Property {
    @Prop({ required: true })
    title: string;

    @Prop({ required: true })
    location: string;

    @Prop({ required: true })
    description: string;

    @Prop({ required: true })
    valuation: number;

    @Prop({ default: 0 })
    tokenPrice: number;

    @Prop({ default: 0 })
    totalTokens: number;

    @Prop({ required: true })
    monthlyRent: number;

    @Prop({ required: true })
    expectedYield: number;

    @Prop({ type: [String], default: [] })
    images: string[];

    @Prop({ type: [String], default: [] })
    documents: string[];

    // Blockchain core (ERC-721)
    @Prop()
    contractAddress: string;

    @Prop()
    tokenId: number;

    @Prop()
    transactionHash: string;

    @Prop()
    network: string; // e.g., ganache, sepolia

    @Prop()
    tokenStandard: string; // ERC721 or ERC721+ERC20

    @Prop()
    tokenSymbol: string;

    @Prop()
    tokenName: string;

    @Prop()
    ownerWalletAddress: string;

    // Optional fractional (ERC-20) linkage
    @Prop()
    erc20ContractAddress: string;

    // Book-keeping
    @Prop({ required: true })
    ownerId: string;

    @Prop()
    ownerName: string;

    @Prop({ default: function() { return this.totalTokens; } })
    availableTokens: number;

    @Prop({ default: 'pending', enum: ['pending', 'approved', 'rejected', 'tokenized'] })
    status: string;

    @Prop()
    rejectionReason: string;

    @Prop({ default: false })
    isPublished: boolean;

    // Marketplace metadata (server-side mirror)
    @Prop({ default: false })
    isListed: boolean;

    @Prop({ default: 0 })
    listingPrice: number;

    @Prop({ default: 'FULL_PROPERTY', enum: ['FULL_PROPERTY', 'FRACTIONAL_TOKENS'] })
    listingType: string;

    @Prop()
    listingAmount: number; // number of tokens for fractional listing

    @Prop()
    listingExpiresAt: Date;
    save: any;
}

export const PropertySchema = SchemaFactory.createForClass(Property);