import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Code, Copy, Lightbulb, Wand2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function CodeEditor() {
  const [code, setCode] = useState(`# AI-Generated Python Script
import os
import requests

def automate_phone_cleanup():
    """AI-generated function for phone cleanup"""
    print("Phone cleanup automation started...")
    # Implementation ready for customization
    return True

if __name__ == "__main__":
    automate_phone_cleanup()`);
  
  const [language, setLanguage] = useState("python");
  const [filename, setFilename] = useState("main.py");
  const [explanation, setExplanation] = useState("");
  const { toast } = useToast();

  const explainCodeMutation = useMutation({
    mutationFn: async ({ code, language }: { code: string; language: string }) => {
      return await apiRequest("/api/ai/explain-code", { 
        method: "POST", 
        body: { code, language } 
      });
    },
    onSuccess: (data) => {
      setExplanation(data.explanation);
      toast({
        title: "Code Explained",
        description: "AI has analyzed your code.",
      });
    },
    onError: (error) => {
      toast({
        title: "Explanation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Copied to Clipboard",
      description: "Code has been copied for use in Termux.",
    });
  };

  const formatCode = () => {
    // Simple code formatting
    const formatted = code
      .split('\n')
      .map(line => line.trimRight())
      .join('\n');
    setCode(formatted);
    toast({
      title: "Code Formatted",
      description: "Your code has been formatted.",
    });
  };

  const explainCode = () => {
    if (!code.trim()) return;
    explainCodeMutation.mutate({ code, language });
  };

  const getFileExtension = (lang: string) => {
    const extensions: Record<string, string> = {
      python: "py",
      javascript: "js",
      java: "java",
      cpp: "cpp",
      shell: "sh"
    };
    return extensions[lang] || "txt";
  };

  const updateFilename = (lang: string) => {
    const extension = getFileExtension(lang);
    const baseName = filename.split('.')[0];
    setFilename(`${baseName}.${extension}`);
  };

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    updateFilename(newLanguage);
  };

  return (
    <Card className="bg-surface border-surface-variant">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Code className="w-5 h-5 text-accent" />
            <span>Code Editor</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Select value={language} onValueChange={handleLanguageChange}>
              <SelectTrigger className="w-32 bg-surface-variant border-surface-variant">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="python">Python</SelectItem>
                <SelectItem value="javascript">JavaScript</SelectItem>
                <SelectItem value="java">Java</SelectItem>
                <SelectItem value="cpp">C++</SelectItem>
                <SelectItem value="shell">Shell</SelectItem>
              </SelectContent>
            </Select>
            
            <Button 
              size="sm"
              onClick={formatCode}
              className="bg-primary hover:bg-primary/80"
            >
              <Wand2 className="w-3 h-3 mr-1" />
              Format
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Editor Interface */}
        <div className="bg-dark rounded-lg border border-surface-variant overflow-hidden">
          {/* Editor Toolbar */}
          <div className="flex items-center justify-between px-3 py-2 bg-surface-variant border-b border-surface-variant">
            <div className="flex items-center space-x-2">
              <div className="flex space-x-1">
                <div className="w-3 h-3 bg-red-500 rounded-full" />
                <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                <div className="w-3 h-3 bg-green-500 rounded-full" />
              </div>
              <span className="text-xs text-text-secondary font-mono">{filename}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={copyToClipboard}
                className="p-1 h-auto text-text-secondary hover:text-text-primary"
                title="Copy to Termux"
              >
                <Copy className="w-3 h-3" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={explainCode}
                disabled={explainCodeMutation.isPending}
                className="p-1 h-auto text-text-secondary hover:text-text-primary"
                title="AI Explain"
              >
                <Lightbulb className="w-3 h-3" />
              </Button>
            </div>
          </div>
          
          {/* Code Area */}
          <div className="relative">
            <div className="absolute left-0 top-0 w-12 bg-surface-variant border-r border-surface-variant">
              {/* Line numbers */}
              <div className="p-3 text-xs font-mono text-text-secondary space-y-1">
                {code.split('\n').map((_, index) => (
                  <div key={index}>{index + 1}</div>
                ))}
              </div>
            </div>
            
            <Textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full pl-16 p-3 bg-transparent border-none outline-none resize-none text-sm font-mono text-text-primary min-h-64 focus-visible:ring-0"
              style={{ fontSize: '13px', lineHeight: '1.5' }}
            />
          </div>
        </div>
        
        {/* AI Explanation Panel */}
        {explanation && (
          <div className="mt-3 p-3 bg-primary/5 border border-primary/20 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Lightbulb className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">AI Code Explanation</span>
            </div>
            <p className="text-sm text-text-secondary">{explanation}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
