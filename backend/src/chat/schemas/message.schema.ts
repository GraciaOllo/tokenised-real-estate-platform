import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type MessageDocument = Message & Document;

@Schema({ timestamps: true })
export class Message {
@Prop({ required: true })
senderId: string;

@Prop({ required: true })
receiverId: string;

@Prop({ required: true })
message: string;

@Prop({ default: false })
read: boolean;

@Prop({ required: true })
senderName: string;

@Prop({ required: true })
senderRole: string;

@Prop({ default: Date.now })
timestamp: Date;

@Prop()
conversationId: string;
}

export const MessageSchema = SchemaFactory.createForClass(Message);