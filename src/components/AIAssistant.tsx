
import React, { useState, useEffect, useRef } from 'react';
import { Send, X, Bot, User, Mic, MicOff } from 'lucide-react';
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
  const [messages, setMessages] = useState<Message[]>([{
    id: 1,
    text: "¡Hola! Soy tu asistente de compras con IA... ¿Qué estás buscando hoy?",
    isUser: false,
    timestamp: new Date()
  }]);
  const [inputMessage, setInputMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const messageIdRef = useRef(messages.length);

  // Inicialización
  useEffect(() => {
    // Verificar soporte de APIs de voz
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
        
        // Mostrar mensaje de error específico
        if (event.error === 'not-allowed') {
          addSystemMessage('Permiso de micrófono denegado. Por favor, permite el acceso al micrófono.');
        } else if (event.error === 'no-speech') {
          addSystemMessage('No se detectó voz. Intenta hablar más claro.');
        } else {
          addSystemMessage(`Error de reconocimiento de voz: ${event.error}`);
        }
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

  const addSystemMessage = (text: string) => {
    const systemMessage: Message = {
      id: ++messageIdRef.current,
      text,
      isUser: false,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, systemMessage]);
  };

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
    if (!recognitionRef.current || isListening || isProcessing) {
      console.log('Cannot start listening:', { 
        hasRecognition: !!recognitionRef.current, 
        isListening, 
        isProcessing 
      });
      return;
    }

    try {
      console.log('Starting speech recognition...');
      recognitionRef.current.start();
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      addSystemMessage('Error al iniciar el reconocimiento de voz. Intenta de nuevo.');
    }
  };

  const stopListening = () => {
    if (!recognitionRef.current || !isListening) return;
    
    console.log('Stopping speech recognition...');
    recognitionRef.current.stop();
  };

  const generateAIResponse = async (userMessage: string): Promise<string> => {
    // Simulación de respuesta de IA basada en palabras clave
    const message = userMessage.toLowerCase();
    
    if (message.includes('hola') || message.includes('buenos días') || message.includes('buenas tardes')) {
      return '¡Hola! ¿En qué puedo ayudarte hoy? Estoy aquí para asistirte con tus compras.';
    }
    
    if (message.includes('producto') || message.includes('busco') || message.includes('necesito')) {
      return 'Perfecto, puedo ayudarte a encontrar productos. ¿Qué tipo de artículo estás buscando específicamente?';
    }
    
    if (message.includes('precio') || message.includes('costo') || message.includes('vale')) {
      return 'Te puedo ayudar con información de precios. ¿De qué producto te gustaría conocer el precio?';
    }
    
    if (message.includes('gracias')) {
      return '¡De nada! ¿Hay algo más en lo que pueda ayudarte?';
    }
    
    if (message.includes('adiós') || message.includes('hasta luego')) {
      return '¡Hasta luego! Que tengas un excelente día.';
    }
    
    // Respuesta genérica
    return `Entiendo que mencionas "${userMessage}". ¿Podrías darme más detalles sobre lo que necesitas? Estoy aquí para ayudarte con tus compras.`;
  };

  const handleSendMessage = async (e: React.FormEvent | null, transcriptText?: string) => {
    if (e) e.preventDefault();
    
    const text = (transcriptText || inputMessage).trim();
    if (!text) return;

    setIsProcessing(true);

    const userMessage: Message = {
      id: ++messageIdRef.current,
      text,
      isUser: true,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');

    try {
      // Generar respuesta de IA
      const aiResponseText = await generateAIResponse(text);
      
      // Simular delay de procesamiento
      setTimeout(() => {
        const aiMessage: Message = {
          id: ++messageIdRef.current,
          text: aiResponseText,
          isUser: false,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, aiMessage]);
        
        // Hablar la respuesta si la síntesis de voz está disponible
        speakText(aiResponseText);
        setIsProcessing(false);
      }, 1000);
      
    } catch (error) {
      console.error('Error generating AI response:', error);
      addSystemMessage('Lo siento, hubo un error procesando tu mensaje. Intenta de nuevo.');
      setIsProcessing(false);
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
              {isProcessing && (
                <div className="flex justify-start mb-2">
                  <div className="max-w-[80%] p-3 rounded-2xl bg-slate-800 text-white">
                    <div className="flex items-start space-x-2">
                      <Bot className="w-4 h-4 mt-1 text-cyan-400" />
                      <div className="text-sm animate-pulse">Escribiendo...</div>
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
                  disabled={isProcessing}
                />
                {speechSupported && (
                  <Button
                    type="button"
                    onClick={isListening ? stopListening : startListening}
                    className={`${isListening ? 'bg-red-500 animate-pulse' : 'bg-green-500'} `}
                    title={isListening ? 'Detener grabación' : '🎙️ Hablar'}
                    disabled={isProcessing}
                  >
                    {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </Button>
                )}
                <Button 
                  type="submit" 
                  className="bg-gradient-to-r from-cyan-500 to-blue-600"
                  disabled={isProcessing}
                >
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
