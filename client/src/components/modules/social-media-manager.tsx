import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Instagram, Facebook, Youtube, MessageCircle, BarChart3, Users } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { SocialProfile } from "@shared/schema";
import ScrollableCard from "@/components/ui/scrollable-card";

export function SocialMediaManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: profiles = [], isLoading } = useQuery<SocialProfile[]>({
    queryKey: ["/api/social-profiles"],
  });

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "instagram":
        return <Instagram className="w-4 h-4 text-pink-400" />;
      case "facebook":
        return <Facebook className="w-4 h-4 text-blue-400" />;
      case "youtube":
        return <Youtube className="w-4 h-4 text-red-400" />;
      default:
        return <Users className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStrategyColor = (strategy: string) => {
    return strategy === "roas" ? "text-green-400" : "text-purple-400";
  };

  if (isLoading) {
    return (
      <Card className="bg-surface border-surface-variant">
        <CardContent className="p-6">
          <div className="text-text-secondary">Loading social profiles...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-surface border-surface-variant module-enhanced">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Instagram className="w-5 h-5 text-pink-400" />
            <span>Social Media Manager Pro</span>
          </div>
          <Badge className="bg-green-500/10 text-green-400">Multi-Profile</Badge>
        </CardTitle>
        <div className="card-description">
          Advanced social media automation with AI content generation, cross-platform posting, 
          engagement tracking, hashtag optimization, and automated DM responses.
        </div>
        <div className="feature-list">
          <div className="feature-tag">Auto Posting</div>
          <div className="feature-tag">AI Content</div>
          <div className="feature-tag">Hashtag Research</div>
          <div className="feature-tag">Engagement Bot</div>
          <div className="feature-tag">Story Scheduler</div>
          <div className="feature-tag">DM Automation</div>
          <div className="feature-tag">Growth Analytics</div>
          <div className="feature-tag">Competitor Track</div>
        </div>
      </CardHeader>
      <CardContent className="card-content">
        <ScrollableCard>
          <Tabs defaultValue="profiles" className="w-full internal-tabs-container">
            <TabsList className="grid w-full grid-cols-3 bg-surface-variant tabs-list">
              <TabsTrigger value="profiles">Profiles</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>
          
          <TabsContent value="profiles" className="space-y-3">
            <div className="grid grid-cols-1 gap-3">
              {profiles.map((profile) => (
                <div
                  key={profile.id}
                  className="bg-surface-variant rounded-lg p-3 border border-surface-variant"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                        {getPlatformIcon(profile.platform)}
                      </div>
                      <div>
                        <h3 className="font-medium text-sm">@{profile.username}</h3>
                        <p className="text-xs text-text-secondary">
                          {profile.profileType} • <span className={getStrategyColor(profile.strategy)}>{profile.strategy.toUpperCase()}</span>
                        </p>
                      </div>
                    </div>
                    <Badge variant={profile.isActive ? "default" : "secondary"} className="text-xs">
                      {profile.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="content" className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-surface-variant rounded-lg p-3 text-center">
                <MessageCircle className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                <div className="text-sm font-medium">Posts Scheduled</div>
                <div className="text-xs text-text-secondary">12 this week</div>
              </div>
              <div className="bg-surface-variant rounded-lg p-3 text-center">
                <BarChart3 className="w-6 h-6 text-green-400 mx-auto mb-2" />
                <div className="text-sm font-medium">Engagement Rate</div>
                <div className="text-xs text-text-secondary">4.2% avg</div>
              </div>
            </div>
            <Button className="w-full bg-pink-500 hover:bg-pink-600">
              Create New Post
            </Button>
          </TabsContent>
          
          <TabsContent value="analytics" className="space-y-3">
            <div className="text-center text-text-secondary">
              <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Analytics dashboard coming soon</p>
            </div>
          </TabsContent>
          </Tabs>
        </ScrollableCard>
      </CardContent>
    </Card>
  );
}