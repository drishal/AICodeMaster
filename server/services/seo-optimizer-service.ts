import { db } from '../db';
import { socialProfiles, campaigns } from '@shared/schema';

export interface SEOKeyword {
  keyword: string;
  searchVolume: number;
  difficulty: number;
  cpc: number;
  intent: 'informational' | 'commercial' | 'transactional' | 'navigational';
  trend: 'rising' | 'stable' | 'declining';
  relatedKeywords: string[];
  opportunities: string[];
}

export interface ContentOptimization {
  id: string;
  title: string;
  content: string;
  optimizedTitle: string;
  optimizedContent: string;
  metaDescription: string;
  keywords: string[];
  readabilityScore: number;
  seoScore: number;
  suggestions: OptimizationSuggestion[];
  competitorAnalysis: CompetitorContent[];
}

export interface OptimizationSuggestion {
  type: 'title' | 'content' | 'keywords' | 'structure' | 'readability';
  priority: 'high' | 'medium' | 'low';
  issue: string;
  suggestion: string;
  impact: string;
  implementation: string;
}

export interface CompetitorContent {
  url: string;
  title: string;
  keywords: string[];
  contentLength: number;
  backlinks: number;
  ranking: number;
  strengths: string[];
  weaknesses: string[];
}

export interface SEOAnalytics {
  overview: {
    totalKeywords: number;
    averageRanking: number;
    organicTraffic: number;
    clickThroughRate: number;
    impressions: number;
    clicks: number;
  };
  keywordPerformance: KeywordPerformance[];
  contentPerformance: ContentPerformance[];
  technicalSEO: TechnicalSEOMetrics;
  recommendations: SEORecommendation[];
}

export interface KeywordPerformance {
  keyword: string;
  ranking: number;
  previousRanking: number;
  impressions: number;
  clicks: number;
  ctr: number;
  difficulty: number;
  opportunity: number;
}

export interface ContentPerformance {
  url: string;
  title: string;
  organicTraffic: number;
  averageRanking: number;
  topKeywords: string[];
  lastOptimized: string;
  optimizationScore: number;
}

export interface TechnicalSEOMetrics {
  pageSpeed: number;
  mobileUsability: number;
  coreWebVitals: {
    lcp: number; // Largest Contentful Paint
    fid: number; // First Input Delay
    cls: number; // Cumulative Layout Shift
  };
  indexability: number;
  crawlErrors: number;
  sitemapStatus: 'valid' | 'invalid' | 'missing';
  robotsTxtStatus: 'valid' | 'invalid' | 'missing';
}

export interface SEORecommendation {
  category: 'keywords' | 'content' | 'technical' | 'backlinks' | 'local';
  priority: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  implementation: string;
  expectedImpact: string;
  effort: 'low' | 'medium' | 'high';
  timeline: string;
}

export interface SEOStrategy {
  id: string;
  name: string;
  industry: string;
  targetAudience: string;
  primaryKeywords: string[];
  secondaryKeywords: string[];
  contentStrategy: ContentStrategyPlan;
  technicalStrategy: TechnicalStrategyPlan;
  linkBuildingStrategy: LinkBuildingPlan;
  timeline: SEOTimeline;
  budget: SEOBudget;
  kpis: string[];
}

export interface ContentStrategyPlan {
  contentTypes: string[];
  publishingFrequency: string;
  contentCalendar: ContentCalendarItem[];
  optimizationGuidelines: string[];
}

export interface ContentCalendarItem {
  date: string;
  title: string;
  contentType: string;
  targetKeywords: string[];
  status: 'planned' | 'in_progress' | 'published';
}

export interface TechnicalStrategyPlan {
  siteStructure: string[];
  pageSpeedOptimizations: string[];
  mobileOptimizations: string[];
  schemaMarkup: string[];
  technicalAudits: string[];
}

export interface LinkBuildingPlan {
  targetDomains: string[];
  outreachStrategy: string[];
  contentAssets: string[];
  partnerships: string[];
  monitoring: string[];
}

export interface SEOTimeline {
  phase1: { duration: string; objectives: string[]; deliverables: string[] };
  phase2: { duration: string; objectives: string[]; deliverables: string[] };
  phase3: { duration: string; objectives: string[]; deliverables: string[] };
}

