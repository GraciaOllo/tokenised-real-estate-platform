import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

export enum UserRole {
ADMIN = 'admin',
INVESTOR = 'investor',
TENANT = 'tenant',
MANAGER = 'manager',
}

@Schema({ timestamps: true })
export class User {
@Prop({ required: true })
name: string;

@Prop({ required: true, unique: true })
email: string;

@Prop({ required: true })
password: string;

@Prop({ required: true, enum: UserRole })
role: UserRole;

@Prop({ type: [String], default: [] })
walletAddresses: string[];
 // or whatever index you want

@Prop({ default: true })
isActive: boolean;

@Prop({ default: false })
isVerified: boolean; // KYC completed

@Prop({ type: [String], default: [] })
documents: string[]; // uploaded KYC files

@Prop({ type: [String], default: [] })
investedProperties: string[]; // property IDs (DB) for investors

@Prop({ type: [String], default: [] })
rentedProperties: string[]; // property IDs for tenants

@Prop()
phone: string;
    save: any;
    _id: any;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Password hashing pre-save hook (NestJS + Mongoose)
import * as bcrypt from 'bcryptjs';

UserSchema.pre<UserDocument>('save', async function (next) {
if (!this.isModified('password')) return next();
this.password = await bcrypt.hash(this.password, 10);
next();
});
