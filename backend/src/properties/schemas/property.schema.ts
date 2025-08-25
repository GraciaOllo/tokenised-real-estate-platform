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

    @Prop()
    contractAddress: string;

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
}

export const PropertySchema = SchemaFactory.createForClass(Property);