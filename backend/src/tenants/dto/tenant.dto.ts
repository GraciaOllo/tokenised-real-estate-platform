import { IsString, IsNumber, IsDate, IsOptional, IsEnum, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class PaymentHistoryDto {
  @IsDate()
  date: Date;

  @IsNumber()
  amount: number;

  @IsString()
  @IsEnum(['paid', 'pending', 'overdue'])
  status: string;

  @IsString()
  @IsOptional()
  paymentMethod?: string;

  @IsString()
  @IsOptional()
  reference?: string;
}

class MaintenanceRequestDto {
  @IsDate()
  date: Date;

  @IsString()
  description: string;

  @IsString()
  @IsEnum(['submitted', 'in-progress', 'completed', 'rejected'])
  status: string;

  @IsString()
  @IsEnum(['low', 'medium', 'high'])
  priority: string;
}

export class CreateTenantDto {
  @IsString()
  userId: string;

  @IsString()
  @IsOptional()
  propertyId?: string;

  @IsDate()
  leaseStartDate: Date;

  @IsDate()
  leaseEndDate: Date;

  @IsNumber()
  monthlyRent: number;

  @IsNumber()
  depositAmount: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PaymentHistoryDto)
  @IsOptional()
  paymentHistory?: PaymentHistoryDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MaintenanceRequestDto)
  @IsOptional()
  maintenanceRequests?: MaintenanceRequestDto[];

  @IsString()
  @IsOptional()
  emergencyContact?: string;

  @IsString()
  @IsOptional()
  occupation?: string;

  @IsString()
  @IsOptional()
  employer?: string;

  @IsString()
  @IsEnum(['active', 'inactive', 'terminated'])
  @IsOptional()
  status?: string;
}

export class UpdateTenantDto {
  @IsString()
  @IsOptional()
  userId?: string;

  @IsString()
  @IsOptional()
  propertyId?: string;

  @IsDate()
  @IsOptional()
  leaseStartDate?: Date;

  @IsDate()
  @IsOptional()
  leaseEndDate?: Date;

  @IsNumber()
  @IsOptional()
  monthlyRent?: number;

  @IsNumber()
  @IsOptional()
  depositAmount?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PaymentHistoryDto)
  @IsOptional()
  paymentHistory?: PaymentHistoryDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MaintenanceRequestDto)
  @IsOptional()
  maintenanceRequests?: MaintenanceRequestDto[];

  @IsString()
  @IsOptional()
  emergencyContact?: string;

  @IsString()
  @IsOptional()
  occupation?: string;

  @IsString()
  @IsOptional()
  employer?: string;

  @IsString()
  @IsEnum(['active', 'inactive', 'terminated'])
  @IsOptional()
  status?: string;
}