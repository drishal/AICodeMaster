import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Cloud, 
  Database, 
  GitBranch, 
  Globe, 
  Key, 
  Monitor, 
  Package, 
  Play, 
  Settings, 
  Share,
  Terminal,
  Users,
  Zap
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ReplitProject {
  id: string;
  name: string;
  language: string;
  url: string;
  status: "running" | "stopped" | "deploying";
  created: string;
}

interface ReplitDeployment {
  id: string;
  name: string;
  url: string;
  status: "active" | "inactive" | "deploying";
  domain?: string;
}

export function ReplitIntegration() {
  const [activeTab, setActiveTab] = useState("overview");
  const [newProjectName, setNewProjectName] = useState("");
  const [deploymentConfig, setDeploymentConfig] = useState({
    name: "",
    environment: "production",
    autoDeploy: true
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Mock data for demonstration - would integrate with actual Replit API
  const projects: ReplitProject[] = [
    {
      id: "1",
      name: "MO APP DEVELOPMENT",
      language: "Node.js",
      url: "https://mo-app-development.replit.app",
      status: "running",
      created: "2025-01-20"
    },
    {
      id: "2", 
      name: "Python Content Automation",
      language: "Python",
      url: "https://python-automation.replit.app",
      status: "stopped",
      created: "2025-01-18"
    }
  ];

  const deployments: ReplitDeployment[] = [
    {
      id: "1",
      name: "mo-app-production",
      url: "https://mo-app-development-production.replit.app",
      status: "active",
      domain: "mo-development.com"
    }
  ];

  const createProject = useMutation({
    mutationFn: async (projectData: any) => {
      // Would integrate with Replit API
      return { success: true, project: projectData };
    },
    onSuccess: () => {
      toast({
        title: "Project Created",
        description: "New Replit project has been created successfully.",
      });
      setNewProjectName("");
    },
  });

  const deployProject = useMutation({
    mutationFn: async (deployData: any) => {
      // Would integrate with Replit Deployments API
      return { success: true, deployment: deployData };
    },
    onSuccess: () => {
      toast({
        title: "Deployment Started",
        description: "Your project is being deployed to production.",
      });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "running":
      case "active":
        return "bg-green-500/10 text-green-400 border-green-500/20";
      case "deploying":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "stopped":
      case "inactive":
        return "bg-gray-500/10 text-gray-400 border-gray-500/20";
      default:
        return "bg-gray-500/10 text-gray-400 border-gray-500/20";
    }
  };

  return (
    <Card className="bg-surface border-surface-variant">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Cloud className="w-5 h-5 text-blue-400" />
            <span>Replit Integration</span>
          </div>
          <Badge className="bg-blue-500/10 text-blue-400">Cloud Platform</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-surface-variant">
            <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
            <TabsTrigger value="projects" className="text-xs">Projects</TabsTrigger>
            <TabsTrigger value="deploy" className="text-xs">Deploy</TabsTrigger>
            <TabsTrigger value="features" className="text-xs">Features</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-surface-variant rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-2">
                  <Monitor className="w-4 h-4 text-green-400" />
                  <span className="text-sm font-medium">Active Projects</span>
                </div>
                <div className="text-2xl font-bold text-green-400">2</div>
                <p className="text-xs text-text-secondary">Running smoothly</p>
              </div>
              <div className="bg-surface-variant rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-2">
                  <Globe className="w-4 h-4 text-blue-400" />
                  <span className="text-sm font-medium">Deployments</span>
                </div>
                <div className="text-2xl font-bold text-blue-400">1</div>
                <p className="text-xs text-text-secondary">Production ready</p>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-medium">Available Replit Features</h4>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { icon: Database, name: "PostgreSQL DB", status: "active" },
                  { icon: Key, name: "Secrets Manager", status: "active" },
                  { icon: Terminal, name: "Online IDE", status: "active" },
                  { icon: Package, name: "Package Manager", status: "active" },
                  { icon: GitBranch, name: "Git Integration", status: "active" },
                  { icon: Users, name: "Collaboration", status: "available" }
                ].map((feature) => (
                  <div key={feature.name} className="flex items-center space-x-2 text-xs">
                    <feature.icon className="w-3 h-3 text-blue-400" />
                    <span>{feature.name}</span>
                    <Badge variant={feature.status === "active" ? "default" : "secondary"} className="text-xs py-0">
                      {feature.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="projects" className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Your Projects</h4>
                <Button size="sm" className="bg-blue-500 hover:bg-blue-600">
                  <Play className="w-3 h-3 mr-1" />
                  New Project
                </Button>
              </div>

              <div className="space-y-2">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className="bg-surface-variant rounded-lg p-3 flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-500/20 rounded flex items-center justify-center">
                        <Terminal className="w-4 h-4 text-blue-400" />
                      </div>
                      <div>
                        <h5 className="text-sm font-medium">{project.name}</h5>
                        <p className="text-xs text-text-secondary">
                          {project.language} • Created {project.created}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(project.status)}>
                        {project.status}
                      </Badge>
                      <Button size="sm" variant="outline">
                        <Share className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-surface-variant rounded-lg p-3">
              <h5 className="text-sm font-medium mb-2">Create New Project</h5>
              <div className="space-y-2">
                <Input
                  placeholder="Project name..."
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="bg-dark border-surface-variant"
                />
                <Select defaultValue="nodejs">
                  <SelectTrigger className="bg-dark border-surface-variant">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nodejs">Node.js</SelectItem>
                    <SelectItem value="python">Python</SelectItem>
                    <SelectItem value="react">React</SelectItem>
                    <SelectItem value="nextjs">Next.js</SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  onClick={() => createProject.mutate({ name: newProjectName })}
                  disabled={!newProjectName.trim() || createProject.isPending}
                  className="w-full bg-blue-500 hover:bg-blue-600"
                >
                  Create Project
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="deploy" className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Deployments</h4>
                <Button size="sm" className="bg-green-500 hover:bg-green-600">
                  <Zap className="w-3 h-3 mr-1" />
                  Deploy Now
                </Button>
              </div>

              {deployments.map((deployment) => (
                <div
                  key={deployment.id}
                  className="bg-surface-variant rounded-lg p-3"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="text-sm font-medium">{deployment.name}</h5>
                    <Badge className={getStatusColor(deployment.status)}>
                      {deployment.status}
                    </Badge>
                  </div>
                  <div className="space-y-1 text-xs text-text-secondary">
                    <p>URL: {deployment.url}</p>
                    {deployment.domain && <p>Custom Domain: {deployment.domain}</p>}
                  </div>
                  <div className="flex items-center space-x-2 mt-2">
                    <Button size="sm" variant="outline" className="text-xs">
                      View Logs
                    </Button>
                    <Button size="sm" variant="outline" className="text-xs">
                      Settings
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-surface-variant rounded-lg p-3">
              <h5 className="text-sm font-medium mb-2">Deploy Configuration</h5>
              <div className="space-y-2">
                <Input
                  placeholder="Deployment name..."
                  value={deploymentConfig.name}
                  onChange={(e) => setDeploymentConfig(prev => ({ ...prev, name: e.target.value }))}
                  className="bg-dark border-surface-variant"
                />
                <Select 
                  value={deploymentConfig.environment} 
                  onValueChange={(value) => setDeploymentConfig(prev => ({ ...prev, environment: value }))}
                >
                  <SelectTrigger className="bg-dark border-surface-variant">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="development">Development</SelectItem>
                    <SelectItem value="staging">Staging</SelectItem>
                    <SelectItem value="production">Production</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={deploymentConfig.autoDeploy}
                    onChange={(e) => setDeploymentConfig(prev => ({ ...prev, autoDeploy: e.target.checked }))}
                    className="rounded"
                  />
                  <label className="text-xs">Auto-deploy on push</label>
                </div>
                <Button 
                  onClick={() => deployProject.mutate(deploymentConfig)}
                  disabled={!deploymentConfig.name.trim() || deployProject.isPending}
                  className="w-full bg-green-500 hover:bg-green-600"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Deploy to Production
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="features" className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              <div className="bg-surface-variant rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-2">
                  <Database className="w-4 h-4 text-purple-400" />
                  <span className="text-sm font-medium">PostgreSQL Database</span>
                  <Badge className="bg-green-500/10 text-green-400">Active</Badge>
                </div>
                <p className="text-xs text-text-secondary mb-2">
                  Persistent database with full CRUD operations
                </p>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline" className="text-xs">
                    Query Console
                  </Button>
                  <Button size="sm" variant="outline" className="text-xs">
                    Backup
                  </Button>
                </div>
              </div>

              <div className="bg-surface-variant rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-2">
                  <Key className="w-4 h-4 text-orange-400" />
                  <span className="text-sm font-medium">Secrets Management</span>
                  <Badge className="bg-green-500/10 text-green-400">Active</Badge>
                </div>
                <p className="text-xs text-text-secondary mb-2">
                  Secure API key and environment variable storage
                </p>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline" className="text-xs">
                    View Secrets
                  </Button>
                  <Button size="sm" variant="outline" className="text-xs">
                    Add New
                  </Button>
                </div>
              </div>

              <div className="bg-surface-variant rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-2">
                  <GitBranch className="w-4 h-4 text-blue-400" />
                  <span className="text-sm font-medium">Git Integration</span>
                  <Badge className="bg-green-500/10 text-green-400">Connected</Badge>
                </div>
                <p className="text-xs text-text-secondary mb-2">
                  Version control with GitHub integration
                </p>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline" className="text-xs">
                    Commit
                  </Button>
                  <Button size="sm" variant="outline" className="text-xs">
                    Push
                  </Button>
                  <Button size="sm" variant="outline" className="text-xs">
                    History
                  </Button>
                </div>
              </div>

              <div className="bg-surface-variant rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-2">
                  <Users className="w-4 h-4 text-green-400" />
                  <span className="text-sm font-medium">Collaboration</span>
                  <Badge className="bg-blue-500/10 text-blue-400">Available</Badge>
                </div>
                <p className="text-xs text-text-secondary mb-2">
                  Real-time collaborative coding environment
                </p>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline" className="text-xs">
                    Invite Users
                  </Button>
                  <Button size="sm" variant="outline" className="text-xs">
                    Share Link
                  </Button>
                </div>
              </div>
            </div>

            <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-1">
                <Zap className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-medium text-blue-400">Replit Power Features</span>
              </div>
              <ul className="text-xs text-text-secondary space-y-1">
                <li>• Always-on hosting with 99.9% uptime</li>
                <li>• Automatic SSL certificates for custom domains</li>
                <li>• Built-in CI/CD pipeline with deployment previews</li>
                <li>• Real-time collaboration with live cursors</li>
                <li>• Integrated package manager and dependency management</li>
                <li>• Zero-config deployment with automatic scaling</li>
              </ul>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}