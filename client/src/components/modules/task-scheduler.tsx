import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, Play, Pause, Calendar, CheckCircle, AlertCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { ScheduledTask } from "@shared/schema";

export function TaskScheduler() {
  const [taskName, setTaskName] = useState("");
  const [cronExpression, setCronExpression] = useState("");
  const [taskType, setTaskType] = useState("command");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: tasks = [], isLoading } = useQuery<ScheduledTask[]>({
    queryKey: ["/api/scheduled-tasks"],
  });

  const createTask = useMutation({
    mutationFn: async (taskData: any) => {
      const res = await apiRequest("/api/scheduled-tasks", {
        method: "POST",
        body: taskData
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/scheduled-tasks"] });
      setTaskName("");
      setCronExpression("");
      toast({
        title: "Task Scheduled",
        description: "Your automated task has been created successfully.",
      });
    },
  });

  const quickSchedules = [
    { label: "Every Hour", cron: "0 * * * *" },
    { label: "Daily at 9 AM", cron: "0 9 * * *" },
    { label: "Every Monday", cron: "0 9 * * 1" },
    { label: "Twice Daily", cron: "0 9,18 * * *" }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <Play className="w-3 h-3 text-green-400" />;
      case "paused":
        return <Pause className="w-3 h-3 text-orange-400" />;
      case "completed":
        return <CheckCircle className="w-3 h-3 text-blue-400" />;
      default:
        return <AlertCircle className="w-3 h-3 text-red-400" />;
    }
  };

  const handleCreateTask = () => {
    if (!taskName.trim() || !cronExpression.trim()) return;
    
    createTask.mutate({
      name: taskName,
      type: taskType,
      cronExpression,
      command: taskType === "command" ? taskName : null,
      status: "active"
    });
  };

  return (
    <Card className="bg-surface border-surface-variant">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-purple-400" />
            <span>Task Scheduler + Execution</span>
          </div>
          <Badge className="bg-purple-500/10 text-purple-400">Cron-based</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Create New Task */}
        <div className="bg-surface-variant rounded-lg p-3 space-y-3">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium">Schedule New Task</span>
          </div>
          
          <div className="grid grid-cols-1 gap-2">
            <Input
              placeholder="Task name or command..."
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              className="bg-dark border-surface-variant"
            />
            <div className="grid grid-cols-2 gap-2">
              <Select value={taskType} onValueChange={setTaskType}>
                <SelectTrigger className="bg-dark border-surface-variant">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="command">Terminal Command</SelectItem>
                  <SelectItem value="api">API Call</SelectItem>
                  <SelectItem value="social">Social Media Post</SelectItem>
                  <SelectItem value="email">Email Campaign</SelectItem>
                </SelectContent>
              </Select>
              <Input
                placeholder="Cron expression..."
                value={cronExpression}
                onChange={(e) => setCronExpression(e.target.value)}
                className="bg-dark border-surface-variant"
              />
            </div>
          </div>
          
          <div className="flex flex-wrap gap-1">
            {quickSchedules.map((schedule) => (
              <Button
                key={schedule.label}
                variant="outline"
                size="sm"
                onClick={() => setCronExpression(schedule.cron)}
                className="text-xs bg-surface border-surface-variant hover:bg-surface-variant"
              >
                {schedule.label}
              </Button>
            ))}
          </div>
          
          <Button 
            onClick={handleCreateTask}
            disabled={!taskName.trim() || !cronExpression.trim() || createTask.isPending}
            className="w-full bg-purple-500 hover:bg-purple-600"
          >
            <Clock className="w-4 h-4 mr-2" />
            Schedule Task
          </Button>
        </div>

        {/* Scheduled Tasks List */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Active Tasks</span>
            <Badge className="bg-purple-500/10 text-purple-400 text-xs">
              {tasks.length} scheduled
            </Badge>
          </div>
          
          {isLoading ? (
            <div className="text-text-secondary text-sm">Loading tasks...</div>
          ) : tasks.length === 0 ? (
            <div className="text-center text-text-secondary py-4">
              <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No scheduled tasks yet</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-surface-variant rounded-lg p-3 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-purple-500/20 rounded flex items-center justify-center">
                      {getStatusIcon(task.status)}
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">{task.name}</h4>
                      <p className="text-xs text-text-secondary">
                        {task.cronExpression} • {task.type}
                        {task.lastRun && ` • Last: ${new Date(task.lastRun).toLocaleDateString()}`}
                      </p>
                    </div>
                  </div>
                  <Badge variant={task.status === "active" ? "default" : "secondary"} className="text-xs">
                    {task.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* System Status */}
        <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-1">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span className="text-sm font-medium text-green-400">Scheduler Status</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-text-secondary">Active Tasks: </span>
              <span className="font-medium text-green-400">{tasks.filter(t => t.status === 'active').length}</span>
            </div>
            <div>
              <span className="text-text-secondary">Next Run: </span>
              <span className="font-medium text-green-400">2 minutes</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}