
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSessionManager } from './useSessionManager';

interface Message {
  id: number;
  text: string;
  isUser: boolean;
  timestamp: Date;
  contextProducts?: any[];
}

interface UseGeminiChatReturn {
  messages: Message[];
  isLoading: boolean;
  sendMessage: (message: string) => Promise<void>;
  clearMessages: () => void;
}

export const useGeminiChat = (): UseGeminiChatReturn => {
  const [messages, setMessages] = useState<Message[]>([{
    id: 1,
    text: "¡Hola! Soy tu asistente de compras con IA. Puedo ayudarte a encontrar productos perfectos para ti. ¿Qué estás buscando hoy?",
    isUser: false,
    timestamp: new Date()
  }]);
  const [isLoading, setIsLoading] = useState(false);
  const { startSession, updateActivity } = useSessionManager();

  const sendMessage = useCallback(async (messageText: string) => {
    if (!messageText.trim() || isLoading) return;

    setIsLoading(true);
    updateActivity(); // Registrar actividad del usuario

    // Add user message
    const userMessage: Message = {
      id: Date.now(),
      text: messageText,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);

    try {
      // Build chat history for context
      const chatHistory = messages.map(msg => ({
        text: msg.text,
        isUser: msg.isUser
      }));

      // Call Gemini chat function
      const { data, error } = await supabase.functions.invoke('gemini-chat', {
        body: {
          message: messageText,
          chatHistory: chatHistory
        }
      });

      if (error) {
        throw error;
      }

      // Create sessions for products that meet similarity threshold
      if (data.contextProducts && data.contextProducts.length > 0) {
        const relevantProducts = data.contextProducts.filter((product: any) => 
          product.similarity >= 0.7
        );
        
        // Create sessions for relevant products
        for (const product of relevantProducts) {
          await startSession(product.id);
        }
      }

      // Add AI response
      const aiMessage: Message = {
        id: Date.now() + 1,
        text: data.response || 'Lo siento, no pude procesar tu mensaje.',
        isUser: false,
        timestamp: new Date(),
        contextProducts: data.contextProducts || []
      };

      setMessages(prev => [...prev, aiMessage]);

    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add error message
      const errorMessage: Message = {
        id: Date.now() + 1,
        text: 'Lo siento, hubo un error procesando tu mensaje. Por favor intenta de nuevo.',
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [messages, isLoading, startSession, updateActivity]);

  const clearMessages = useCallback(() => {
    setMessages([{
      id: 1,
      text: "¡Hola! Soy tu asistente de compras con IA. Puedo ayudarte a encontrar productos perfectos para ti. ¿Qué estás buscando hoy?",
      isUser: false,
      timestamp: new Date()
    }]);
  }, []);

  return {
    messages,
    isLoading,
    sendMessage,
    clearMessages
  };
};
