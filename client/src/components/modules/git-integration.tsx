import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  GitBranch, 
  GitCommit, 
  GitPullRequest, 
  History, 
  Upload, 
  Download,
  Plus,
  Merge,
  Clock,
  User,
  FileText
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface GitCommit {
  id: string;
  message: string;
  author: string;
  date: string;
  files: string[];
  hash: string;
}

interface GitBranchInfo {
  name: string;
  current: boolean;
  lastCommit: string;
  ahead: number;
  behind: number;
}

export function GitIntegration() {
  const [activeTab, setActiveTab] = useState("status");
  const [commitMessage, setCommitMessage] = useState("");
  const [newBranchName, setNewBranchName] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Mock git data - would integrate with actual git commands
  const gitStatus = {
    branch: "main",
    ahead: 2,
    behind: 0,
    modified: [
      "client/src/components/modules/replit-integration.tsx",
      "client/src/components/modules/package-manager.tsx",
      "server/storage.ts"
    ],
    added: [
      "client/src/components/modules/git-integration.tsx"
    ],
    deleted: [],
    untracked: [
      "server/seed-database.ts"
    ]
  };

  const commits: GitCommit[] = [
    {
      id: "1",
      hash: "abc123f",
      message: "Add database integration with PostgreSQL",
      author: "MO Developer",
      date: "2 hours ago",
      files: ["server/db.ts", "server/storage.ts", "shared/schema.ts"]
    },
    {
      id: "2", 
      hash: "def456g",
      message: "Implement Phase 2 automation modules",
      author: "MO Developer", 
      date: "1 day ago",
      files: ["client/src/components/modules/", "server/routes.ts"]
    },
    {
      id: "3",
      hash: "ghi789h", 
      message: "Add Python content automation services",
      author: "MO Developer",
      date: "2 days ago",
      files: ["server/services/content-automation.py", "server/services/mo-listener.py"]
    }
  ];

  const branches: GitBranchInfo[] = [
    {
      name: "main",
      current: true,
      lastCommit: "abc123f",
      ahead: 2,
      behind: 0
    },
    {
      name: "feature/mobile-optimization",
      current: false,
      lastCommit: "xyz987m", 
      ahead: 5,
      behind: 1
    },
    {
      name: "feature/ai-integration",
      current: false,
      lastCommit: "uvw654n",
      ahead: 3,
      behind: 0
    }
  ];

  const commitChanges = useMutation({
    mutationFn: async (message: string) => {
      // Would run actual git commit command
      await new Promise(resolve => setTimeout(resolve, 1500));
      return { success: true, hash: Math.random().toString(36).substr(2, 7) };
    },
    onSuccess: (data) => {
      toast({
        title: "Changes Committed",
        description: `Commit ${data.hash} created successfully.`,
      });
      setCommitMessage("");
    },
  });

  const pushChanges = useMutation({
    mutationFn: async () => {
      // Would run git push command
      await new Promise(resolve => setTimeout(resolve, 2000));
      return { success: true, pushed: gitStatus.ahead };
    },
    onSuccess: (data) => {
      toast({
        title: "Changes Pushed",
        description: `${data.pushed} commits pushed to remote repository.`,
      });
    },
  });

  const pullChanges = useMutation({
    mutationFn: async () => {
      // Would run git pull command
      await new Promise(resolve => setTimeout(resolve, 1500));
      return { success: true, pulled: 0 };
    },
    onSuccess: (data) => {
      toast({
        title: "Repository Updated",
        description: data.pulled > 0 ? `${data.pulled} new commits pulled.` : "Repository is up to date.",
      });
    },
  });

  const createBranch = useMutation({
    mutationFn: async (branchName: string) => {
      // Would run git checkout -b command
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { success: true, branch: branchName };
    },
    onSuccess: (data) => {
      toast({
        title: "Branch Created",
        description: `New branch '${data.branch}' created and checked out.`,
      });
      setNewBranchName("");
    },
  });

  const getFileStatusColor = (status: string) => {
    switch (status) {
      case "modified":
        return "text-orange-400";
      case "added":
        return "text-green-400";
      case "deleted":
        return "text-red-400";
      case "untracked":
        return "text-blue-400";
      default:
        return "text-gray-400";
    }
  };

  const getFileStatusIcon = (status: string) => {
    switch (status) {
      case "modified":
        return "M";
      case "added":
        return "A";
      case "deleted":
        return "D";
      case "untracked":
        return "?";
      default:
        return "";
    }
  };

  return (
    <Card className="bg-surface border-surface-variant">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <GitBranch className="w-5 h-5 text-orange-400" />
            <span>Git Integration</span>
          </div>
          <Badge className="bg-orange-500/10 text-orange-400">Version Control</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-surface-variant rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <GitBranch className="w-4 h-4 text-orange-400" />
              <span className="text-sm font-medium">Current Branch: {gitStatus.branch}</span>
            </div>
            <div className="flex items-center space-x-2">
              {gitStatus.ahead > 0 && (
                <Badge className="bg-green-500/10 text-green-400 text-xs">
                  ↑{gitStatus.ahead}
                </Badge>
              )}
              {gitStatus.behind > 0 && (
                <Badge className="bg-blue-500/10 text-blue-400 text-xs">
                  ↓{gitStatus.behind}
                </Badge>
              )}
            </div>
          </div>
          <div className="flex space-x-2">
            <Button
              size="sm"
              onClick={() => pullChanges.mutate()}
              disabled={pullChanges.isPending}
              className="bg-blue-500 hover:bg-blue-600"
            >
              <Download className="w-3 h-3 mr-1" />
              Pull
            </Button>
            <Button
              size="sm"
              onClick={() => pushChanges.mutate()}
              disabled={pushChanges.isPending || gitStatus.ahead === 0}
              className="bg-green-500 hover:bg-green-600"
            >
              <Upload className="w-3 h-3 mr-1" />
              Push ({gitStatus.ahead})
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-surface-variant">
            <TabsTrigger value="status" className="text-xs">Status</TabsTrigger>
            <TabsTrigger value="commit" className="text-xs">Commit</TabsTrigger>
            <TabsTrigger value="history" className="text-xs">History</TabsTrigger>
            <TabsTrigger value="branches" className="text-xs">Branches</TabsTrigger>
          </TabsList>

          <TabsContent value="status" className="space-y-3">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Working Directory Status</h4>
              
              {gitStatus.modified.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs text-orange-400 font-medium">Modified Files:</p>
                  {gitStatus.modified.map((file) => (
                    <div key={file} className="flex items-center space-x-2 text-xs">
                      <span className="w-4 text-center text-orange-400 font-mono">M</span>
                      <span className="text-text-secondary">{file}</span>
                    </div>
                  ))}
                </div>
              )}

              {gitStatus.added.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs text-green-400 font-medium">Added Files:</p>
                  {gitStatus.added.map((file) => (
                    <div key={file} className="flex items-center space-x-2 text-xs">
                      <span className="w-4 text-center text-green-400 font-mono">A</span>
                      <span className="text-text-secondary">{file}</span>
                    </div>
                  ))}
                </div>
              )}

              {gitStatus.untracked.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs text-blue-400 font-medium">Untracked Files:</p>
                  {gitStatus.untracked.map((file) => (
                    <div key={file} className="flex items-center space-x-2 text-xs">
                      <span className="w-4 text-center text-blue-400 font-mono">?</span>
                      <span className="text-text-secondary">{file}</span>
                    </div>
                  ))}
                </div>
              )}

              {gitStatus.modified.length === 0 && gitStatus.added.length === 0 && gitStatus.untracked.length === 0 && (
                <div className="text-center text-text-secondary py-4">
                  <GitBranch className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Working directory clean</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="commit" className="space-y-3">
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium mb-2 block">Commit Message</label>
                <Textarea
                  placeholder="Describe your changes..."
                  value={commitMessage}
                  onChange={(e) => setCommitMessage(e.target.value)}
                  className="bg-dark border-surface-variant resize-none"
                  rows={3}
                />
              </div>
              
              <div className="flex space-x-2">
                <Button
                  onClick={() => commitChanges.mutate(commitMessage)}
                  disabled={!commitMessage.trim() || commitChanges.isPending}
                  className="flex-1 bg-green-500 hover:bg-green-600"
                >
                  <GitCommit className="w-4 h-4 mr-2" />
                  Commit Changes
                </Button>
              </div>

              <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-1">
                  <FileText className="w-4 h-4 text-blue-400" />
                  <span className="text-sm font-medium text-blue-400">Staging Area</span>
                </div>
                <p className="text-xs text-text-secondary">
                  {gitStatus.modified.length + gitStatus.added.length + gitStatus.untracked.length} files ready to commit
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-3">
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {commits.map((commit) => (
                <div
                  key={commit.id}
                  className="bg-surface-variant rounded-lg p-3"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h5 className="text-sm font-medium">{commit.message}</h5>
                      <div className="flex items-center space-x-2 text-xs text-text-secondary">
                        <User className="w-3 h-3" />
                        <span>{commit.author}</span>
                        <Clock className="w-3 h-3" />
                        <span>{commit.date}</span>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs font-mono">
                      {commit.hash}
                    </Badge>
                  </div>
                  <div className="text-xs text-text-secondary">
                    <span>{commit.files.length} files changed</span>
                    {commit.files.length <= 3 && (
                      <span> • {commit.files.join(", ")}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="branches" className="space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Branches</h4>
                <Button size="sm" className="bg-blue-500 hover:bg-blue-600">
                  <Plus className="w-3 h-3 mr-1" />
                  New Branch
                </Button>
              </div>

              {branches.map((branch) => (
                <div
                  key={branch.name}
                  className={`bg-surface-variant rounded-lg p-3 ${
                    branch.current ? 'ring-1 ring-orange-500/50' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <GitBranch className="w-4 h-4 text-orange-400" />
                      <span className="text-sm font-medium">{branch.name}</span>
                      {branch.current && (
                        <Badge className="bg-orange-500/10 text-orange-400 text-xs">
                          current
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      {branch.ahead > 0 && (
                        <Badge className="bg-green-500/10 text-green-400 text-xs">
                          +{branch.ahead}
                        </Badge>
                      )}
                      {branch.behind > 0 && (
                        <Badge className="bg-red-500/10 text-red-400 text-xs">
                          -{branch.behind}
                        </Badge>
                      )}
                      {!branch.current && (
                        <Button size="sm" variant="outline" className="text-xs">
                          Checkout
                        </Button>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-text-secondary mt-1">
                    Last commit: {branch.lastCommit}
                  </p>
                </div>
              ))}
            </div>

            <div className="bg-surface-variant rounded-lg p-3">
              <h5 className="text-sm font-medium mb-2">Create New Branch</h5>
              <div className="flex space-x-2">
                <Input
                  placeholder="Branch name..."
                  value={newBranchName}
                  onChange={(e) => setNewBranchName(e.target.value)}
                  className="bg-dark border-surface-variant"
                />
                <Button
                  onClick={() => createBranch.mutate(newBranchName)}
                  disabled={!newBranchName.trim() || createBranch.isPending}
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="bg-orange-500/5 border border-orange-500/20 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-1">
            <GitBranch className="w-4 h-4 text-orange-400" />
            <span className="text-sm font-medium text-orange-400">Repository Status</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-text-secondary">Branch: </span>
              <span className="font-medium text-orange-400">{gitStatus.branch}</span>
            </div>
            <div>
              <span className="text-text-secondary">Status: </span>
              <span className="font-medium text-green-400">Up to date</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}