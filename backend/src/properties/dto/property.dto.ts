import { IsString, IsNumber, IsOptional, IsArray, IsPositive, IsNotEmpty, IsBoolean, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import { PartialType } from '@nestjs/mapped-types';

export class CreatePropertyDto {
    @IsString() @IsNotEmpty()
    title: string;

    @IsString() @IsNotEmpty()
    location: string;

    @IsString() @IsNotEmpty()
    description: string;

    @IsNumber() @IsPositive() @Type(() => Number)
    valuation: number;

    @IsNumber() @IsPositive() @Type(() => Number)
    monthlyRent: number;

    @IsNumber() @IsPositive() @Type(() => Number)
    expectedYield: number;

    @IsNumber() @IsPositive() @Type(() => Number)
    tokenPercentage: number;

    @IsNumber() @IsPositive() @Type(() => Number)
    tokenPrice: number;

    @IsNumber() @IsPositive() @Type(() => Number)
    totalTokens: number;

    @IsNumber() @IsPositive() @Type(() => Number)
    tokensForSale: number;

    @IsOptional() @IsArray() @IsString({ each: true })
    images?: string[];

    @IsOptional() @IsArray() @IsString({ each: true })
    documents?: string[];

    // Workflow flags
    @IsOptional() @IsBoolean()
    isPublished?: boolean;

    // Blockchain fields (filled after deployment)
    @IsOptional() @IsString()
    contractAddress?: string;

    @IsOptional() @IsString()
    network?: string;

    @IsOptional() @IsString()
    tokenSymbol?: string;

    @IsOptional() @IsString()
    tokenName?: string;

    @IsOptional() @IsString()
    ownerWalletAddress?: string;

    @IsOptional() @IsString()
    tokenStandard?: string;

    @IsOptional() @IsString()
    transactionHash?: string;

    @IsOptional() @IsNumber() @Type(() => Number)
    tokenId?: number;

    // Marketplace fields
    @IsOptional() @IsBoolean()
    isListed?: boolean;

    @IsOptional() @IsNumber() @Type(() => Number)
    listingPrice?: number;

    @IsOptional() @IsIn(['FULL_PROPERTY', 'FRACTIONAL_TOKENS'])
    listingType?: 'FULL_PROPERTY' | 'FRACTIONAL_TOKENS';

    @IsOptional() @IsNumber() @Type(() => Number)
    listingAmount?: number;

    @IsOptional() @IsString()
    listingExpiresAt?: string;
}

export class UpdatePropertyDto extends PartialType(CreatePropertyDto) {}

export class PublishPropertyDto {
    @IsOptional() @IsString()
    ownerWalletAddress?: string;
}

export class ListPropertyDto {
    @IsNumber() @Type(() => Number)
    listingPrice: number;

    @IsString() @IsIn(['FULL_PROPERTY', 'FRACTIONAL_TOKENS'])
    listingType: 'FULL_PROPERTY' | 'FRACTIONAL_TOKENS';

    @IsOptional() @IsNumber() @Type(() => Number)
    listingAmount?: number;

    @IsOptional() @IsString()
    listingExpiresAt?: string;
}
