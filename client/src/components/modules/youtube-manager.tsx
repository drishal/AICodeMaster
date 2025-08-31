import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Youtube, Play, TrendingUp, Clock, Video, BarChart3 } from "lucide-react";

export function YouTubeManager() {
  const [shortTitle, setShortTitle] = useState("");

  const shorts = [
    { id: 1, title: "AI Automation Tips", views: "12.5K", status: "published", engagement: "8.2%" },
    { id: 2, title: "Termux Mastery", views: "8.9K", status: "scheduled", engagement: "6.7%" },
    { id: 3, title: "Mobile Development", views: "5.2K", status: "draft", engagement: "0%" }
  ];

  const engagementPlans = [
    { type: "Morning Boost", time: "9:00 AM", action: "Like & Reply to 50 comments", active: true },
    { type: "Trend Hunt", time: "2:00 PM", action: "Analyze trending hashtags", active: true },
    { type: "Community Post", time: "6:00 PM", action: "Share poll or question", active: false }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published": return "text-green-400";
      case "scheduled": return "text-blue-400";
      case "draft": return "text-orange-400";
      default: return "text-gray-400";
    }
  };

  return (
    <div className="bg-white dark:bg-surface rounded-2xl shadow-xl max-h-[80vh] overflow-y-auto">
      <div className="sticky top-0 z-20 bg-white dark:bg-surface shadow p-4 rounded-t-2xl">
        <h1 className="text-xl font-bold flex items-center space-x-2">
          <Youtube className="w-6 h-6 text-red-500" />
          <span>YouTube Manager Pro</span>
        </h1>
      </div>
      <Card className="bg-transparent border-none shadow-none m-4 mt-0">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Youtube className="w-5 h-5 text-red-400" />
            <span>YouTube Manager Pro</span>
          </div>
          <Badge className="bg-red-500/10 text-red-400">Automation</Badge>
        </CardTitle>
        <div className="card-description">
          Complete YouTube automation with viral title generation, thumbnail optimization, 
          trending hashtags, upload scheduling, and engagement automation for maximum reach.
        </div>
        <div className="feature-list">
          <div className="feature-tag">Viral Titles</div>
          <div className="feature-tag">Thumbnail AI</div>
          <div className="feature-tag">Trending Tags</div>
          <div className="feature-tag">Upload Scheduler</div>
          <div className="feature-tag">Engagement Bot</div>
          <div className="feature-tag">Analytics Deep</div>
          <div className="feature-tag">Community Posts</div>
          <div className="feature-tag">SEO Optimizer</div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="shorts" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-surface-variant">
            <TabsTrigger value="shorts">Shorts</TabsTrigger>
            <TabsTrigger value="engagement">Engagement</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="shorts" className="space-y-3">
            <div className="flex space-x-2">
              <Input
                placeholder="Short video title..."
                value={shortTitle}
                onChange={(e) => setShortTitle(e.target.value)}
                className="bg-dark border-surface-variant"
              />
              <Button className="bg-red-500 hover:bg-red-600">
                <Video className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="space-y-2">
              {shorts.map((short) => (
                <div
                  key={short.id}
                  className="bg-surface-variant rounded-lg p-3"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium">{short.title}</h4>
                    <Badge className={`text-xs ${getStatusColor(short.status)}`}>
                      {short.status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="text-center">
                      <div className="text-text-secondary">Views</div>
                      <div className="font-medium">{short.views}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-text-secondary">Engagement</div>
                      <div className="font-medium">{short.engagement}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="action-buttons">
              <Button className="w-full bg-red-500 hover:bg-red-600">
                <Play className="w-4 h-4 mr-2" />
                Create Short
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="engagement" className="space-y-3">
            <div className="space-y-2">
              {engagementPlans.map((plan, index) => (
                <div
                  key={index}
                  className="bg-surface-variant rounded-lg p-3 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-purple-500/20 rounded flex items-center justify-center">
                      <Clock className="w-3 h-3 text-purple-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">{plan.type}</h4>
                      <p className="text-xs text-text-secondary">{plan.time} • {plan.action}</p>
                    </div>
                  </div>
                  <Badge variant={plan.active ? "default" : "secondary"} className="text-xs">
                    {plan.active ? "Active" : "Paused"}
                  </Badge>
                </div>
              ))}
            </div>
            
            <div className="action-buttons">
              <Button className="w-full bg-purple-500 hover:bg-purple-600">
                <TrendingUp className="w-4 h-4 mr-2" />
                Add Engagement Plan
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="analytics" className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-surface-variant rounded-lg p-3 text-center">
                <TrendingUp className="w-6 h-6 text-green-400 mx-auto mb-2" />
                <div className="text-sm font-medium">Avg Views</div>
                <div className="text-xs text-text-secondary">8.9K per short</div>
              </div>
              <div className="bg-surface-variant rounded-lg p-3 text-center">
                <BarChart3 className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                <div className="text-sm font-medium">Growth Rate</div>
                <div className="text-xs text-text-secondary">+23% this week</div>
              </div>
            </div>
            
            <div className="text-center text-text-secondary py-4">
              <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Detailed analytics dashboard</p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
    </div>
  );
}