export interface SEOBudget {
  total: number;
  allocation: {
    tools: number;
    content: number;
    technical: number;
    linkBuilding: number;
    advertising: number;
  };
}

export class SEOOptimizerService {
  async generateKeywordStrategy(params: {
    industry: string;
    targetAudience: string;
    seedKeywords: string[];
    location?: string;
  }): Promise<SEOKeyword[]> {
    const keywords: SEOKeyword[] = [];
    
    // Generate primary keywords
    for (const seed of params.seedKeywords) {
      keywords.push({
        keyword: seed,
        searchVolume: Math.floor(Math.random() * 10000) + 1000,
        difficulty: Math.floor(Math.random() * 100) + 1,
        cpc: Math.round((Math.random() * 10 + 0.5) * 100) / 100,
        intent: this.determineKeywordIntent(seed),
        trend: Math.random() > 0.6 ? 'rising' : Math.random() > 0.3 ? 'stable' : 'declining',
        relatedKeywords: this.generateRelatedKeywords(seed, params.industry),
        opportunities: this.generateKeywordOpportunities(seed, params.industry)
      });
    }

    // Generate long-tail variations
    const longTailKeywords = this.generateLongTailKeywords(params.seedKeywords, params.industry);
    keywords.push(...longTailKeywords);

    // Generate location-based keywords if location provided
    if (params.location) {
      const localKeywords = this.generateLocalKeywords(params.seedKeywords, params.location);
      keywords.push(...localKeywords);
    }

    return keywords.sort((a, b) => b.searchVolume - a.searchVolume);
  }

  private determineKeywordIntent(keyword: string): 'informational' | 'commercial' | 'transactional' | 'navigational' {
    const transactionalWords = ['buy', 'purchase', 'order', 'shop', 'deal', 'discount', 'price'];
    const commercialWords = ['best', 'top', 'review', 'compare', 'vs', 'alternative'];
    const informationalWords = ['how', 'what', 'why', 'guide', 'tutorial', 'learn'];
    
    const lowerKeyword = keyword.toLowerCase();
    
    if (transactionalWords.some(word => lowerKeyword.includes(word))) return 'transactional';
    if (commercialWords.some(word => lowerKeyword.includes(word))) return 'commercial';
    if (informationalWords.some(word => lowerKeyword.includes(word))) return 'informational';
    
    return 'informational';
  }

  private generateRelatedKeywords(seed: string, industry: string): string[] {
    const related = [
      `${seed} guide`,
      `${seed} tips`,
      `${seed} best practices`,
      `${seed} ${industry}`,
      `${seed} solutions`,
      `${seed} services`,
      `${seed} tools`,
      `${seed} strategy`
    ];
    return related.slice(0, 5);
  }

  private generateKeywordOpportunities(seed: string, industry: string): string[] {
    return [
      `Low competition opportunity for "${seed} automation"`,
      `Rising trend in "${seed} AI" searches`,
      `Gap in "${seed} mobile" content`,
      `Voice search opportunity for "how to ${seed}"`,
      `Video content gap for "${seed} tutorial"`
    ];
  }

  private generateLongTailKeywords(seeds: string[], industry: string): SEOKeyword[] {
    const longTails: SEOKeyword[] = [];
    
    seeds.forEach(seed => {
      const variations = [
        `best ${seed} for ${industry}`,
        `how to ${seed} for beginners`,
        `${seed} vs alternatives`,
        `free ${seed} tools`,
        `${seed} automation software`
      ];

      variations.forEach(variation => {
        longTails.push({
          keyword: variation,
          searchVolume: Math.floor(Math.random() * 1000) + 100,
          difficulty: Math.floor(Math.random() * 50) + 10,
          cpc: Math.round((Math.random() * 3 + 0.3) * 100) / 100,
          intent: this.determineKeywordIntent(variation),
          trend: 'stable',
          relatedKeywords: [seed],
          opportunities: [`Long-tail opportunity with lower competition`]
        });
      });
    });

    return longTails;
  }

