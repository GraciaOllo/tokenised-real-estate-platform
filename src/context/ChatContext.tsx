// src/context/ChatContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface ChatMessage {
senderId: string;
receiverId: string;
message: string;
timestamp: string;
}

interface ChatContextType {
socket: Socket | null;
messages: ChatMessage[];
sendMessage: (receiverId: string, message: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = (): ChatContextType => {
const context = useContext(ChatContext);
if (!context) throw new Error('useChat must be used within ChatProvider');
return context;
};

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
const { user } = useAuth();
const [socket, setSocket] = useState<Socket | null>(null);
const [messages, setMessages] = useState<ChatMessage[]>([]);

useEffect(() => {
if (!user) return;

const newSocket = io('http://localhost:3001', {
    query: { userId: user.id },
    transports: ['websocket'],
});

setSocket(newSocket);

newSocket.on('connect', () => {
    console.log('Socket connected:', newSocket.id);
});

newSocket.on('message', (message: ChatMessage) => {
    setMessages((prev) => [...prev, message]);
});

newSocket.on('disconnect', () => {
    console.log('Socket disconnected');
    setSocket(null);
});

return () => {
    newSocket.disconnect();
};
}, [user]);

const sendMessage = (receiverId: string, message: string) => {
if (!socket || !user) return;
socket.emit('sendMessage', {
    senderId: user.id,
    receiverId,
    message,
});
};

return (
<ChatContext.Provider value={{ socket, messages, sendMessage }}>
    {children}
</ChatContext.Provider>
);
};
