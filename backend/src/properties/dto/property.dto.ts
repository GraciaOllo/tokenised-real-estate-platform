import { IsString, IsNumber, IsOptional, IsArray, IsPositive, IsUUID, IsNotEmpty, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { PartialType } from '@nestjs/mapped-types';

export class CreatePropertyDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    location: string;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsNumber()
    @IsPositive()
    @Type(() => Number)
    valuation: number;

    @IsNumber()
    @IsPositive()
    @Type(() => Number)
    monthlyRent: number;

    @IsNumber()
    @IsPositive()
    @Type(() => Number)
    expectedYield: number;

    @IsNumber()
    @IsPositive()
    @Type(() => Number)
    tokenPercentage: number;

    @IsNumber()
    @IsPositive()
    @Type(() => Number)
    tokenPrice: number;

    @IsNumber()
    @IsPositive()
    @Type(() => Number)
    totalTokens: number;

    @IsNumber()
    @IsPositive()
    @Type(() => Number)
    tokensForSale: number;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    images?: string[];

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    documents?: string[];

    // Workflow flags
    @IsOptional()
    @IsBoolean()
    isPublished?: boolean; // true once admin deploys to blockchain

    // Blockchain fields (filled by admin after deployment)
    @IsOptional()
    @IsString()
    contractAddress?: string;

    @IsOptional()
    @IsString()
    network?: string; // e.g., "ethereum", "polygon"

    @IsOptional()
    @IsString()
    tokenSymbol?: string;

    @IsOptional()
    @IsString()
    tokenName?: string;

    @IsOptional()
    @IsString()
    ownerWalletAddress?: string;

    @IsOptional()
    @IsString()
    tokenStandard?: string; // "ERC20" | "ERC721" | "ERC1155"

    @IsOptional()
    @IsString()
    transactionHash?: string;

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    tokenId?: number;

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    rentCollected?: number;

    @IsOptional()
    @IsString()
    rentDistributionTxHash?: string;
}

export class UpdatePropertyDto extends PartialType(CreatePropertyDto) {}
