
import React, { useState, useEffect, useRef } from 'react';
import { Send, X, Bot, User, Mic, MicOff, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useGeminiChat } from '@/hooks/useGeminiChat';
import ProductSuggestions from './ProductSuggestions';

interface AIAssistantProps {
  isOpen: boolean;
  onToggle: () => void;
}

const AIAssistant = ({ isOpen, onToggle }: AIAssistantProps) => {
  const { messages, isLoading, sendMessage, clearMessages } = useGeminiChat();
  const [inputMessage, setInputMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Initialize speech APIs
  useEffect(() => {
    const hasSpeechRecognition = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
    const hasSpeechSynthesis = 'speechSynthesis' in window;
    
    console.log('Speech Recognition support:', hasSpeechRecognition);
    console.log('Speech Synthesis support:', hasSpeechSynthesis);
    
    setSpeechSupported(hasSpeechRecognition && hasSpeechSynthesis);

    if (hasSpeechSynthesis) {
      synthRef.current = window.speechSynthesis;
    }

    if (hasSpeechRecognition) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'es-ES';
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        console.log('Speech recognition started');
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        console.log('Speech recognition result:', event.results);
        if (event.results.length > 0) {
          const transcript = event.results[0][0].transcript;
          console.log('Transcript:', transcript);
          setInputMessage(transcript);
          handleSendMessage(null, transcript);
        }
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        console.log('Speech recognition ended');
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [messages]);

  const speakText = (text: string) => {
    if (!synthRef.current) {
      console.log('Speech synthesis not supported');
      return;
    }

    console.log('Speaking:', text);
    synthRef.current.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES';
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 0.8;

    utterance.onstart = () => console.log('Speech synthesis started');
    utterance.onend = () => console.log('Speech synthesis ended');
    utterance.onerror = (event) => console.error('Speech synthesis error:', event);

    synthRef.current.speak(utterance);
  };

  const startListening = async () => {
    if (!recognitionRef.current || isListening || isLoading) {
      console.log('Cannot start listening:', { 
        hasRecognition: !!recognitionRef.current, 
        isListening, 
        isLoading 
      });
      return;
    }

    try {
      console.log('Starting speech recognition...');
      recognitionRef.current.start();
    } catch (error) {
      console.error('Error starting speech recognition:', error);
    }
  };

  const stopListening = () => {
    if (!recognitionRef.current || !isListening) return;
    
    console.log('Stopping speech recognition...');
    recognitionRef.current.stop();
  };

  const handleSendMessage = async (e: React.FormEvent | null, transcriptText?: string) => {
    if (e) e.preventDefault();
    
    const text = (transcriptText || inputMessage).trim();
    if (!text || isLoading) return;

    await sendMessage(text);
    setInputMessage('');

    // Speak the AI response (only for the latest message)
    setTimeout(() => {
      const latestMessage = messages[messages.length - 1];
      if (latestMessage && !latestMessage.isUser) {
        speakText(latestMessage.text);
      }
    }, 500);
  };

  const handleClearChat = () => {
    clearMessages();
    if (synthRef.current) {
      synthRef.current.cancel();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
      <div className="fixed right-6 top-1/2 transform -translate-y-1/2 w-96 h-[600px] animate-slide-in-right">
        <Card className="h-full bg-slate-900/95 border-cyan-500/30 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-cyan-500/20 to-blue-600/20 border-b border-cyan-500/30">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center text-white">
                <Bot className="w-5 h-5 mr-2 text-cyan-400" />
                Asistente de Compras IA
                {speechSupported && <span className="ml-2 text-xs text-green-400">🎙️</span>}
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleClearChat}
                  className="text-slate-400 hover:text-white"
                  title="Limpiar chat"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={onToggle} 
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0 flex flex-col h-[calc(100%-80px)]">
            <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
              {messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'} mb-4`}>
                  <div className={`max-w-[85%] p-3 rounded-2xl ${msg.isUser ? 'bg-cyan-500/80 text-white' : 'bg-slate-800 text-white'}`}>
                    <div className="flex items-start space-x-2">
                      {msg.isUser ? <User className="w-4 h-4 mt-1 text-white" /> : <Bot className="w-4 h-4 mt-1 text-cyan-400" />}
                      <div className="text-sm">{msg.text}</div>
                    </div>
                    {!msg.isUser && msg.contextProducts && msg.contextProducts.length > 0 && (
                      <ProductSuggestions products={msg.contextProducts} />
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start mb-4">
                  <div className="max-w-[80%] p-3 rounded-2xl bg-slate-800 text-white">
                    <div className="flex items-start space-x-2">
                      <Bot className="w-4 h-4 mt-1 text-cyan-400" />
                      <div className="text-sm animate-pulse">Buscando productos y generando respuesta...</div>
                    </div>
                  </div>
                </div>
              )}
            </ScrollArea>

            <div className="p-4 border-t border-slate-700">
              <form onSubmit={handleSendMessage} className="flex space-x-2">
                <Input
                  value={inputMessage}
                  onChange={e => setInputMessage(e.target.value)}
                  placeholder="Escribe o habla tu mensaje..."
                  className="bg-slate-800 border-slate-600 text-white"
                  disabled={isLoading}
                />
                {speechSupported && (
                  <Button
                    type="button"
                    onClick={isListening ? stopListening : startListening}
                    className={`${isListening ? 'bg-red-500 animate-pulse' : 'bg-green-500'} `}
                    title={isListening ? 'Detener grabación' : '🎙️ Hablar'}
                    disabled={isLoading}
                  >
                    {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </Button>
                )}
                <Button 
                  type="submit" 
                  className="bg-gradient-to-r from-cyan-500 to-blue-600"
                  disabled={isLoading}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
              {isListening && <div className="mt-2 text-center text-cyan-400 animate-pulse">🎙️ Escuchando...</div>}
              {!speechSupported && <div className="mt-2 text-center text-yellow-400 text-xs">Reconocimiento de voz no disponible</div>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AIAssistant;
