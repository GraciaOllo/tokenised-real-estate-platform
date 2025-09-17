import {
WebSocketGateway,
WebSocketServer,
SubscribeMessage,
MessageBody,
ConnectedSocket,
OnGatewayConnection,
OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

interface ChatMessage {
senderId: string;
receiverId: string;
message: string;
timestamp?: string;
}

@WebSocketGateway({
cors: {
origin: '*', // adjust origin to your frontend URL in production
methods: ['GET', 'POST'],
},
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
@WebSocketServer()
server: Server;

// Map userId to socketId
private users = new Map<string, string>();

handleConnection(client: Socket) {
const userId = client.handshake.query.userId as string;
if (userId) {
    this.users.set(userId, client.id);
    client.join(userId); // join a private room per user
    console.log(`User connected: ${userId} - socketId: ${client.id}`);
}
}

handleDisconnect(client: Socket) {
for (const [userId, socketId] of this.users.entries()) {
    if (socketId === client.id) {
    this.users.delete(userId);
    console.log(`User disconnected: ${userId}`);
    break;
    }
}
}

@SubscribeMessage('sendMessage')
handleMessage(@MessageBody() data: ChatMessage) {
const { senderId, receiverId, message } = data;
const timestamp = new Date().toISOString();

// Send message to receiver if online
const receiverSocketId = this.users.get(receiverId);
if (receiverSocketId) {
    this.server.to(receiverSocketId).emit('message', {
    senderId,
    receiverId,
    message,
    timestamp,
    });
}

// Also emit back to sender to confirm
const senderSocketId = this.users.get(senderId);
if (senderSocketId) {
    this.server.to(senderSocketId).emit('message', {
    senderId,
    receiverId,
    message,
    timestamp,
    });
}
}
}
