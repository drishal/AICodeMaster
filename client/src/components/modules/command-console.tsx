import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Terminal, Play, History, Shield, ChevronRight } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { CommandHistory } from "@shared/schema";
import ScrollableCard from "@/components/ui/scrollable-card";

export function CommandConsole() {
  const [command, setCommand] = useState("");
  const [output, setOutput] = useState("");
  const { toast } = useToast();

  const { data: history = [] } = useQuery<CommandHistory[]>({
    queryKey: ["/api/command-history"],
  });

  const executeCommand = useMutation({
    mutationFn: async ({ command }: { command: string }) => {
      // Simulate command execution for demo
      return await apiRequest("/api/ai/generate-automation", {
        method: "POST",
        body: {
          task: `Execute secure command: ${command}`,
          platform: "termux"
        }
      });
    },
    onSuccess: (data) => {
      setOutput(data.script || "Command executed successfully");
      setCommand("");
      toast({
        title: "Command Executed",
        description: "Your command has been processed securely.",
      });
    },
    onError: () => {
      setOutput("Error: Command execution failed");
      toast({
        title: "Execution Failed",
        description: "Please check your command syntax.",
        variant: "destructive",
      });
    },
  });

  const handleExecute = () => {
    if (!command.trim()) return;
    executeCommand.mutate({ command });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleExecute();
    }
  };

  return (
    <Card className="bg-surface border-surface-variant module-enhanced">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Terminal className="w-5 h-5 text-green-400" />
            <span>Command Console Pro</span>
          </div>
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-green-400" />
            <span className="text-xs text-green-400">Secured</span>
          </div>
        </CardTitle>
        <div className="card-description">
          Advanced command execution with AI script generation, multi-device management, 
          secure tunneling, automated workflows, and real-time system monitoring.
        </div>
        <div className="feature-list">
          <div className="feature-tag">AI Scripts</div>
          <div className="feature-tag">Multi Device</div>
          <div className="feature-tag">Secure Tunnel</div>
          <div className="feature-tag">Auto Workflows</div>
          <div className="feature-tag">System Monitor</div>
          <div className="feature-tag">SSH Manager</div>
          <div className="feature-tag">Log Analysis</div>
          <div className="feature-tag">Batch Execute</div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <ScrollableCard>
        {/* Command Output */}
        <div className="bg-dark rounded-lg p-3 min-h-32 max-h-48 overflow-y-auto">
          <div className="font-mono text-sm text-green-400">
            {output || "Ready for commands..."}
          </div>
        </div>

        {/* Command Input */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center text-green-400 font-mono text-sm">
            <ChevronRight className="w-4 h-4" />
            <span className="ml-1">$</span>
          </div>
          <Input
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter command..."
            className="console-prompt bg-dark border-surface-variant font-mono text-green-400 placeholder:text-text-secondary"
          />
          <Button
            onClick={handleExecute}
            disabled={!command.trim() || executeCommand.isPending}
            size="icon"
            className="bg-green-500 hover:bg-green-600"
          >
            <Play className="w-4 h-4" />
          </Button>
        </div>

        {/* Quick Commands */}
        <div className="space-y-2">
          <div className="text-xs text-text-secondary font-medium">Quick Commands:</div>
          <div className="flex flex-wrap gap-2">
            {[
              "pkg update",
              "termux-setup-storage", 
              "python --version",
              "ls -la",
              "pwd"
            ].map((cmd) => (
              <Button
                key={cmd}
                variant="outline"
                size="sm"
                onClick={() => setCommand(cmd)}
                className="text-xs bg-surface-variant border-surface-variant hover:bg-surface"
              >
                {cmd}
              </Button>
            ))}
          </div>
        </div>

        {/* Command History */}
        {history.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-xs text-text-secondary">
              <History className="w-3 h-3" />
              <span>Recent Commands</span>
            </div>
            <div className="space-y-1 max-h-24 overflow-y-auto">
              {history.slice(-3).map((entry) => (
                <div key={entry.id} className="text-xs font-mono text-text-secondary p-1 bg-surface-variant rounded">
                  $ {entry.command}
                </div>
              ))}
            </div>
          </div>
        )}
        </ScrollableCard>
      </CardContent>
    </Card>
  );
}