  private generateLocalKeywords(seeds: string[], location: string): SEOKeyword[] {
    return seeds.map(seed => ({
      keyword: `${seed} ${location}`,
      searchVolume: Math.floor(Math.random() * 500) + 50,
      difficulty: Math.floor(Math.random() * 40) + 20,
      cpc: Math.round((Math.random() * 5 + 1) * 100) / 100,
      intent: 'commercial' as const,
      trend: 'stable' as const,
      relatedKeywords: [`${seed} near me`, `${location} ${seed}`],
      opportunities: [`Local SEO opportunity in ${location} market`]
    }));
  }

  async optimizeContent(params: {
    title: string;
    content: string;
    targetKeywords: string[];
    industry: string;
  }): Promise<ContentOptimization> {
    const optimization: ContentOptimization = {
      id: `opt_${Date.now()}`,
      title: params.title,
      content: params.content,
      optimizedTitle: this.optimizeTitle(params.title, params.targetKeywords),
      optimizedContent: this.optimizeContentText(params.content, params.targetKeywords),
      metaDescription: this.generateMetaDescription(params.content, params.targetKeywords),
      keywords: params.targetKeywords,
      readabilityScore: this.calculateReadabilityScore(params.content),
      seoScore: this.calculateSEOScore(params.title, params.content, params.targetKeywords),
      suggestions: this.generateOptimizationSuggestions(params),
      competitorAnalysis: await this.analyzeCompetitorContent(params.targetKeywords[0])
    };

    return optimization;
  }

  private optimizeTitle(title: string, keywords: string[]): string {
    if (!title || keywords.length === 0) return title;
    
    const primaryKeyword = keywords[0];
    if (title.toLowerCase().includes(primaryKeyword.toLowerCase())) {
      return title;
    }
    
    // Try to naturally integrate the keyword
    const words = title.split(' ');
    if (words.length < 8) {
      return `${primaryKeyword}: ${title}`;
    }
    
    return `${title} - ${primaryKeyword} Guide`;
  }

  private optimizeContentText(content: string, keywords: string[]): string {
    let optimized = content;
    
    keywords.forEach((keyword, index) => {
      const keywordDensity = this.calculateKeywordDensity(content, keyword);
      if (keywordDensity < 0.5) {
        // Add keyword naturally if density is too low
        const sentences = optimized.split('. ');
        if (sentences.length > 2 && index === 0) {
          sentences[1] = sentences[1] + ` This ${keyword} approach`;
          optimized = sentences.join('. ');
        }
      }
    });

    return optimized;
  }

  private generateMetaDescription(content: string, keywords: string[]): string {
    const sentences = content.split('. ').slice(0, 2);
    let description = sentences.join('. ');
    
    if (description.length > 155) {
      description = description.substring(0, 152) + '...';
    }
    
    // Ensure primary keyword is included
    if (keywords.length > 0 && !description.toLowerCase().includes(keywords[0].toLowerCase())) {
      description = `${keywords[0]} guide: ${description}`;
      if (description.length > 155) {
        description = description.substring(0, 152) + '...';
      }
    }
    
    return description;
  }

  private calculateReadabilityScore(content: string): number {
    const words = content.split(/\s+/).length;
    const sentences = content.split(/[.!?]+/).length;
    const avgWordsPerSentence = words / sentences;
    
    // Simple readability score (higher is better)
    let score = 100;
    if (avgWordsPerSentence > 20) score -= 20;
    if (avgWordsPerSentence > 25) score -= 20;
    
    return Math.max(0, Math.min(100, score));
  }

