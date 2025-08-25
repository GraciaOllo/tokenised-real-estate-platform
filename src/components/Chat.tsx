import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';

interface ChatProps {
isOpen: boolean;
onClose: () => void;
contactUserId?: string;
contactUserName?: string;
}

interface ChatMessage {
senderId: string;
receiverId: string;
message: string;
timestamp: string;
}

const Chat: React.FC<ChatProps> = ({ isOpen, onClose, contactUserId, contactUserName }) => {
const { user } = useAuth();
const { messages, sendMessage } = useChat();
const [input, setInput] = useState('');
const scrollRef = useRef<HTMLDivElement>(null);

// Filter messages between logged in user and contact user
const relevantMessages = messages.filter(
(msg) =>
    (msg.senderId === user?.id && msg.receiverId === contactUserId) ||
    (msg.receiverId === user?.id && msg.senderId === contactUserId)
);

// Auto-scroll to bottom on new messages
useEffect(() => {
scrollRef.current?.scrollTo({
    top: scrollRef.current.scrollHeight,
    behavior: 'smooth',
});
}, [relevantMessages]);

const handleSend = () => {
if (!input.trim() || !contactUserId || !user) return;
sendMessage(contactUserId, input.trim());
setInput('');
};

if (!isOpen || !contactUserId) return null;

return (
<div className="fixed bottom-20 right-4 w-96 max-w-full bg-white rounded-xl shadow-lg flex flex-col border border-gray-300 z-50">
    {/* Header */}
    <div className="flex items-center justify-between bg-emerald-600 text-white rounded-t-xl px-5 py-3">
    <h2 className="text-lg font-semibold truncate">{contactUserName || 'Chat'}</h2>
    <button
        onClick={onClose}
        aria-label="Close chat"
        className="text-white hover:text-gray-200 transition-colors"
    >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" >
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
    </button>
    </div>

    {/* Messages */}
    <div
    ref={scrollRef}
    className="flex-grow overflow-y-auto p-4 space-y-3 bg-gray-50 max-h-72"
    >
    {relevantMessages.length === 0 && (
        <p className="text-gray-500 text-center italic">No messages yet. Say hello!</p>
    )}

    {relevantMessages.map((msg, i) => {
        const isSender = msg.senderId === user?.id;
        return (
        <div
            key={i}
            className={`flex ${isSender ? 'justify-end' : 'justify-start'}`}
        >
            <div
            className={`rounded-lg px-4 py-2 max-w-[75%] whitespace-pre-wrap ${
                isSender
                ? 'bg-emerald-600 text-white rounded-tr-none'
                : 'bg-gray-200 text-gray-900 rounded-tl-none'
            }`}
            >
            <div>{msg.message}</div>
            <div className="text-xs text-gray-300 mt-1 text-right">
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
            </div>
        </div>
        );
    })}
    </div>

    {/* Input */}
    <div className="flex border-t border-gray-300 p-3">
    <input
        type="text"
        placeholder="Type your message..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        className="flex-grow border border-gray-300 rounded-l-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
    />
    <button
        onClick={handleSend}
        className="bg-emerald-600 text-white px-5 py-2 rounded-r-md hover:bg-emerald-700 transition-colors"
        aria-label="Send message"
    >
        Send
    </button>
    </div>
</div>
);
};

export default Chat;
