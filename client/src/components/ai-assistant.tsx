import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bot, Send, Brain } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface CodeGenerationResponse {
  code: string;
  explanation: string;
  suggestions: string[];
}

export function AiAssistant() {
  const [prompt, setPrompt] = useState("");
  const [mode, setMode] = useState("code-generation");
  const [language, setLanguage] = useState("python");
  const [response, setResponse] = useState<CodeGenerationResponse | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const generateCodeMutation = useMutation({
    mutationFn: async ({ prompt, language, mode }: { prompt: string; language: string; mode: string }) => {
      const res = await apiRequest("/api/ai/generate-code", {
        method: "POST",
        body: JSON.stringify({ prompt, language, mode })
      });
      return res;
    },
    onSuccess: (data: CodeGenerationResponse) => {
      setResponse(data);
      queryClient.invalidateQueries({ queryKey: ["/api/ai/conversations"] });
      toast({
        title: "Code Generated",
        description: "AI has generated code based on your request.",
      });
    },
    onError: (error: any) => {
      const errorMessage = error?.message || "Failed to generate code";
      let userFriendlyMessage = errorMessage;
      
      // Let the actual error show without hardcoded fallback
      toast({
        title: "AI Generation Error",
        description: userFriendlyMessage,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!prompt.trim()) return;
    
    generateCodeMutation.mutate({ prompt, language, mode });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to Clipboard",
      description: "Code has been copied to your clipboard.",
    });
  };

  return (
    <Card className="bg-surface border-surface-variant h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <Brain className="w-4 h-4 text-primary" />
            <span className="text-lg">AI Assistant</span>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
            <Select value={mode} onValueChange={setMode}>
              <SelectTrigger className="w-full sm:w-40 bg-surface-variant border-surface-variant text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="code-generation">Code Generation</SelectItem>
                <SelectItem value="phone-automation">Phone Automation</SelectItem>
                <SelectItem value="file-management">File Management</SelectItem>
                <SelectItem value="browser-control">Browser Control</SelectItem>
              </SelectContent>
            </Select>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-full sm:w-28 bg-surface-variant border-surface-variant text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="python">Python</SelectItem>
                <SelectItem value="javascript">JavaScript</SelectItem>
                <SelectItem value="java">Java</SelectItem>
                <SelectItem value="shell">Shell</SelectItem>
                <SelectItem value="cpp">C++</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 max-h-[280px] overflow-y-auto scrollbar-hide">
        {/* AI Chat Interface */}
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <Bot className="w-3 h-3 text-white" />
            </div>
            <div className="flex-1 bg-surface-variant rounded-lg p-3">
              <p className="text-sm">
                Hello! I'm ready to help you with code generation, phone automation, and development tasks. 
                What would you like me to work on?
              </p>
            </div>
          </div>
          
          {response && (
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot className="w-3 h-3 text-white" />
                </div>
                <div className="flex-1 bg-surface-variant rounded-lg p-3">
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium">Generated Code:</h4>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(response.code)}
                        >
                          Copy
                        </Button>
                      </div>
                      <pre className="bg-dark p-3 rounded text-xs overflow-x-auto font-mono">
                        <code>{response.code}</code>
                      </pre>
                    </div>
                    
                    {response.explanation && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">Explanation:</h4>
                        <p className="text-sm text-text-secondary">{response.explanation}</p>
                      </div>
                    )}
                    
                    {response.suggestions && response.suggestions.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">Suggestions:</h4>
                        <ul className="space-y-1">
                          {response.suggestions.map((suggestion, index) => (
                            <li key={index} className="text-xs text-text-secondary flex items-center">
                              <span className="w-1 h-1 bg-primary rounded-full mr-2" />
                              {suggestion}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Input Area */}
        <div className="flex items-end space-x-2">
          <div className="flex-1">
            <Textarea
              placeholder="Describe what you want me to code or automate..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="bg-surface-variant border-surface-variant resize-none"
              rows={2}
            />
          </div>
          <Button 
            size="icon"
            onClick={handleSubmit}
            disabled={!prompt.trim() || generateCodeMutation.isPending}
            className="w-10 h-10 bg-primary hover:bg-primary/80"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
