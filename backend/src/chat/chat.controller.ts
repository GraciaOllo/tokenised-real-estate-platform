import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
constructor(private readonly chatService: ChatService) {}

@Get('conversations/:userId')
async getConversations(@Param('userId') userId: string) {
return this.chatService.getConversations(userId);
}

@Get('messages/:conversationId')
async getMessages(@Param('conversationId') conversationId: string) {
return this.chatService.getMessages(conversationId);
}

@Post('conversations')
async getOrCreateConversation(@Body() body: { userId1: string; userId2: string }) {
const { userId1, userId2 } = body;
return this.chatService.getOrCreateConversation(userId1, userId2);
}
}
