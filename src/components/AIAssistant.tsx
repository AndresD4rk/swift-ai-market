
import React, { useState, useEffect, useRef } from 'react';
import { Send, X, Bot, User, Mic, MicOff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { GeminiLive } from '@google/gemini-live-sdk';

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
  const [messages, setMessages] = useState<Message[]>([{
    id: 1,
    text: "¡Hola! Soy tu asistente de compras con IA... ¿Qué estás buscando hoy?",
    isUser: false,
    timestamp: new Date()
  }]);
  const [inputMessage, setInputMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const geminiRef = useRef<any>(null);
  const messageIdRef = useRef(messages.length);

  // Inicialización
  useEffect(() => {
    const hasSpeechAPI = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
    setSpeechSupported(hasSpeechAPI);

    if ('speechSynthesis' in window) synthRef.current = window.speechSynthesis;

    // Configurar Gemini Live
    try {
      const gemini = new GeminiLive({
        apiKey: 'AIzaSyDqM1cWa2AscaIC79fChB4wMHziYiTa0iY',
        config: {
          languageCode: 'es-ES',
          enableVoiceInput: true,
          enableVoiceOutput: true
        }
      });

      gemini.on('response', (text: string) => {
        const aiMessage: Message = {
          id: ++messageIdRef.current,
          text,
          isUser: false,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMessage]);
        speakText(text);
      });

      geminiRef.current = gemini;
    } catch (e) {
      console.error('Error GeminiLive:', e);
    }

    return () => {
      if (geminiRef.current) geminiRef.current.destroy();
    };
  }, []);

  const speakText = (text: string) => {
    if (!synthRef.current) return;
    synthRef.current.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = 'es-ES'; utt.rate = 0.9; utt.pitch = 1;
    synthRef.current.speak(utt);
  };

  const startListening = () => {
    if (!geminiRef.current || isListening) return;
    geminiRef.current.start();
    setIsListening(true);
  };

  const stopListening = () => {
    if (!geminiRef.current || !isListening) return;
    geminiRef.current.stop();
    setIsListening(false);
  };

  const handleSendMessage = (e: React.FormEvent | null) => {
    if (e) e.preventDefault();
    const text = inputMessage.trim();
    if (!text || !geminiRef.current) return;

    const userMessage: Message = {
      id: ++messageIdRef.current,
      text,
      isUser: true,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');

    geminiRef.current.sendText(text);
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
                Asistente IA {speechSupported && <span className="ml-2 text-xs text-green-400">🎙️</span>}
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={onToggle} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-0 flex flex-col h-[calc(100%-80px)]">
            <ScrollArea className="flex-1 p-4">
              {messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'} mb-2`}>
                  <div className={`max-w-[80%] p-3 rounded-2xl ${msg.isUser ? 'bg-cyan-500/80 text-white' : 'bg-slate-800 text-white'}`}>
                    <div className="flex items-start space-x-2">
                      {msg.isUser ? <User className="w-4 h-4 mt-1 text-white" /> : <Bot className="w-4 h-4 mt-1 text-cyan-400" />}
                      <div className="text-sm">{msg.text}</div>
                    </div>
                  </div>
                </div>
              ))}
            </ScrollArea>

            <div className="p-4 border-t border-slate-700">
              <form onSubmit={handleSendMessage} className="flex space-x-2">
                <Input
                  value={inputMessage}
                  onChange={e => setInputMessage(e.target.value)}
                  placeholder="Escribe o habla tu mensaje..."
                  className="bg-slate-800 border-slate-600 text-white"
                />
                {speechSupported && (
                  <Button
                    type="button"
                    onClick={isListening ? stopListening : startListening}
                    className={`${isListening ? 'bg-red-500 animate-pulse' : 'bg-green-500'} `}
                    title={isListening ? 'Detener grabación' : '🎙️ Hablar'}
                  >
                    {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </Button>
                )}
                <Button type="submit" className="bg-gradient-to-r from-cyan-500 to-blue-600">
                  <Send className="w-4 h-4" />
                </Button>
              </form>
              {isListening && <div className="mt-2 text-center text-cyan-400 animate-pulse">🎙️ Escuchando...</div>}
              {!speechSupported && <div className="mt-2 text-center text-yellow-400">Reconocimiento de voz no disponible</div>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AIAssistant;
