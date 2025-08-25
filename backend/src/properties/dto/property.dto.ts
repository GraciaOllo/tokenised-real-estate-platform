import { IsString, IsNumber, IsOptional, IsArray, IsPositive, IsUUID, IsNotEmpty } from 'class-validator';
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
    images?: string[];

    @IsOptional()
    @IsArray()
    documents?: string[];

    @IsOptional()
    @IsUUID()
    ownerId?: string;

    @IsOptional()
    @IsString()
    ownerName?: string;
}

export class UpdatePropertyDto extends PartialType(CreatePropertyDto) {}