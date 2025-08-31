import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { FileText, Download, Copy, Lightbulb, Search, TrendingUp, Clock, BarChart3, Tags, Eye, Star } from "lucide-react";
import ScrollableCard from "@/components/ui/scrollable-card";

interface BlogPost {
  id: string;
  title: string;
  content: string;
  keywords: string[];
  metaDescription: string;
  headings: string[];
  wordCount: number;
  readingTime: number;
  seoScore: number;
  createdAt: string;
  category: string;
  tags: string[];
  outline: string[];
}

interface BlogGenerationRequest {
  primaryKeyword: string;
  secondaryKeywords: string[];
  targetLength: 'short' | 'medium' | 'long';
  tone: 'professional' | 'casual' | 'informative' | 'persuasive';
  audience: string;
  includeOutline: boolean;
  includeFAQ: boolean;
  includeConclusion: boolean;
}

export default function AutoBlogWriter() {
  const [activeTab, setActiveTab] = useState("generator");
  const [generatedBlogs, setGeneratedBlogs] = useState<BlogPost[]>([]);
  const [selectedBlog, setSelectedBlog] = useState<BlogPost | null>(null);
  const [seoSuggestions, setSeoSuggestions] = useState<string[]>([]);
  const [bulkKeywords, setBulkKeywords] = useState("");
  const [generationRequest, setGenerationRequest] = useState<BlogGenerationRequest>({
    primaryKeyword: "",
    secondaryKeywords: [],
    targetLength: "medium",
    tone: "informative",
    audience: "",
    includeOutline: true,
    includeFAQ: true,
    includeConclusion: true
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch blog templates and configurations
  const { data: templates } = useQuery({
    queryKey: ['/api/blog-writer/templates'],
    queryFn: () => apiRequest('/api/blog-writer/templates')
  });

  // Generate single blog post
  const generateBlogMutation = useMutation({
    mutationFn: (request: BlogGenerationRequest) => 
      apiRequest('/api/blog-writer/generate', { method: 'POST', body: request }),
    onSuccess: (blog: BlogPost) => {
      setGeneratedBlogs(prev => [blog, ...prev]);
      setSelectedBlog(blog);
      setActiveTab('preview');
      toast({
        title: "Blog Generated",
        description: `"${blog.title}" created successfully with ${blog.wordCount} words.`
      });
    },
    onError: (error: any) => {
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate blog post",
        variant: "destructive"
      });
    }
  });

  // Generate multiple blog posts
  const generateMultipleMutation = useMutation({
    mutationFn: (data: { keywords: string[]; [key: string]: any }) => 
      apiRequest('/api/blog-writer/generate-multiple', { method: 'POST', body: data }),
    onSuccess: (data: { blogs: BlogPost[] }) => {
      setGeneratedBlogs(prev => [...data.blogs, ...prev]);
      toast({
        title: "Bulk Generation Complete",
        description: `Generated ${data.blogs.length} blog posts successfully.`
      });
      setActiveTab('library');
    },
    onError: (error: any) => {
      toast({
        title: "Bulk Generation Failed",
        description: error.message || "Failed to generate multiple blogs",
        variant: "destructive"
      });
    }
  });

  // Get SEO suggestions
  const getSeoSuggestionsMutation = useMutation({
    mutationFn: (blog: BlogPost) => 
      apiRequest(`/api/blog-writer/seo-suggestions/${blog.id}`, { method: 'POST', body: blog }),
    onSuccess: (data: { suggestions: string[] }) => {
      setSeoSuggestions(data.suggestions);
    }
  });

  const handleSecondaryKeywordAdd = (keyword: string) => {
    if (keyword.trim() && !generationRequest.secondaryKeywords.includes(keyword.trim())) {
      setGenerationRequest(prev => ({
        ...prev,
        secondaryKeywords: [...prev.secondaryKeywords, keyword.trim()]
      }));
    }
  };

  const handleSecondaryKeywordRemove = (keyword: string) => {
    setGenerationRequest(prev => ({
      ...prev,
      secondaryKeywords: prev.secondaryKeywords.filter(k => k !== keyword)
    }));
  };

  const handleGenerate = () => {
    if (!generationRequest.primaryKeyword.trim()) {
      toast({
        title: "Missing Primary Keyword",
        description: "Please enter a primary keyword to generate content.",
        variant: "destructive"
      });
      return;
    }

    generateBlogMutation.mutate(generationRequest);
  };

  const handleBulkGenerate = () => {
    const keywords = bulkKeywords.split('\n').filter(k => k.trim()).map(k => k.trim());
    
    if (keywords.length === 0) {
      toast({
        title: "No Keywords Found",
        description: "Please enter keywords separated by new lines.",
        variant: "destructive"
      });
      return;
    }

    const { primaryKeyword, ...baseRequest } = generationRequest;
    generateMultipleMutation.mutate({ keywords, ...baseRequest });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Content copied to clipboard"
    });
  };

  const downloadBlog = (blog: BlogPost) => {
    const element = document.createElement('a');
    const file = new Blob([blog.content], { type: 'text/markdown' });
    element.href = URL.createObjectURL(file);
    element.download = `${blog.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const getSeoScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getSeoScoreLabel = (score: number) => {
    if (score >= 90) return "Excellent";
    if (score >= 80) return "Good";
    if (score >= 60) return "Fair";
    return "Needs Improvement";
  };

  return (
    <Card className="bg-surface border-surface-variant module-enhanced">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-purple-400" />
            <span>Auto Blog Writer Pro</span>
          </div>
          <Badge className="bg-purple-500/10 text-purple-400">{generatedBlogs.length} Generated</Badge>
        </CardTitle>
        <div className="card-description">
          Advanced blog generation with AI-powered SEO optimization, keyword research, 
          competitor analysis, content scoring, and automated publishing workflows.
        </div>
        <div className="feature-list">
          <div className="feature-tag">AI SEO Optimize</div>
          <div className="feature-tag">Keyword Research</div>
          <div className="feature-tag">Competitor Analysis</div>
          <div className="feature-tag">Content Scoring</div>
          <div className="feature-tag">Auto Publishing</div>
          <div className="feature-tag">Bulk Generate</div>
          <div className="feature-tag">Schema Markup</div>
          <div className="feature-tag">Performance Track</div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Main content */}
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold">Auto Blog Writer</h3>
            <p className="text-muted-foreground">
              AI-powered blog generation with SEO optimization and multiple content formats
            </p>
          </div>

        <ScrollableCard>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full internal-tabs-container">
            <TabsList className="grid w-full grid-cols-5 tabs-list">
              <TabsTrigger value="generator" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Generator
              </TabsTrigger>
              <TabsTrigger value="bulk" className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Bulk Create
              </TabsTrigger>
              <TabsTrigger value="preview" className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Preview
              </TabsTrigger>
              <TabsTrigger value="seo" className="flex items-center gap-2">
                <Search className="w-4 h-4" />
                SEO Analysis
              </TabsTrigger>
              <TabsTrigger value="library" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Library
              </TabsTrigger>
            </TabsList>

        {/* Blog Generator Tab */}
        <TabsContent value="generator" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Blog Content Generator
              </CardTitle>
              <CardDescription>
                Generate high-quality blog posts with AI-powered content creation and SEO optimization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="primaryKeyword">Primary Keyword *</Label>
                    <Input
                      id="primaryKeyword"
                      placeholder="e.g., digital marketing"
                      value={generationRequest.primaryKeyword}
                      onChange={(e) => setGenerationRequest(prev => ({ ...prev, primaryKeyword: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="secondaryKeywords">Secondary Keywords</Label>
                    <div className="flex gap-2 mb-2">
                      <Input
                        placeholder="Add keyword and press Enter"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleSecondaryKeywordAdd(e.currentTarget.value);
                            e.currentTarget.value = '';
                          }
                        }}
                      />
                      <Button
                        type="button"
                        onClick={(e) => {
                          const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                          handleSecondaryKeywordAdd(input.value);
                          input.value = '';
                        }}
                      >
                        Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {generationRequest.secondaryKeywords.map((keyword) => (
                        <Badge key={keyword} variant="secondary" className="cursor-pointer">
                          {keyword}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="ml-1 p-0 h-auto"
                            onClick={() => handleSecondaryKeywordRemove(keyword)}
                          >
                            ×
                          </Button>
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="audience">Target Audience</Label>
                    <Input
                      id="audience"
                      placeholder="e.g., small business owners, developers"
                      value={generationRequest.audience}
                      onChange={(e) => setGenerationRequest(prev => ({ ...prev, audience: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="targetLength">Content Length</Label>
                    <Select
                      value={generationRequest.targetLength}
                      onValueChange={(value: any) => setGenerationRequest(prev => ({ ...prev, targetLength: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {templates?.targetLengths?.map((length: any) => (
                          <SelectItem key={length.value} value={length.value}>
                            {length.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="tone">Writing Tone</Label>
                    <Select
                      value={generationRequest.tone}
                      onValueChange={(value: any) => setGenerationRequest(prev => ({ ...prev, tone: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {templates?.tones?.map((tone: any) => (
                          <SelectItem key={tone.value} value={tone.value}>
                            {tone.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label>Content Options</Label>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="includeOutline" className="text-sm">Include Outline</Label>
                        <Switch
                          id="includeOutline"
                          checked={generationRequest.includeOutline}
                          onCheckedChange={(checked) => setGenerationRequest(prev => ({ ...prev, includeOutline: checked }))}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="includeFAQ" className="text-sm">Include FAQ Section</Label>
                        <Switch
                          id="includeFAQ"
                          checked={generationRequest.includeFAQ}
                          onCheckedChange={(checked) => setGenerationRequest(prev => ({ ...prev, includeFAQ: checked }))}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="includeConclusion" className="text-sm">Include Conclusion</Label>
                        <Switch
                          id="includeConclusion"
                          checked={generationRequest.includeConclusion}
                          onCheckedChange={(checked) => setGenerationRequest(prev => ({ ...prev, includeConclusion: checked }))}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Button 
                onClick={handleGenerate} 
                disabled={generateBlogMutation.isPending}
                className="w-full"
                size="lg"
              >
                {generateBlogMutation.isPending ? (
                  <>Generating Blog Post...</>
                ) : (
                  <>
                    <FileText className="w-4 h-4 mr-2" />
                    Generate Blog Post
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bulk Generation Tab */}
        <TabsContent value="bulk" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Bulk Blog Generation
              </CardTitle>
              <CardDescription>
                Generate multiple blog posts from a list of keywords
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="bulkKeywords">Keywords (one per line)</Label>
                <Textarea
                  id="bulkKeywords"
                  placeholder={`digital marketing\ncontent strategy\nsocial media automation\nemail marketing\nSEO optimization`}
                  value={bulkKeywords}
                  onChange={(e) => setBulkKeywords(e.target.value)}
                  rows={8}
                />
              </div>

              <Button 
                onClick={handleBulkGenerate} 
                disabled={generateMultipleMutation.isPending}
                className="w-full"
                size="lg"
              >
                {generateMultipleMutation.isPending ? (
                  <>Generating Blog Posts...</>
                ) : (
                  <>
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Generate Multiple Blogs
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preview Tab */}
        <TabsContent value="preview" className="space-y-6">
          {selectedBlog ? (
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <CardTitle className="text-2xl">{selectedBlog.title}</CardTitle>
                    <CardDescription>{selectedBlog.metaDescription}</CardDescription>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {selectedBlog.readingTime} min read
                      </Badge>
                      <Badge variant="outline" className="flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        {selectedBlog.wordCount} words
                      </Badge>
                      <Badge variant="outline" className={`flex items-center gap-1 ${getSeoScoreColor(selectedBlog.seoScore)}`}>
                        <Star className="w-3 h-3" />
                        SEO: {selectedBlog.seoScore}% ({getSeoScoreLabel(selectedBlog.seoScore)})
                      </Badge>
                      <Badge variant="secondary">{selectedBlog.category}</Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => copyToClipboard(selectedBlog.content)}>
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" onClick={() => downloadBlog(selectedBlog)}>
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  <div className="lg:col-span-3">
                    <ScrollArea className="h-[600px] w-full border rounded-lg p-4">
                      <div className="prose dark:prose-invert max-w-none">
                        <pre className="whitespace-pre-wrap font-sans">{selectedBlog.content}</pre>
                      </div>
                    </ScrollArea>
                  </div>
                  
                  <div className="space-y-4">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Tags className="w-4 h-4" />
                          Keywords
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex flex-wrap gap-1">
                          {selectedBlog.keywords.map((keyword) => (
                            <Badge key={keyword} variant="secondary" className="text-xs">
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Content Structure</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-1">
                          {selectedBlog.headings.map((heading, index) => (
                            <div key={index} className="text-sm text-gray-600 dark:text-gray-400 truncate">
                              {heading}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Tags</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex flex-wrap gap-1">
                          {selectedBlog.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center space-y-2">
                  <FileText className="w-12 h-12 mx-auto text-gray-400" />
                  <p className="text-gray-500">No blog selected. Generate a blog post to preview.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* SEO Analysis Tab */}
        <TabsContent value="seo" className="space-y-6">
          {selectedBlog ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Search className="w-5 h-5" />
                    SEO Score Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Overall SEO Score</span>
                      <span className={`font-bold ${getSeoScoreColor(selectedBlog.seoScore)}`}>
                        {selectedBlog.seoScore}%
                      </span>
                    </div>
                    <Progress value={selectedBlog.seoScore} className="h-2" />
                    <p className="text-sm text-gray-600">
                      {getSeoScoreLabel(selectedBlog.seoScore)}
                    </p>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{selectedBlog.wordCount}</div>
                      <div className="text-sm text-gray-600">Words</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{selectedBlog.readingTime}</div>
                      <div className="text-sm text-gray-600">Min Read</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{selectedBlog.headings.length}</div>
                      <div className="text-sm text-gray-600">Headings</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{selectedBlog.keywords.length}</div>
                      <div className="text-sm text-gray-600">Keywords</div>
                    </div>
                  </div>

                  <Button 
                    onClick={() => getSeoSuggestionsMutation.mutate(selectedBlog)}
                    disabled={getSeoSuggestionsMutation.isPending}
                    className="w-full"
                  >
                    <Lightbulb className="w-4 h-4 mr-2" />
                    Get SEO Suggestions
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5" />
                    SEO Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {seoSuggestions.length > 0 ? (
                    <div className="space-y-3">
                      {seoSuggestions.map((suggestion, index) => (
                        <div key={index} className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                          <p className="text-sm">{suggestion}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      <Lightbulb className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                      <p>Click "Get SEO Suggestions" to analyze this blog post</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center space-y-2">
                  <Search className="w-12 h-12 mx-auto text-gray-400" />
                  <p className="text-gray-500">Select a blog post to view SEO analysis.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Library Tab */}
        <TabsContent value="library" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Blog Library
              </CardTitle>
              <CardDescription>
                Manage and view all generated blog posts
              </CardDescription>
            </CardHeader>
            <CardContent>
              {generatedBlogs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {generatedBlogs.map((blog) => (
                    <Card key={blog.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg line-clamp-2">{blog.title}</CardTitle>
                        <CardDescription className="line-clamp-2">{blog.metaDescription}</CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0 space-y-3">
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>{blog.wordCount} words</span>
                          <span>{blog.readingTime} min read</span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <Badge variant="secondary">{blog.category}</Badge>
                          <Badge variant="outline" className={getSeoScoreColor(blog.seoScore)}>
                            SEO: {blog.seoScore}%
                          </Badge>
                        </div>

                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => {
                              setSelectedBlog(blog);
                              setActiveTab('preview');
                            }}
                            className="flex-1"
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            View
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => copyToClipboard(blog.content)}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => downloadBlog(blog)}
                          >
                            <Download className="w-3 h-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <BarChart3 className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No blogs generated yet</h3>
                  <p className="text-gray-600 mb-4">
                    Generate your first blog post to see it appear in your library.
                  </p>
                  <Button onClick={() => setActiveTab('generator')}>
                    <FileText className="w-4 h-4 mr-2" />
                    Generate First Blog
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
          </Tabs>
        </ScrollableCard>
        </div>
      </CardContent>
    </Card>
  );
}