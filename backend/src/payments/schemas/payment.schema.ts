import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PaymentDocument = Payment & Document;

@Schema({ timestamps: true })
export class Payment {
    @Prop({ required: true })
    userId: string;

    @Prop({ required: true })
    propertyId: string;

    @Prop({ required: true })
    amount: number;

    @Prop({ required: true, enum: ['rent', 'token_purchase', 'dividend'] })
    type: string;

    @Prop({ default: 'pending', enum: ['pending', 'completed', 'failed', 'cancelled'] })
    status: string;

    @Prop()
    description: string;

    @Prop()
    transactionHash: string;

    @Prop({ default: Date.now })
    createdAt: Date;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);