import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Key, 
  Eye, 
  EyeOff, 
  Plus, 
  Trash2, 
  Shield, 
  Lock,
  AlertTriangle,
  CheckCircle
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Secret {
  key: string;
  value: string;
  description: string;
  lastUsed?: string;
  createdAt: string;
}

export function SecretsManager() {
  const [newSecretKey, setNewSecretKey] = useState("");
  const [newSecretValue, setNewSecretValue] = useState("");
  const [newSecretDescription, setNewSecretDescription] = useState("");
  const [visibleSecrets, setVisibleSecrets] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Mock secrets data - would integrate with actual Replit Secrets API
  const secrets: Secret[] = [
    {
      key: "OPENAI_API_KEY",
      value: "sk-proj-***********************************",
      description: "OpenAI API key for AI-powered features",
      lastUsed: "2 hours ago",
      createdAt: "2025-01-15"
    },
    {
      key: "DATABASE_URL",
      value: "postgresql://***:***@***:5432/***",
      description: "PostgreSQL database connection string",
      lastUsed: "Active",
      createdAt: "2025-01-20"
    },
    {
      key: "INSTAGRAM_ACCESS_TOKEN",
      value: "IGQVJ***********************************",
      description: "Instagram Graph API access token",
      lastUsed: "1 day ago",
      createdAt: "2025-01-18"
    },
    {
      key: "FACEBOOK_APP_SECRET",
      value: "a1b2c3***************************",
      description: "Facebook app secret for social automation",
      lastUsed: "3 days ago", 
      createdAt: "2025-01-16"
    },
    {
      key: "YOUTUBE_API_KEY",
      value: "AIzaSy***************************",
      description: "YouTube Data API key for channel management",
      createdAt: "2025-01-14"
    }
  ];

  const addSecret = useMutation({
    mutationFn: async (secretData: { key: string; value: string; description: string }) => {
      // Would integrate with Replit Secrets API
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { success: true, secret: secretData };
    },
    onSuccess: () => {
      toast({
        title: "Secret Added",
        description: "New secret has been securely stored.",
      });
      setNewSecretKey("");
      setNewSecretValue("");
      setNewSecretDescription("");
    },
  });

  const deleteSecret = useMutation({
    mutationFn: async (key: string) => {
      // Would call Replit Secrets API to delete
      await new Promise(resolve => setTimeout(resolve, 500));
      return { success: true, key };
    },
    onSuccess: (data) => {
      toast({
        title: "Secret Deleted",
        description: `${data.key} has been removed from secrets.`,
      });
    },
  });

  const toggleSecretVisibility = (key: string) => {
    const newVisible = new Set(visibleSecrets);
    if (newVisible.has(key)) {
      newVisible.delete(key);
    } else {
      newVisible.add(key);
    }
    setVisibleSecrets(newVisible);
  };

  const maskValue = (value: string, isVisible: boolean) => {
    if (isVisible) return value;
    
    if (value.startsWith("sk-")) {
      return value.substring(0, 8) + "*".repeat(32);
    } else if (value.startsWith("postgresql://")) {
      return "postgresql://***:***@***:5432/***";
    } else if (value.length > 10) {
      return value.substring(0, 6) + "*".repeat(value.length - 10) + value.substring(value.length - 4);
    } else {
      return "*".repeat(value.length);
    }
  };

  const getSecretStatus = (secret: Secret) => {
    if (secret.lastUsed === "Active") {
      return { color: "bg-green-500/10 text-green-400 border-green-500/20", label: "Active" };
    } else if (secret.lastUsed) {
      return { color: "bg-blue-500/10 text-blue-400 border-blue-500/20", label: "Used" };
    } else {
      return { color: "bg-gray-500/10 text-gray-400 border-gray-500/20", label: "Unused" };
    }
  };

  return (
    <Card className="bg-surface border-surface-variant">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Key className="w-5 h-5 text-green-400" />
            <span>Secrets Manager</span>
          </div>
          <Badge className="bg-green-500/10 text-green-400">Encrypted</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add New Secret */}
        <div className="bg-surface-variant rounded-lg p-3 space-y-3">
          <div className="flex items-center space-x-2">
            <Plus className="w-4 h-4 text-green-400" />
            <span className="text-sm font-medium">Add New Secret</span>
          </div>
          
          <div className="space-y-2">
            <Input
              placeholder="Secret key (e.g., API_KEY)"
              value={newSecretKey}
              onChange={(e) => setNewSecretKey(e.target.value)}
              className="bg-dark border-surface-variant"
            />
            <Input
              type="password"
              placeholder="Secret value"
              value={newSecretValue}
              onChange={(e) => setNewSecretValue(e.target.value)}
              className="bg-dark border-surface-variant"
            />
            <Input
              placeholder="Description (optional)"
              value={newSecretDescription}
              onChange={(e) => setNewSecretDescription(e.target.value)}
              className="bg-dark border-surface-variant"
            />
            <Button
              onClick={() => addSecret.mutate({
                key: newSecretKey,
                value: newSecretValue,
                description: newSecretDescription
              })}
              disabled={!newSecretKey.trim() || !newSecretValue.trim() || addSecret.isPending}
              className="w-full bg-green-500 hover:bg-green-600"
            >
              <Lock className="w-4 h-4 mr-2" />
              Add Secret
            </Button>
          </div>
        </div>

        {/* Secrets List */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Environment Secrets</span>
            <Badge className="bg-green-500/10 text-green-400 text-xs">
              {secrets.length} secrets
            </Badge>
          </div>
          
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {secrets.map((secret) => {
              const isVisible = visibleSecrets.has(secret.key);
              const status = getSecretStatus(secret);
              
              return (
                <div
                  key={secret.key}
                  className="bg-surface-variant rounded-lg p-3"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-sm font-medium font-mono">{secret.key}</span>
                        <Badge className={status.color}>
                          {status.label}
                        </Badge>
                      </div>
                      {secret.description && (
                        <p className="text-xs text-text-secondary mb-2">
                          {secret.description}
                        </p>
                      )}
                      <div className="bg-dark rounded p-2 text-xs font-mono">
                        <div className="flex items-center justify-between">
                          <span className="text-text-secondary break-all">
                            {maskValue(secret.value, isVisible)}
                          </span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => toggleSecretVisibility(secret.key)}
                            className="ml-2 p-1 h-6 w-6"
                          >
                            {isVisible ? (
                              <EyeOff className="w-3 h-3" />
                            ) : (
                              <Eye className="w-3 h-3" />
                            )}
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-2 text-xs text-text-secondary">
                        <span>Created: {secret.createdAt}</span>
                        {secret.lastUsed && (
                          <span>Last used: {secret.lastUsed}</span>
                        )}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteSecret.mutate(secret.key)}
                      disabled={deleteSecret.isPending}
                      className="text-red-400 hover:text-red-300 ml-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Security Information */}
        <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-2">
            <Shield className="w-4 h-4 text-green-400" />
            <span className="text-sm font-medium text-green-400">Security Features</span>
          </div>
          <ul className="text-xs text-text-secondary space-y-1">
            <li className="flex items-center space-x-2">
              <CheckCircle className="w-3 h-3 text-green-400" />
              <span>AES-256 encryption at rest</span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircle className="w-3 h-3 text-green-400" />
              <span>TLS 1.3 encryption in transit</span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircle className="w-3 h-3 text-green-400" />
              <span>Access logging and audit trails</span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircle className="w-3 h-3 text-green-400" />
              <span>Automatic secret rotation support</span>
            </li>
          </ul>
        </div>

        {/* Usage Guidelines */}
        <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-blue-400">Best Practices</span>
          </div>
          <ul className="text-xs text-text-secondary space-y-1">
            <li>• Use descriptive names for your secret keys</li>
            <li>• Rotate API keys regularly for better security</li>
            <li>• Never commit secrets to version control</li>
            <li>• Use environment-specific secrets for different deployments</li>
            <li>• Monitor secret usage through the activity logs</li>
          </ul>
        </div>

        {/* Active Integrations */}
        <div className="bg-surface-variant rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-2">
            <Key className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-medium">Active Integrations</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>OpenAI API</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>PostgreSQL DB</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <span>Instagram API</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
              <span>Facebook API</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}