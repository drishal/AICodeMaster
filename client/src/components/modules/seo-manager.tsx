import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, TrendingUp, Calendar, Target } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function SEOManager() {
  const [keyword, setKeyword] = useState("");
  const [platform, setPlatform] = useState("google");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const generateSEOStrategy = useMutation({
    mutationFn: async ({ keyword, platform }: { keyword: string; platform: string }) => {
      const res = await apiRequest("/api/ai/generate-code", {
        method: "POST",
        body: {
          prompt: `Generate SEO strategy for keyword "${keyword}" on ${platform} with ₹0 budget focus`,
          language: "markdown",
          mode: "seo-strategy"
        }
      });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "SEO Strategy Generated",
        description: "Your keyword strategy is ready for implementation.",
      });
    },
  });

  const handleGenerateStrategy = () => {
    if (!keyword.trim()) return;
    generateSEOStrategy.mutate({ keyword, platform });
  };

  return (
    <Card className="bg-surface border-surface-variant module-enhanced">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Search className="w-5 h-5 text-blue-400" />
            <span>SEO Manager Pro</span>
          </div>
          <Badge className="bg-blue-500/10 text-blue-400">₹0 Budget</Badge>
        </CardTitle>
        <div className="card-description">
          Complete SEO automation with keyword research, content optimization, competitor analysis, 
          backlink tracking, and multi-platform ranking monitoring.
        </div>
        <div className="feature-list">
          <div className="feature-tag">Keyword Research</div>
          <div className="feature-tag">Content Optimizer</div>
          <div className="feature-tag">Competitor Analysis</div>
          <div className="feature-tag">Backlink Tracker</div>
          <div className="feature-tag">Rank Monitor</div>
          <div className="feature-tag">Site Audit</div>
          <div className="feature-tag">Schema Generator</div>
          <div className="feature-tag">Speed Optimizer</div>
        </div>
      </CardHeader>
      <CardContent className="card-content space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Input
              placeholder="Enter target keyword..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="bg-surface-variant border-surface-variant"
            />
          </div>
          <div>
            <Select value={platform} onValueChange={setPlatform}>
              <SelectTrigger className="bg-surface-variant border-surface-variant">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="google">Google</SelectItem>
                <SelectItem value="youtube">YouTube</SelectItem>
                <SelectItem value="instagram">Instagram</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-surface-variant rounded-lg p-3 text-center">
            <TrendingUp className="w-4 h-4 text-green-400 mx-auto mb-1" />
            <div className="text-sm font-medium">Trending</div>
            <div className="text-xs text-text-secondary">AI Automation</div>
          </div>
          <div className="bg-surface-variant rounded-lg p-3 text-center">
            <Target className="w-4 h-4 text-orange-400 mx-auto mb-1" />
            <div className="text-sm font-medium">Difficulty</div>
            <div className="text-xs text-text-secondary">Low-Medium</div>
          </div>
          <div className="bg-surface-variant rounded-lg p-3 text-center">
            <Calendar className="w-4 h-4 text-purple-400 mx-auto mb-1" />
            <div className="text-sm font-medium">Schedule</div>
            <div className="text-xs text-text-secondary">Daily</div>
          </div>
        </div>

        <Button 
          onClick={handleGenerateStrategy}
          disabled={!keyword.trim() || generateSEOStrategy.isPending}
          className="w-full bg-blue-500 hover:bg-blue-600"
        >
          Generate SEO Strategy
        </Button>
      </CardContent>
    </Card>
  );
}