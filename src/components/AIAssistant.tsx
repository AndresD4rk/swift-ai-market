
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
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "¡Hola! Soy tu asistente de compras con IA. Puedo ayudarte a encontrar productos perfectos, comparar características y responder cualquier pregunta sobre nuestro marketplace futurista. También puedes hablarme usando el botón de micrófono. ¿Qué estás buscando hoy?",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const [speechSupported, setSpeechSupported] = useState(false);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  const supportsSpeech = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
  console.log("Soporte SpeechRecognition:", supportsSpeech);

  useEffect(() => {
    console.log('Inicializando Web Speech API...');
    
    // Verificar soporte para reconocimiento de voz
    const hasWebkitSpeech = 'webkitSpeechRecognition' in window;
    const hasSpeech = 'SpeechRecognition' in window;
    
    console.log('Soporte webkitSpeechRecognition:', hasWebkitSpeech);
    console.log('Soporte SpeechRecognition:', hasSpeech);
    
    if (hasWebkitSpeech || hasSpeech) {
      setSpeechSupported(true);
      
      try {
        const SpeechRecognitionConstructor = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognitionInstance = new SpeechRecognitionConstructor();
        
        recognitionInstance.lang = 'es-ES';
        recognitionInstance.continuous = false;
        recognitionInstance.interimResults = false;
        recognitionInstance.maxAlternatives = 1;

        recognitionInstance.onstart = () => {
          console.log('Reconocimiento de voz iniciado');
          setIsListening(true);
        };

        recognitionInstance.onresult = (event) => {
          console.log('Resultado de reconocimiento:', event.results);
          const transcript = event.results[0][0].transcript;
          console.log('Texto transcrito:', transcript);
          setInputMessage(transcript);
          setIsListening(false);
          
          // Enviar automáticamente el mensaje transcrito
          setTimeout(() => {
            handleSendMessage(null, transcript);
          }, 100);
        };

        recognitionInstance.onerror = (event) => {
          console.error('Error de reconocimiento de voz:', event.error);
          console.error('Mensaje de error:', event.message);
          setIsListening(false);
          
          if (event.error === 'network') {
            console.log('Error de red - reintentando en 2 segundos...');
            setTimeout(() => {
              if (recognition && !isListening) {
                try {
                  recognition.start();
                } catch (e) {
                  console.error('Error al reintentar:', e);
                }
              }
            }, 2000);
          }
        };

        recognitionInstance.onend = () => {
          console.log('Reconocimiento de voz terminado');
          setIsListening(false);
        };

        recognitionInstance.onnomatch = () => {
          console.log('No se pudo reconocer el audio');
          setIsListening(false);
        };

        recognitionInstance.onsoundstart = () => {
          console.log('Sonido detectado');
        };

        recognitionInstance.onspeechstart = () => {
          console.log('Habla detectada');
        };

        recognitionInstance.onspeechend = () => {
          console.log('Habla terminada');
        };

        setRecognition(recognitionInstance);
        console.log('Reconocimiento de voz configurado correctamente');
      } catch (error) {
        console.error('Error al configurar reconocimiento de voz:', error);
        setSpeechSupported(false);
      }
    } else {
      console.log('Web Speech API no soportada en este navegador');
      setSpeechSupported(false);
    }

    // Inicializar síntesis de voz
    if ('speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
      console.log('Síntesis de voz disponible');
    } else {
      console.log('Síntesis de voz no disponible');
    }

    return () => {
      if (recognition) {
        try {
          recognition.stop();
        } catch (e) {
          console.log('Error al detener reconocimiento:', e);
        }
      }
    };
  }, []);

  const startListening = () => {
    console.log('Intentando iniciar escucha...');
    if (recognition && !isListening && speechSupported) {
      try {
        recognition.start();
      } catch (error) {
        console.error('Error al iniciar reconocimiento:', error);
        setIsListening(false);
      }
    } else {
      console.log('No se puede iniciar la escucha:', {
        recognition: !!recognition,
        isListening,
        speechSupported
      });
    }
  };

  const stopListening = () => {
    console.log('Deteniendo escucha...');
    if (recognition && isListening) {
      try {
        recognition.stop();
      } catch (error) {
        console.error('Error al detener reconocimiento:', error);
      }
    }
  };

  const speakText = (text: string) => {
    if (synthRef.current) {
      console.log('Hablando texto:', text);
      // Cancelar cualquier síntesis en curso
      synthRef.current.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'es-ES';
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      
      utterance.onstart = () => console.log('Iniciando síntesis de voz');
      utterance.onend = () => console.log('Síntesis de voz terminada');
      utterance.onerror = (e) => console.error('Error en síntesis de voz:', e);
      
      synthRef.current.speak(utterance);
    } else {
      console.log('Síntesis de voz no disponible');
    }
  };

  const handleSendMessage = (e: React.FormEvent | null, voiceText?: string) => {
    if (e) e.preventDefault();
    
    const messageText = voiceText || inputMessage;
    if (!messageText.trim()) return;

    console.log('Enviando mensaje:', messageText);

    const userMessage: Message = {
      id: messages.length + 1,
      text: messageText,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');

    // Simular respuesta de IA
    setTimeout(() => {
      const aiResponse: Message = {
        id: messages.length + 2,
        text: getAIResponse(messageText),
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
      
      // Leer la respuesta en voz alta
      setTimeout(() => {
        speakText(aiResponse.text);
      }, 500);
    }, 1000);
  };

  const getAIResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();
    
    if (input.includes('neural') || input.includes('interfaz') || input.includes('cerebro')) {
      return "¡El Casco de Interfaz Neural es nuestro producto mejor calificado! Ofrece interacción digital perfecta con una calificación de 4.8 estrellas. Perfecto para productividad y juegos. ¿Te gustaría saber más sobre sus características?";
    } else if (input.includes('quantum') || input.includes('cuántico') || input.includes('procesador')) {
      return "¡Nuestra Unidad de Procesamiento Cuántico es revolucionaria! Proporciona computación ultra-rápida con aceleración cuántica. Genial para desarrollo de IA y cálculos complejos. Tiene un precio de $1,299.99. ¿Te interesan las especificaciones técnicas?";
    } else if (input.includes('display') || input.includes('pantalla') || input.includes('holográfico')) {
      return "¡La Pantalla Holográfica es increíble! Cuenta con ángulos de visión de 360 grados y visualización 3D impresionante. Perfecta para presentaciones y entretenimiento. ¿Te gustaría ver productos similares o aprender sobre la instalación?";
    } else if (input.includes('barato') || input.includes('económico') || input.includes('presupuesto')) {
      return "Para opciones económicas, recomiendo el Hub de Energía Inalámbrico a $199.99 o el Escáner Biométrico Inteligente a $349.99. Ambos ofrecen gran valor y excelentes reseñas. ¿Qué tipo de producto te interesa más?";
    } else if (input.includes('recomienda') || input.includes('sugiere') || input.includes('qué me aconsejas')) {
      return "Basándome en nuestros productos populares, recomendaría empezar con el Asistente de Voz IA ($449.99) para integración de hogar inteligente, o el Casco de Interfaz Neural ($899.99) para tecnología de vanguardia. ¿Cuál es tu caso de uso principal?";
    } else {
      return "¡Entiendo que estás interesado en nuestros productos! Nuestro marketplace cuenta con tecnología de vanguardia desde interfaces neurales hasta procesadores cuánticos. ¿Podrías contarme más sobre lo que buscas? ¡Puedo ayudarte a encontrar la opción perfecta!";
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
                Asistente IA
                {speechSupported && <span className="ml-2 text-xs text-green-400">🎙️</span>}
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
                  placeholder="Escribe o habla tu mensaje..."
                  className="bg-slate-800 border-slate-600 text-white placeholder-slate-400"
                />
                {speechSupported && (
                  <Button
                    type="button"
                    onClick={isListening ? stopListening : startListening}
                    className={`${
                      isListening 
                        ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                        : 'bg-green-500 hover:bg-green-600'
                    } transition-all duration-300`}
                    title={isListening ? 'Detener grabación' : '🎙️ Hablar'}
                  >
                    {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </Button>
                )}
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
              {isListening && (
                <div className="mt-2 text-center">
                  <span className="text-sm text-cyan-400 animate-pulse">🎙️ Escuchando...</span>
                </div>
              )}
              {!speechSupported && (
                <div className="mt-2 text-center">
                  <span className="text-xs text-yellow-400">Reconocimiento de voz no disponible</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const getAIResponse = (userInput: string): string => {
  const input = userInput.toLowerCase();
  
  if (input.includes('neural') || input.includes('interfaz') || input.includes('cerebro')) {
    return "¡El Casco de Interfaz Neural es nuestro producto mejor calificado! Ofrece interacción digital perfecta con una calificación de 4.8 estrellas. Perfecto para productividad y juegos. ¿Te gustaría saber más sobre sus características?";
  } else if (input.includes('quantum') || input.includes('cuántico') || input.includes('procesador')) {
    return "¡Nuestra Unidad de Procesamiento Cuántico es revolucionaria! Proporciona computación ultra-rápida con aceleración cuántica. Genial para desarrollo de IA y cálculos complejos. Tiene un precio de $1,299.99. ¿Te interesan las especificaciones técnicas?";
  } else if (input.includes('display') || input.includes('pantalla') || input.includes('holográfico')) {
    return "¡La Pantalla Holográfica es increíble! Cuenta con ángulos de visión de 360 grados y visualización 3D impresionante. Perfecta para presentaciones y entretenimiento. ¿Te gustaría ver productos similares o aprender sobre la instalación?";
  } else if (input.includes('barato') || input.includes('económico') || input.includes('presupuesto')) {
    return "Para opciones económicas, recomiendo el Hub de Energía Inalámbrico a $199.99 o el Escáner Biométrico Inteligente a $349.99. Ambos ofrecen gran valor y excelentes reseñas. ¿Qué tipo de producto te interesa más?";
  } else if (input.includes('recomienda') || input.includes('sugiere') || input.includes('qué me aconsejas')) {
    return "Basándome en nuestros productos populares, recomendaría empezar con el Asistente de Voz IA ($449.99) para integración de hogar inteligente, o el Casco de Interfaz Neural ($899.99) para tecnología de vanguardia. ¿Cuál es tu caso de uso principal?";
  } else {
    return "¡Entiendo que estás interesado en nuestros productos! Nuestro marketplace cuenta con tecnología de vanguardia desde interfaces neurales hasta procesadores cuánticos. ¿Podrías contarme más sobre lo que buscas? ¡Puedo ayudarte a encontrar la opción perfecta!";
  }
};

export default AIAssistant;
