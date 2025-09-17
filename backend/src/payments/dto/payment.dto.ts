import { IsString, IsNumber, IsEnum, IsOptional, Min } from 'class-validator';

export enum PaymentType {
    RENT = 'rent',
    TOKEN_PURCHASE = 'token_purchase',
    DIVIDEND = 'dividend',
}

export enum PaymentStatus {
    PENDING = 'pending',
    COMPLETED = 'completed',
    FAILED = 'failed',
    CANCELLED = 'cancelled',
}

export class CreatePaymentDto {
        
    @IsString()
    propertyId: string;

    @IsNumber()
    @Min(0)
    amount: number;

    @IsEnum(PaymentType)
    type: PaymentType;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    transactionHash?: string;

    @IsOptional()
    @IsString()
    userId?: string;

    @IsOptional()
    @IsEnum(PaymentStatus)
    status?: PaymentStatus;
}