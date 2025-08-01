'use client';

import { useState } from 'react';
import { 
  MessageCircle, 
  Send, 
  X, 
  Bot,
  User
} from 'lucide-react';

interface ChatMessage {
  id: string;
  message: string;
  isUser: boolean;
  timestamp: Date;
}

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      message: 'Hello! I\'m your MedRoom assistant. I can help you with room reservations, check availability, answer questions about equipment, and more. How can I assist you today?',
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');

  const handleSendMessage = () => {
    if (inputMessage.trim() === '') return;

    const newUserMessage: ChatMessage = {
      id: Date.now().toString(),
      message: inputMessage,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newUserMessage]);
    setInputMessage('');

    // Simulate bot response
    setTimeout(() => {
      const botResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        message: getBotResponse(inputMessage),
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
    }, 1000);
  };

  const getBotResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();
    
    if (message.includes('room') && message.includes('available')) {
      return 'I can help you check room availability! Currently, we have 2 consultation rooms and 1 emergency room available. Would you like me to show you specific details or help you make a reservation?';
    } else if (message.includes('reserve') || message.includes('book')) {
      return 'I\'d be happy to help you reserve a room! Please let me know: 1) What type of room do you need? 2) When would you like to reserve it? 3) How long will you need it?';
    } else if (message.includes('equipment')) {
      return 'Our rooms are equipped with various medical equipment. For example, Consultation Room A has an Examination Table, Blood Pressure Monitor, and Stethoscope. Which room\'s equipment would you like to know about?';
    } else if (message.includes('maintenance')) {
      return 'I can provide information about maintenance schedules. Currently, we have 2 pending maintenance tasks. The MRI Suite is currently under maintenance until tomorrow. Is there a specific room you\'d like to check?';
    } else if (message.includes('stock') || message.includes('inventory')) {
      return 'I can help with stock information! We currently have 2 items with low stock alerts: Syringes (45 remaining, minimum 50) and other supplies. Would you like details about specific items?';
    } else if (message.includes('hello') || message.includes('hi')) {
      return 'Hello! I\'m here to help with all your medical room management needs. You can ask me about room availability, make reservations, check equipment, maintenance schedules, or stock levels. What would you like to know?';
    } else {
      return 'I understand you\'re asking about medical room management. I can help with room reservations, availability checks, equipment information, maintenance schedules, and stock levels. Could you please be more specific about what you need help with?';
    }
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all duration-200 flex items-center justify-center z-40"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-80 h-96 bg-white rounded-xl shadow-xl border border-gray-200 flex flex-col z-40">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-blue-600 text-white rounded-t-xl">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              <span className="font-medium">MedRoom Assistant</span>
            </div>
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-2 ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!message.isUser && (
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-blue-600" />
                  </div>
                )}
                <div
                  className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                    message.isUser
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {message.message}
                </div>
                {message.isUser && (
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-gray-600" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type your message..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
              <button
                onClick={handleSendMessage}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}