  private calculateSEOScore(title: string, content: string, keywords: string[]): number {
    let score = 0;
    
    // Title optimization (30 points)
    if (keywords.some(k => title.toLowerCase().includes(k.toLowerCase()))) score += 30;
    
    // Content length (20 points)
    if (content.length > 1000) score += 20;
    else if (content.length > 500) score += 10;
    
    // Keyword density (30 points)
    keywords.forEach(keyword => {
      const density = this.calculateKeywordDensity(content, keyword);
      if (density >= 0.5 && density <= 2.5) score += 10;
    });
    
    // Content structure (20 points)
    if (content.includes('\n\n')) score += 10; // Paragraphs
    if (content.match(/#{1,6}\s/)) score += 10; // Headers
    
    return Math.min(100, score);
  }

  private calculateKeywordDensity(content: string, keyword: string): number {
    const words = content.toLowerCase().split(/\s+/);
    const keywordCount = words.filter(word => word.includes(keyword.toLowerCase())).length;
    return (keywordCount / words.length) * 100;
  }

  private generateOptimizationSuggestions(params: any): OptimizationSuggestion[] {
    const suggestions: OptimizationSuggestion[] = [];
    
    // Check title optimization
    if (!params.title.toLowerCase().includes(params.targetKeywords[0]?.toLowerCase())) {
      suggestions.push({
        type: 'title',
        priority: 'high',
        issue: 'Primary keyword not in title',
        suggestion: `Include "${params.targetKeywords[0]}" in the title`,
        impact: '+15% organic traffic potential',
        implementation: 'Rewrite title to naturally include primary keyword'
      });
    }
    
    // Check content length
    if (params.content.length < 1000) {
      suggestions.push({
        type: 'content',
        priority: 'medium',
        issue: 'Content too short for SEO',
        suggestion: 'Expand content to at least 1000 words',
        impact: '+25% search ranking potential',
        implementation: 'Add detailed sections, examples, and supporting information'
      });
    }
    
    // Check keyword density
    params.targetKeywords.forEach((keyword: string) => {
      const density = this.calculateKeywordDensity(params.content, keyword);
      if (density < 0.5) {
        suggestions.push({
          type: 'keywords',
          priority: 'medium',
          issue: `Low keyword density for "${keyword}"`,
          suggestion: `Increase usage of "${keyword}" naturally in content`,
          impact: '+10% relevance score',
          implementation: 'Add keyword in subheadings and naturally in content'
        });
      }
    });
    
    // Check structure
    if (!params.content.match(/#{1,6}\s/)) {
      suggestions.push({
        type: 'structure',
        priority: 'high',
        issue: 'Missing header tags',
        suggestion: 'Add H1, H2, H3 headers to structure content',
        impact: '+20% readability and SEO score',
        implementation: 'Break content into sections with descriptive headers'
      });
    }

    return suggestions;
  }

  private async analyzeCompetitorContent(keyword: string): Promise<CompetitorContent[]> {
    // Simulate competitor analysis
    return [
      {
        url: `https://competitor1.com/${keyword.replace(' ', '-')}`,
        title: `Ultimate ${keyword} Guide 2024`,
        keywords: [keyword, `${keyword} guide`, `best ${keyword}`],
        contentLength: 2500,
        backlinks: 45,
        ranking: 3,
        strengths: ['Comprehensive content', 'Strong backlink profile', 'Good user engagement'],
        weaknesses: ['Outdated information', 'Poor mobile optimization']
      },
      {
        url: `https://competitor2.com/${keyword.replace(' ', '-')}-tips`,
        title: `${keyword} Tips and Tricks`,
        keywords: [keyword, `${keyword} tips`, `${keyword} strategies`],
        contentLength: 1800,
        backlinks: 28,
        ranking: 7,
        strengths: ['Practical examples', 'Good internal linking'],
        weaknesses: ['Short content', 'Limited keyword coverage']
      }
    ];
  }

  async getAnalytics(): Promise<SEOAnalytics> {
    // Simulate SEO analytics data
    return {
      overview: {
        totalKeywords: 150,
        averageRanking: 12.5,
        organicTraffic: 8500,
        clickThroughRate: 3.2,
        impressions: 45000,
        clicks: 1440
      },
      keywordPerformance: [
        {
          keyword: 'mobile app development',
          ranking: 5,
          previousRanking: 8,
          impressions: 2500,
          clicks: 125,
          ctr: 5.0,
          difficulty: 65,
          opportunity: 85
        },
        {
          keyword: 'ai automation tools',
          ranking: 12,
          previousRanking: 15,
          impressions: 1800,
          clicks: 90,
          ctr: 5.0,
          difficulty: 45,
          opportunity: 70
        }
      ],
      contentPerformance: [
        {
          url: '/mobile-development-guide',
          title: 'Complete Mobile Development Guide',
          organicTraffic: 2500,
          averageRanking: 6.5,
          topKeywords: ['mobile development', 'app creation', 'mobile apps'],
          lastOptimized: '2024-01-15',
          optimizationScore: 85
        }
      ],
      technicalSEO: {
        pageSpeed: 92,
        mobileUsability: 88,
        coreWebVitals: {
          lcp: 2.1,
          fid: 85,
          cls: 0.08
        },
        indexability: 95,
        crawlErrors: 2,
        sitemapStatus: 'valid',
        robotsTxtStatus: 'valid'
      },
      recommendations: [
        {
          category: 'keywords',
          priority: 'high',
          title: 'Target High-Opportunity Keywords',
          description: 'Focus on 15 identified keywords with low competition and high search volume',
          implementation: 'Create dedicated content for each target keyword',
          expectedImpact: '+40% organic traffic in 3 months',
          effort: 'medium',
          timeline: '2-3 months'
        },
        {
          category: 'technical',
          priority: 'medium',
          title: 'Improve Core Web Vitals',
          description: 'Optimize Largest Contentful Paint and reduce Cumulative Layout Shift',
          implementation: 'Optimize images, minimize JavaScript, improve server response time',
          expectedImpact: '+15% search rankings',
          effort: 'high',
          timeline: '1-2 months'
        }
      ]
    };
  }

  async generateSEOStrategy(params: {
    industry: string;
    targetAudience: string;
    businessGoals: string[];
    budget: number;
    timeline: string;
  }): Promise<SEOStrategy> {
    const strategy: SEOStrategy = {
      id: `seo_strategy_${Date.now()}`,
      name: `${params.industry} SEO Strategy`,
      industry: params.industry,
      targetAudience: params.targetAudience,
      primaryKeywords: await this.generatePrimaryKeywords(params.industry),
      secondaryKeywords: await this.generateSecondaryKeywords(params.industry),
      contentStrategy: this.createContentStrategy(params),
      technicalStrategy: this.createTechnicalStrategy(),
      linkBuildingStrategy: this.createLinkBuildingStrategy(params.industry),
      timeline: this.createSEOTimeline(params.timeline),
      budget: this.allocateSEOBudget(params.budget),
      kpis: [
        'Organic traffic growth',
        'Keyword ranking improvements',
        'Conversion rate optimization',
        'Page speed scores',
        'Backlink acquisition'
      ]
    };

    return strategy;
  }

  private async generatePrimaryKeywords(industry: string): Promise<string[]> {
    const keywordMap: { [key: string]: string[] } = {
      'technology': ['software development', 'mobile apps', 'ai automation', 'cloud computing'],
      'ecommerce': ['online shopping', 'product reviews', 'best deals', 'customer service'],
      'healthcare': ['medical services', 'patient care', 'health insurance', 'telemedicine'],
      'default': ['business solutions', 'professional services', 'customer support', 'industry trends']
    };

    return keywordMap[industry] || keywordMap['default'];
  }

  private async generateSecondaryKeywords(industry: string): Promise<string[]> {
    const keywordMap: { [key: string]: string[] } = {
      'technology': ['tech startups', 'digital transformation', 'automation tools', 'software solutions'],
      'ecommerce': ['online marketplace', 'digital marketing', 'conversion optimization', 'user experience'],
      'healthcare': ['healthcare technology', 'patient management', 'medical devices', 'healthcare analytics'],
      'default': ['business growth', 'market analysis', 'competitive advantage', 'roi optimization']
    };

    return keywordMap[industry] || keywordMap['default'];
  }

  private createContentStrategy(params: any): ContentStrategyPlan {
    return {
      contentTypes: ['Blog posts', 'How-to guides', 'Industry reports', 'Case studies', 'Video tutorials'],
      publishingFrequency: '3-4 posts per week',
      contentCalendar: [
        {
          date: '2024-02-01',
          title: `Ultimate ${params.industry} Guide`,
          contentType: 'Long-form guide',
          targetKeywords: [`${params.industry} guide`, `${params.industry} tips`],
          status: 'planned'
        },
        {
          date: '2024-02-05',
          title: `${params.industry} Trends 2024`,
          contentType: 'Industry report',
          targetKeywords: [`${params.industry} trends`, `${params.industry} future`],
          status: 'planned'
        }
      ],
      optimizationGuidelines: [
        'Target primary keyword in title and first paragraph',
        'Use secondary keywords naturally throughout content',
        'Include internal links to related content',
        'Optimize images with alt text and keywords',
        'Structure content with H1, H2, H3 headers'
      ]
    };
  }

  private createTechnicalStrategy(): TechnicalStrategyPlan {
    return {
      siteStructure: [
        'Implement clear URL hierarchy',
        'Create XML sitemap',
        'Optimize navigation structure',
        'Implement breadcrumb navigation'
      ],
      pageSpeedOptimizations: [
        'Optimize images and media files',
        'Minimize CSS and JavaScript',
        'Enable browser caching',
        'Use CDN for faster loading'
      ],
      mobileOptimizations: [
        'Implement responsive design',
        'Optimize touch interfaces',
        'Improve mobile page speed',
        'Test mobile usability'
      ],
      schemaMarkup: [
        'Add organization schema',
        'Implement article schema',
        'Add FAQ schema for Q&A content',
        'Include local business schema if applicable'
      ],
      technicalAudits: [
        'Monthly site speed audits',
        'Quarterly technical SEO audits',
        'Regular broken link checks',
        'Monitor crawl errors'
      ]
    };
  }

  private createLinkBuildingStrategy(industry: string): LinkBuildingPlan {
    return {
      targetDomains: [
        `${industry}-magazine.com`,
        `industry-${industry}.org`,
        `${industry}-news.com`,
        `professional-${industry}.net`
      ],
      outreachStrategy: [
        'Guest posting on industry blogs',
        'Expert interviews and quotes',
        'Resource page link building',
        'Broken link building campaigns'
      ],
      contentAssets: [
        'Industry research reports',
        'Comprehensive guides',
        'Infographics and visual content',
        'Free tools and calculators'
      ],
      partnerships: [
        'Industry association memberships',
        'Strategic business partnerships',
        'Influencer collaborations',
        'Cross-promotional opportunities'
      ],
      monitoring: [
        'Track backlink acquisition',
        'Monitor competitor backlinks',
        'Analyze link quality scores',
        'Regular disavow file updates'
      ]
    };
  }

  private createSEOTimeline(duration: string): SEOTimeline {
    switch (duration) {
      case '3months':
        return {
          phase1: {
            duration: '0-1 month',
            objectives: ['Technical SEO audit', 'Keyword research', 'Content strategy'],
            deliverables: ['SEO audit report', 'Keyword list', 'Content calendar']
          },
          phase2: {
            duration: '1-2 months',
            objectives: ['Content creation', 'On-page optimization', 'Technical fixes'],
            deliverables: ['Optimized content', 'Technical improvements', 'Initial rankings']
          },
          phase3: {
            duration: '2-3 months',
            objectives: ['Link building', 'Performance monitoring', 'Strategy refinement'],
            deliverables: ['Quality backlinks', 'Performance reports', 'Strategy updates']
          }
        };
      default:
        return {
          phase1: {
            duration: '0-2 months',
            objectives: ['Foundation and research'],
            deliverables: ['Complete audit and strategy']
          },
          phase2: {
            duration: '2-4 months',
            objectives: ['Implementation and optimization'],
            deliverables: ['Content and technical optimizations']
          },
          phase3: {
            duration: '4-6 months',
            objectives: ['Growth and refinement'],
            deliverables: ['Results and ongoing optimization']
          }
        };
    }
  }

  private allocateSEOBudget(total: number): SEOBudget {
    return {
      total,
      allocation: {
        tools: Math.floor(total * 0.2), // 20%
        content: Math.floor(total * 0.4), // 40%
        technical: Math.floor(total * 0.2), // 20%
        linkBuilding: Math.floor(total * 0.15), // 15%
        advertising: Math.floor(total * 0.05) // 5%
      }
    };
  }
}

export const seoOptimizerService = new SEOOptimizerService();