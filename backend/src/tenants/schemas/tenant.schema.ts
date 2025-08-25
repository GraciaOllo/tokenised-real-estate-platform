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
    amount: { type: Number },
    status: { type: String, enum: ['paid', 'pending', 'overdue'] },
    paymentMethod: String,
    reference: String
  }], default: [] })
  paymentHistory: Record<string, any>[];

  @Prop({ type: [{
    date: Date,
    description: String,
    status: { type: String, enum: ['submitted', 'in-progress', 'completed', 'rejected'] },
    priority: { type: String, enum: ['low', 'medium', 'high'] }
  }], default: [] })
  maintenanceRequests: Record<string, any>[];

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