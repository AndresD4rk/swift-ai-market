
import React, { useState } from 'react';
import { Send, X, Bot, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Message {
  id: number;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface AIAssistantProps {
  isOpen: boolean;
  onToggle: () => void;
}

const AIAssistant = ({ isOpen, onToggle }: AIAssistantProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hello! I'm your AI shopping assistant. I can help you find the perfect products, compare features, and answer any questions you have about our futuristic marketplace. What are you looking for today?",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: messages.length + 1,
      text: inputMessage,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: messages.length + 2,
        text: getAIResponse(inputMessage),
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  const getAIResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();
    
    if (input.includes('neural') || input.includes('brain')) {
      return "The Neural Interface Headset is our top-rated brain-computer interface! It offers seamless digital interaction with a 4.8-star rating. Perfect for productivity and gaming. Would you like to know more about its features?";
    } else if (input.includes('quantum') || input.includes('processor')) {
      return "Our Quantum Processing Unit is revolutionary! It provides ultra-fast computing with quantum acceleration. Great for AI development and complex calculations. It's priced at $1,299.99. Interested in the technical specifications?";
    } else if (input.includes('display') || input.includes('holographic')) {
      return "The Holographic Display is amazing! It features 360-degree viewing angles and stunning 3D visualization. Perfect for presentations and entertainment. Would you like to see similar products or learn about installation?";
    } else if (input.includes('cheap') || input.includes('budget')) {
      return "For budget-friendly options, I recommend the Wireless Power Hub at $199.99 or the Smart Biometric Scanner at $349.99. Both offer great value and excellent reviews. Which type of product interests you most?";
    } else if (input.includes('recommend') || input.includes('suggest')) {
      return "Based on our trending products, I'd recommend starting with the AI Voice Assistant ($449.99) for smart home integration, or the Neural Interface Headset ($899.99) for cutting-edge tech. What's your primary use case?";
    } else {
      return "I understand you're interested in our products! Our marketplace features cutting-edge technology from neural interfaces to quantum processors. Could you tell me more about what you're looking for? I can help you find the perfect match!";
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
      <div className="fixed right-6 top-1/2 transform -translate-y-1/2 w-96 h-[600px] animate-slide-in-right">
        <Card className="h-full bg-slate-900/95 backdrop-blur-xl border-cyan-500/30 shadow-2xl shadow-cyan-500/20">
          <CardHeader className="bg-gradient-to-r from-cyan-500/20 to-blue-600/20 border-b border-cyan-500/30">
            <div className="flex items-center justify-between">
              <CardTitle className="text-white flex items-center">
                <Bot className="w-5 h-5 mr-2 text-cyan-400" />
                AI Assistant
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggle}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="p-0 flex flex-col h-[calc(100%-80px)]">
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-2xl ${
                        message.isUser
                          ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                          : 'bg-slate-800 text-slate-100'
                      }`}
                    >
                      <div className="flex items-start space-x-2">
                        {!message.isUser && (
                          <Bot className="w-4 h-4 mt-1 text-cyan-400 flex-shrink-0" />
                        )}
                        {message.isUser && (
                          <User className="w-4 h-4 mt-1 text-white flex-shrink-0" />
                        )}
                        <div className="text-sm">{message.text}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            
            <div className="p-4 border-t border-slate-700">
              <form onSubmit={handleSendMessage} className="flex space-x-2">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Ask me about products..."
                  className="bg-slate-800 border-slate-600 text-white placeholder-slate-400"
                />
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AIAssistant;
