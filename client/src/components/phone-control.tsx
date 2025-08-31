import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Smartphone, Mail, Image, Folder, Globe, Circle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { AutomationTask } from "@shared/schema";

export function PhoneControl() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: tasks = [], isLoading } = useQuery<AutomationTask[]>({
    queryKey: ["/api/automation-tasks"],
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await apiRequest(`/api/automation-tasks/${id}`, {
        method: "PUT",
        body: { status }
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/automation-tasks"] });
      toast({
        title: "Task Updated",
        description: "Automation task status has been updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "success";
      case "scanning":
        return "warning";
      case "error":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getTaskIcon = (type: string) => {
    switch (type) {
      case "messages":
        return <Mail className="w-4 h-4" />;
      case "gallery":
        return <Image className="w-4 h-4" />;
      case "file-cleanup":
        return <Folder className="w-4 h-4" />;
      case "browser-bot":
        return <Globe className="w-4 h-4" />;
      default:
        return <Circle className="w-4 h-4" />;
    }
  };

  const toggleTaskStatus = (task: AutomationTask) => {
    const newStatus = task.status === "active" ? "idle" : "active";
    updateTaskMutation.mutate({ id: task.id, status: newStatus });
  };

  if (isLoading) {
    return (
      <Card className="bg-surface border-surface-variant">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="text-text-secondary">Loading automation tasks...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-surface border-surface-variant">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Smartphone className="w-5 h-5 text-secondary" />
            <span>Phone Automation</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-success rounded-full mr-2" />
            <span className="text-xs text-success">Connected</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="bg-surface-variant rounded-lg p-3 border border-surface-variant hover:border-primary/50 transition-colors cursor-pointer"
              onClick={() => toggleTaskStatus(task)}
            >
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-6 h-6 bg-blue-500/20 text-blue-400 rounded-lg flex items-center justify-center">
                  {getTaskIcon(task.type)}
                </div>
                <h3 className="font-medium text-sm">{task.name}</h3>
              </div>
              <p className="text-xs text-text-secondary mb-2">{task.description}</p>
              <div className="flex items-center justify-between">
                <Badge 
                  variant={getStatusColor(task.status) as any}
                  className="text-xs"
                >
                  <Circle className="w-1 h-1 mr-1" />
                  {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                </Badge>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-xs p-1 h-auto"
                  disabled={updateTaskMutation.isPending}
                >
                  {task.status === "active" ? "Stop" : "Start"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
