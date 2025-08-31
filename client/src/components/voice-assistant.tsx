import { useState, useRef, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mic, MicOff, Volume2, VolumeX, MessageSquare, Bot } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface VoiceCommand {
  command: string;
  response: string;
  timestamp: Date;
}

export function VoiceAssistant() {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [commands, setCommands] = useState<VoiceCommand[]>([]);
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef<any>(null);
  const speechSynthesisRef = useRef<SpeechSynthesis | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    // Check for speech recognition support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const lastResult = event.results[event.results.length - 1];
      if (lastResult.isFinal) {
        const command = lastResult[0].transcript;
        setTranscript(command);
        handleVoiceCommand(command);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      
      setIsListening(false);
      toast({
        title: "Voice Recognition Error",
        description: "Could not process voice command. Please try again.",
        variant: "destructive",
      });
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    speechSynthesisRef.current = window.speechSynthesis;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const processVoiceCommandMutation = useMutation({
    mutationFn: async (command: string) => {
      const res = await apiRequest("/api/ai/generate-code", {
        method: "POST",
        body: JSON.stringify({ 
          prompt: `Process this voice command and provide appropriate response: "${command}"`,
          language: "markdown",
          mode: "voice-assistant"
        })
      });
      return res;
    },
    onSuccess: (data: any, command: string) => {
      const newCommand: VoiceCommand = {
        command,
        response: data.explanation || data.code || "Command processed successfully",
        timestamp: new Date()
      };
      setCommands(prev => [newCommand, ...prev.slice(0, 4)]);
      
      // Speak the response
      if (speechSynthesisRef.current && !isSpeaking) {
        speakResponse(newCommand.response);
      }

      toast({
        title: "Voice Command Processed",
        description: "AI has processed your voice command.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Command Processing Error", 
        description: error?.message || "Failed to process voice command",
        variant: "destructive",
      });
    },
  });

  const handleVoiceCommand = (command: string) => {
    if (command.trim()) {
      processVoiceCommandMutation.mutate(command);
    }
  };

  const speakResponse = (text: string) => {
    if (!speechSynthesisRef.current) return;
    
    setIsSpeaking(true);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 0.8;
    
    utterance.onend = () => {
      setIsSpeaking(false);
    };
    
    utterance.onerror = () => {
      setIsSpeaking(false);
    };

    speechSynthesisRef.current.speak(utterance);
  };

  const startListening = () => {
    if (!isSupported || !recognitionRef.current) return;
    
    try {
      recognitionRef.current.start();
    } catch (error) {
      toast({
        title: "Voice Recognition Unavailable",
        description: "Please check microphone permissions.",
        variant: "destructive",
      });
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  const stopSpeaking = () => {
    if (speechSynthesisRef.current) {
      speechSynthesisRef.current.cancel();
    }
    setIsSpeaking(false);
  };

  if (!isSupported) {
    return (
      <Card className="bg-surface border-surface-variant">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MicOff className="w-5 h-5 text-gray-400" />
            <span>Voice Assistant</span>
            <Badge variant="secondary">Not Supported</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-text-secondary">
            Voice commands are not supported in this browser. Please use Chrome, Edge, or Safari.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="voice-assistant-container">
      <Card className="bg-surface border-surface-variant w-full max-w-full overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <Bot className="w-5 h-5 text-primary" />
            <span className="text-base sm:text-lg">Voice Assistant</span>
            <Badge className="bg-green-500/10 text-green-400 text-xs">
              {isListening ? "Listening..." : isSpeaking ? "Speaking..." : "Ready"}
            </Badge>
          </div>
          <div className="flex items-center space-x-1">
            <Button
              size="sm"
              variant={isListening ? "destructive" : "default"}
              onClick={isListening ? stopListening : startListening}
              disabled={processVoiceCommandMutation.isPending}
              className="text-xs px-2"
            >
              {isListening ? <MicOff className="w-3 h-3" /> : <Mic className="w-3 h-3" />}
            </Button>
            <Button
              size="sm"
              variant={isSpeaking ? "destructive" : "outline"}
              onClick={isSpeaking ? stopSpeaking : () => {}}
              disabled={!isSpeaking}
              className="text-xs px-2"
            >
              {isSpeaking ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 max-h-[350px] sm:max-h-[450px] overflow-y-auto scrollbar-hide">
        {transcript && (
          <div className="p-3 bg-surface-variant rounded-lg interactive-card">
            <p className="text-sm font-medium">Latest Command:</p>
            <p className="text-sm text-text-secondary">"{transcript}"</p>
          </div>
        )}

        <div className="space-y-3 max-h-60 overflow-y-auto scrollbar-hide">
          {commands.map((cmd, index) => (
            <div key={index} className="space-y-2 animate-fade-in">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
                  <MessageSquare className="w-3 h-3 text-white" />
                </div>
                <div className="flex-1 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2 interactive-card">
                  <p className="text-sm font-medium">You said:</p>
                  <p className="text-sm">"{cmd.command}"</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot className="w-3 h-3 text-white" />
                </div>
                <div className="flex-1 bg-surface-variant rounded-lg p-2">
                  <p className="text-sm">{cmd.response}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {commands.length === 0 && (
          <div className="text-center py-6 text-text-secondary">
            <Bot className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Click the microphone and say a command like:</p>
            <p className="text-xs mt-1">"Generate Python code" • "Open SEO manager" • "Show analytics"</p>
          </div>
        )}
      </CardContent>
    </Card>
    </div>
  );
}