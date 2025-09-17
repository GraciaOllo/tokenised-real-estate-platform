import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message, MessageDocument } from './schemas/message.schema';
import { Conversation, ConversationDocument } from './schemas/conversation.schema';

@Injectable()
export class ChatService {
constructor(
@InjectModel(Message.name) private messageModel: Model<MessageDocument>,
@InjectModel(Conversation.name) private conversationModel: Model<ConversationDocument>,
) {}

async createMessage(messageData: any): Promise<Message> {
const message = new this.messageModel(messageData);
return message.save();
}

async getConversations(userId: string): Promise<Conversation[]> {
return this.conversationModel
    .find({ participants: userId })
    .populate('lastMessage')
    .exec();
}

async getMessages(conversationId: string): Promise<Message[]> {
return this.messageModel
    .find({ conversationId })
    .sort({ timestamp: 1 })
    .exec();
}

async getOrCreateConversation(userId1: string, userId2: string): Promise<Conversation> {
let conversation = await this.conversationModel.findOne({
    participants: { $all: [userId1, userId2] },
});

if (!conversation) {
    conversation = new this.conversationModel({
    participants: [userId1, userId2],
    });
    await conversation.save();
}

return conversation;
}
}
