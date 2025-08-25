# Tenant Management System Implementation Plan

## Backend Implementation

### 1. Tenant Schema (tenant.schema.ts)
```typescript
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TenantDocument = Tenant & Document;

@Schema({ timestamps: true })
export class Tenant {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Property' })
  propertyId: Types.ObjectId;

  @Prop({ required: true })
  leaseStartDate: Date;

  @Prop({ required: true })
  leaseEndDate: Date;

  @Prop({ required: true })
  monthlyRent: number;

  @Prop({ required: true })
  depositAmount: number;

  @Prop({ type: [{
    date: Date,
    amount: number,
    status: { type: String, enum: ['paid', 'pending', 'overdue'] },
    paymentMethod: String,
    reference: String
  }], default: [] })
  paymentHistory: any[];

  @Prop({ type: [{
    date: Date,
    description: String,
    status: { type: String, enum: ['submitted', 'in-progress', 'completed', 'rejected'] },
    priority: { type: String, enum: ['low', 'medium', 'high'] }
  }], default: [] })
  maintenanceRequests: any[];

  @Prop()
  emergencyContact: string;

  @Prop()
  occupation: string;

  @Prop()
  employer: string;

  @Prop({ default: 'active', enum: ['active', 'inactive', 'terminated'] })
  status: string;
}

export const TenantSchema = SchemaFactory.createForClass(Tenant);
```

### 2. Tenant DTOs (dto/tenant.dto.ts)
```typescript
import { IsString, IsNumber, IsDate, IsOptional, IsEnum } from 'class-validator';

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

  @IsString()
  @IsOptional()
  emergencyContact?: string;

  @IsString()
  @IsOptional()
  occupation?: string;

  @IsString()
  @IsOptional()
  employer?: string;
}

export class UpdateTenantDto {
  @IsString()