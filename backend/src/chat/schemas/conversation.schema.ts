import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ConversationDocument = Conversation & Document;

@Schema({ timestamps: true })
export class Conversation {
@Prop({ type: [String], required: true })
participants: string[];

@Prop({ type: Types.ObjectId, ref: 'Message' })
lastMessage: Types.ObjectId;

@Prop({ default: 0 })
unreadCount: number;
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);