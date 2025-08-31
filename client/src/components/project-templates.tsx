import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Layers, Download, Smartphone, Globe, Folder, Shield } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Project } from "@shared/schema";

export function ProjectTemplates() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: templates = [], isLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects/templates"],
  });

  const createProjectMutation = useMutation({
    mutationFn: async (template: Project) => {
      const res = await apiRequest("/api/projects", {
        method: "POST",
        body: {
          name: `${template.name} - Copy`,
          description: template.description,
          template: template.template,
          language: template.language,
          code: template.code,
          files: template.files,
          isTemplate: false
        }
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({
        title: "Template Applied",
        description: "Project created from template successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Creation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getTemplateIcon = (template: string) => {
    switch (template) {
      case "phone-automation":
        return <Smartphone className="w-5 h-5 text-blue-400" />;
      case "browser-automation":
        return <Globe className="w-5 h-5 text-purple-400" />;
      case "file-manager":
        return <Folder className="w-5 h-5 text-green-400" />;
      case "privacy-guardian":
        return <Shield className="w-5 h-5 text-red-400" />;
      default:
        return <Layers className="w-5 h-5 text-gray-400" />;
    }
  };

  const getLanguageColor = (language: string) => {
    switch (language) {
      case "python":
        return "bg-blue-500/10 text-blue-400";
      case "javascript":
        return "bg-yellow-500/10 text-yellow-400";
      case "java":
        return "bg-orange-500/10 text-orange-400";
      case "shell":
        return "bg-gray-500/10 text-gray-400";
      case "cpp":
        return "bg-green-500/10 text-green-400";
      default:
        return "bg-gray-500/10 text-gray-400";
    }
  };

  const copyCodeToClipboard = (code: string, name: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Code Copied",
      description: `${name} code has been copied to clipboard.`,
    });
  };

  if (isLoading) {
    return (
      <Card className="bg-surface border-surface-variant">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="text-text-secondary">Loading templates...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-surface border-surface-variant">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Layers className="w-5 h-5 text-purple-400" />
          <span>Project Templates</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {templates.map((template) => (
            <div
              key={template.id}
              className="bg-surface-variant rounded-lg p-4 border border-surface-variant hover:border-primary/50 transition-colors"
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  {getTemplateIcon(template.template)}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-sm">{template.name}</h3>
                  <p className="text-xs text-text-secondary">{template.description}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex space-x-1">
                  <Badge className={`text-xs ${getLanguageColor(template.language)}`}>
                    {template.language.charAt(0).toUpperCase() + template.language.slice(1)}
                  </Badge>
                  {template.template && (
                    <Badge className="text-xs bg-primary/10 text-primary">
                      {template.template.split('-').join(' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Badge>
                  )}
                </div>
                <div className="flex space-x-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyCodeToClipboard(template.code, template.name)}
                    className="text-xs p-1 h-auto text-text-secondary hover:text-text-primary"
                  >
                    Copy
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => createProjectMutation.mutate(template)}
                    disabled={createProjectMutation.isPending}
                    className="text-xs p-1 h-auto text-primary hover:text-primary/80"
                  >
                    <Download className="w-3 h-3 mr-1" />
                    Use
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
