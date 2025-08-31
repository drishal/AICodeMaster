import fs from 'fs/promises';
import path from 'path';

export interface CalendarPost {
  day: number;
  date: string;
  title: string;
  description: string;
  contentType: 'image' | 'video' | 'carousel' | 'story' | 'reel' | 'live';
  platforms: string[];
  hashtags: string[];
  optimalTime: string;
  engagementTactics: string[];
  callToAction: string;
  contentPillars: string[];
  trends: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedReach: string;
  keywords: string[];
}

export interface MonthlyCalendar {
  niche: string;
  month: string;
  year: number;
  totalPosts: number;
  contentBreakdown: {
    [key: string]: number;
  };
  platformDistribution: {
    [key: string]: number;
  };
  posts: CalendarPost[];
  weeklyThemes: string[];
  monthlyGoals: string[];
  budgetEstimate: string;
  kpiTargets: {
    followers: string;
    engagement: string;
    reach: string;
    conversions: string;
  };
}

export class CalendarGeneratorService {
  private static instance: CalendarGeneratorService;
  private readonly calendarDir = './uploads/calendars';

  // Niche-specific content strategies
  private nicheStrategies: { [key: string]: any } = {
    tech: {
      contentPillars: ['tutorials', 'product reviews', 'industry news', 'tips & tricks', 'behind the scenes'],
      platforms: ['instagram', 'youtube', 'twitter', 'linkedin', 'tiktok'],
      optimalTimes: {
        weekday: '09:00, 13:00, 18:00',
        weekend: '11:00, 15:00'
      },
      hashtags: ['#tech', '#technology', '#innovation', '#gadgets', '#techreview', '#AI', '#startup', '#coding', '#digital', '#future'],
      trends: ['AI developments', 'new gadgets', 'tech tutorials', 'startup stories', 'coding tips'],
      audience: 'tech enthusiasts, developers, early adopters'
    },
    fitness: {
      contentPillars: ['workouts', 'nutrition', 'motivation', 'transformation stories', 'wellness tips'],
      platforms: ['instagram', 'tiktok', 'youtube', 'facebook'],
      optimalTimes: {
        weekday: '06:00, 12:00, 19:00',
        weekend: '08:00, 16:00'
      },
      hashtags: ['#fitness', '#workout', '#health', '#nutrition', '#motivation', '#gym', '#wellness', '#strong', '#fitlife', '#transformation'],
      trends: ['home workouts', 'meal prep', 'fitness challenges', 'wellness trends', 'equipment reviews'],
      audience: 'fitness enthusiasts, health-conscious individuals, beginners'
    },
    food: {
      contentPillars: ['recipes', 'cooking tips', 'restaurant reviews', 'food trends', 'nutrition info'],
      platforms: ['instagram', 'tiktok', 'youtube', 'pinterest', 'facebook'],
      optimalTimes: {
        weekday: '11:00, 17:00, 20:00',
        weekend: '10:00, 14:00, 19:00'
      },
      hashtags: ['#food', '#recipe', '#cooking', '#foodie', '#delicious', '#homemade', '#yummy', '#foodblogger', '#instafood', '#tasty'],
      trends: ['quick recipes', 'healthy alternatives', 'food challenges', 'seasonal dishes', 'cooking hacks'],
      audience: 'food lovers, home cooks, restaurant enthusiasts'
    },
    fashion: {
      contentPillars: ['outfit ideas', 'styling tips', 'trend alerts', 'brand features', 'seasonal looks'],
      platforms: ['instagram', 'tiktok', 'pinterest', 'youtube'],
      optimalTimes: {
        weekday: '10:00, 14:00, 19:00',
        weekend: '12:00, 17:00'
      },
      hashtags: ['#fashion', '#style', '#outfit', '#ootd', '#trendy', '#fashionista', '#styling', '#lookbook', '#fashionblogger', '#chic'],
      trends: ['seasonal fashion', 'sustainable fashion', 'outfit challenges', 'style tutorials', 'brand collaborations'],
      audience: 'fashion enthusiasts, style conscious individuals, trendsetters'
    },
    travel: {
      contentPillars: ['destinations', 'travel tips', 'cultural experiences', 'budget travel', 'photography'],
      platforms: ['instagram', 'youtube', 'tiktok', 'pinterest'],
      optimalTimes: {
        weekday: '12:00, 18:00',
        weekend: '10:00, 15:00, 20:00'
      },
      hashtags: ['#travel', '#wanderlust', '#explore', '#adventure', '#vacation', '#travelling', '#destination', '#backpacking', '#culture', '#photography'],
      trends: ['solo travel', 'sustainable tourism', 'hidden gems', 'travel hacks', 'cultural immersion'],
      audience: 'travelers, adventure seekers, culture enthusiasts'
    },
    business: {
      contentPillars: ['entrepreneurship', 'productivity', 'leadership', 'industry insights', 'success stories'],
      platforms: ['linkedin', 'instagram', 'youtube', 'twitter'],
      optimalTimes: {
        weekday: '08:00, 12:00, 17:00',
        weekend: '11:00, 16:00'
      },
      hashtags: ['#business', '#entrepreneur', '#leadership', '#productivity', '#success', '#startup', '#marketing', '#growth', '#motivation', '#innovation'],
      trends: ['remote work', 'digital transformation', 'leadership skills', 'startup stories', 'productivity hacks'],
      audience: 'entrepreneurs, business professionals, aspiring leaders'
    },
    lifestyle: {
      contentPillars: ['daily routines', 'self-care', 'home decor', 'personal growth', 'relationships'],
      platforms: ['instagram', 'tiktok', 'youtube', 'pinterest'],
      optimalTimes: {
        weekday: '09:00, 15:00, 21:00',
        weekend: '10:00, 16:00'
      },
      hashtags: ['#lifestyle', '#selfcare', '#wellness', '#mindfulness', '#homedecor', '#personalgrowth', '#dailylife', '#inspiration', '#balance', '#happiness'],
      trends: ['morning routines', 'self-care Sunday', 'home organization', 'mindfulness practices', 'work-life balance'],
      audience: 'lifestyle enthusiasts, wellness seekers, young professionals'
    },
    gaming: {
      contentPillars: ['game reviews', 'gameplay highlights', 'tutorials', 'industry news', 'streaming content'],
      platforms: ['twitch', 'youtube', 'tiktok', 'twitter', 'instagram'],
      optimalTimes: {
        weekday: '16:00, 20:00, 22:00',
        weekend: '14:00, 19:00, 23:00'
      },
      hashtags: ['#gaming', '#gamer', '#esports', '#gameplay', '#streamer', '#videogames', '#twitch', '#console', '#pc', '#mobile'],
      trends: ['new game releases', 'gaming tips', 'speedruns', 'game reviews', 'streaming highlights'],
      audience: 'gamers, esports fans, content creators'
    }
  };

  static getInstance(): CalendarGeneratorService {
    if (!CalendarGeneratorService.instance) {
      CalendarGeneratorService.instance = new CalendarGeneratorService();
    }
    return CalendarGeneratorService.instance;
  }

  constructor() {
    this.ensureDirectories();
  }

  private async ensureDirectories() {
    try {
      await fs.mkdir(this.calendarDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create calendar directory:', error);
    }
  }

  async generateMonthlyCalendar(niche: string, customPreferences?: any): Promise<MonthlyCalendar> {
    try {
      const strategy = this.nicheStrategies[niche.toLowerCase()] || this.nicheStrategies.lifestyle;
      const currentDate = new Date();
      const year = currentDate.getFullYear();
      const month = currentDate.toLocaleString('default', { month: 'long' });
      const daysInMonth = new Date(year, currentDate.getMonth() + 1, 0).getDate();

      // Generate daily posts
      const posts: CalendarPost[] = [];
      const contentTypes = ['image', 'video', 'carousel', 'story', 'reel', 'live'] as const;
      const weeklyThemes = this.generateWeeklyThemes(strategy.contentPillars);

      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, currentDate.getMonth(), day);
        const dayOfWeek = date.getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        const weekNumber = Math.ceil(day / 7);
        const theme = weeklyThemes[weekNumber - 1] || strategy.contentPillars[0];

        const post = await this.generateDailyPost({
          day,
          date: date.toISOString().split('T')[0],
          niche,
          strategy,
          theme,
          isWeekend,
          dayOfWeek,
          customPreferences
        });

        posts.push(post);
      }

      // Calculate content breakdown
      const contentBreakdown: { [key: string]: number } = {};
      const platformDistribution: { [key: string]: number } = {};

      posts.forEach(post => {
        contentBreakdown[post.contentType] = (contentBreakdown[post.contentType] || 0) + 1;
        post.platforms.forEach(platform => {
          platformDistribution[platform] = (platformDistribution[platform] || 0) + 1;
        });
      });

      const calendar: MonthlyCalendar = {
        niche,
        month,
        year,
        totalPosts: posts.length,
        contentBreakdown,
        platformDistribution,
        posts,
        weeklyThemes,
        monthlyGoals: this.generateMonthlyGoals(niche, strategy),
        budgetEstimate: this.calculateBudgetEstimate(posts),
        kpiTargets: this.generateKPITargets(niche, posts.length)
      };

      // Save calendar to file
      await this.saveCalendar(calendar);

      return calendar;
    } catch (error) {
      throw new Error(`Failed to generate calendar: ${error instanceof Error ? error instanceof Error ? error.message : String(error) : String(error)}`);
    }
  }

  private async generateDailyPost(params: {
    day: number;
    date: string;
    niche: string;
    strategy: any;
    theme: string;
    isWeekend: boolean;
    dayOfWeek: number;
    customPreferences?: any;
  }): Promise<CalendarPost> {
    const { day, date, niche, strategy, theme, isWeekend, dayOfWeek } = params;
    
    // Content type rotation for variety
    const contentTypes = ['image', 'video', 'carousel', 'story', 'reel', 'live'] as const;
    const contentType = contentTypes[day % contentTypes.length];

    // Platform selection based on content type and day
    const platforms = this.selectPlatforms(contentType, strategy.platforms, isWeekend);

    // Generate content based on theme and day patterns
    const contentIdeas = this.getContentIdeas(niche, theme, day, dayOfWeek);
    const selectedIdea = (contentIdeas as any[]).length > 0 ? (contentIdeas as any[])[Math.floor(Math.random() * (contentIdeas as any[]).length)] : { title: 'Default Title', description: 'Default Description', cta: 'Default CTA' };

    // Optimal posting time
    const optimalTime = isWeekend ? 
      strategy.optimalTimes.weekend.split(', ')[day % 2] :
      strategy.optimalTimes.weekday.split(', ')[day % 3];

    // Generate hashtags (mix of niche-specific and trending)
    const hashtags = this.generateHashtags(strategy.hashtags, theme, day);

    // Engagement tactics based on content type and day
    const engagementTactics = this.generateEngagementTactics(contentType, day, isWeekend);

    // Difficulty assessment
    const difficulty = this.assessDifficulty(contentType, theme, day);

    return {
      day,
      date,
      title: selectedIdea.title,
      description: selectedIdea.description,
      contentType,
      platforms,
      hashtags,
      optimalTime,
      engagementTactics,
      callToAction: selectedIdea.cta,
      contentPillars: [theme],
      trends: this.selectTrends(strategy.trends, day),
      difficulty,
      estimatedReach: this.estimateReach(platforms, difficulty, day),
      keywords: this.generateKeywords(theme, niche)
    };
  }

  private generateWeeklyThemes(contentPillars: string[]): string[] {
    const themes = [...contentPillars];
    // Ensure we have 5 themes for 5 weeks max
    while (themes.length < 5) {
      themes.push(contentPillars[themes.length % contentPillars.length]);
    }
    return themes.slice(0, 5);
  }

  private getContentIdeas(niche: string, theme: string, day: number, dayOfWeek: number) {
    const ideas = {
      tech: {
        tutorials: [
          { title: 'Quick Tech Tutorial', description: 'Share a 60-second tutorial on a useful tech skill', cta: 'Try this and tag us!' },
          { title: 'App Review Monday', description: 'Review a productivity app that changed your workflow', cta: 'What apps do you swear by?' },
          { title: 'Code Snippet Share', description: 'Share a useful code snippet with explanation', cta: 'Save this for later!' }
        ],
        'product reviews': [
          { title: 'Gadget Unboxing', description: 'Unbox and first impressions of the latest tech gadget', cta: 'Should I buy this?' },
          { title: 'Tech Comparison', description: 'Compare two popular tech products side by side', cta: 'Which would you choose?' },
          { title: 'Budget vs Premium', description: 'Compare budget and premium versions of the same product type', cta: 'Worth the upgrade?' }
        ],
        'industry news': [
          { title: 'Tech News Roundup', description: 'Summary of this week\'s biggest tech news', cta: 'What surprised you most?' },
          { title: 'AI Update', description: 'Latest developments in artificial intelligence', cta: 'How will this impact us?' },
          { title: 'Startup Spotlight', description: 'Feature an innovative startup solving real problems', cta: 'Follow their journey!' }
        ]
      },
      fitness: {
        workouts: [
          { title: 'Monday Motivation Workout', description: '15-minute energizing morning routine', cta: 'Did you try this?' },
          { title: 'Equipment-Free Exercise', description: 'Effective bodyweight workout for small spaces', cta: 'No excuses today!' },
          { title: 'Targeted Training', description: 'Focus on specific muscle groups with proper form tips', cta: 'Feel the burn!' }
        ],
        nutrition: [
          { title: 'Meal Prep Magic', description: 'Quick and healthy meal prep ideas for busy week', cta: 'Prep with me!' },
          { title: 'Nutrition Myth Busting', description: 'Debunk common nutrition misconceptions', cta: 'What surprised you?' },
          { title: 'Healthy Swaps', description: 'Simple ingredient swaps for healthier meals', cta: 'Try these swaps!' }
        ]
      },
      food: {
        recipes: [
          { title: '5-Minute Recipe', description: 'Quick and delicious recipe for busy days', cta: 'Made this? Show me!' },
          { title: 'Comfort Food Makeover', description: 'Healthier version of classic comfort food', cta: 'Better than the original?' },
          { title: 'Seasonal Special', description: 'Recipe featuring seasonal ingredients', cta: 'What season do you cook for?' }
        ]
      }
    };

    const nicheIdeas = ideas[niche as keyof typeof ideas] || ideas.tech;
    const themeIdeas = nicheIdeas[theme as keyof typeof nicheIdeas] || Object.values(nicheIdeas)[0];
    
    return themeIdeas || [
      { title: 'Daily Content', description: 'Engaging content for your audience', cta: 'Let me know what you think!' }
    ];
  }

  private selectPlatforms(contentType: string, availablePlatforms: string[], isWeekend: boolean): string[] {
    const platformsByContent = {
      image: ['instagram', 'pinterest', 'facebook'],
      video: ['youtube', 'tiktok', 'instagram'],
      carousel: ['instagram', 'linkedin', 'facebook'],
      story: ['instagram', 'facebook', 'snapchat'],
      reel: ['instagram', 'tiktok', 'youtube'],
      live: ['instagram', 'facebook', 'twitch', 'youtube']
    };

    const suitable = platformsByContent[contentType as keyof typeof platformsByContent] || availablePlatforms;
    const selected = suitable.filter(platform => availablePlatforms.includes(platform));
    
    // Weekend content typically goes to more platforms
    return isWeekend ? selected.slice(0, 3) : selected.slice(0, 2);
  }

  private generateHashtags(baseHashtags: string[], theme: string, day: number): string[] {
    const themeHashtags = {
      tutorials: ['#tutorial', '#howto', '#learn', '#tips'],
      workouts: ['#workout', '#exercise', '#training', '#movement'],
      recipes: ['#recipe', '#cooking', '#foodie', '#homemade'],
      reviews: ['#review', '#honest', '#recommendation', '#thoughts']
    };

    const themed = themeHashtags[theme as keyof typeof themeHashtags] || [];
    const trending = ['#trending', '#viral', '#fyp', '#explore'];
    
    // Mix base, themed, and trending hashtags
    const mixed = [...baseHashtags.slice(0, 5), ...themed.slice(0, 3), ...trending.slice(0, 2)];
    return Array.from(new Set(mixed)).slice(0, 15); // Remove duplicates and limit to 15
  }

  private generateEngagementTactics(contentType: string, day: number, isWeekend: boolean): string[] {
    const tactics = {
      universal: ['Ask a question in caption', 'Use call-to-action', 'Respond to all comments'],
      image: ['Create carousel posts', 'Use high-quality visuals', 'Add text overlay'],
      video: ['Hook viewers in first 3 seconds', 'Add captions', 'End with question'],
      story: ['Use polls and questions', 'Add location tags', 'Use trending sounds'],
      live: ['Announce in advance', 'Interact with viewers', 'Save highlights']
    };

    const universal = tactics.universal;
    const specific = tactics[contentType as keyof typeof tactics] || [];
    const weekendTactics = isWeekend ? ['Post when audience is most active', 'Cross-promote on stories'] : [];

    return [...universal.slice(0, 2), ...specific.slice(0, 2), ...weekendTactics].slice(0, 4);
  }

  private assessDifficulty(contentType: string, theme: string, day: number): 'easy' | 'medium' | 'hard' {
    const difficultyScores = {
      image: 1,
      story: 1,
      carousel: 2,
      video: 2,
      reel: 3,
      live: 3
    };

    const contentScore = difficultyScores[contentType as keyof typeof difficultyScores] || 2;
    const themeComplexity = theme.includes('tutorial') || theme.includes('review') ? 1 : 0;
    const totalScore = contentScore + themeComplexity;

    if (totalScore <= 2) return 'easy';
    if (totalScore <= 3) return 'medium';
    return 'hard';
  }

  private estimateReach(platforms: string[], difficulty: 'easy' | 'medium' | 'hard', day: number): string {
    const baseReach = {
      easy: { min: 500, max: 2000 },
      medium: { min: 1000, max: 5000 },
      hard: { min: 2000, max: 10000 }
    };

    const platformMultiplier = platforms.length * 0.5 + 0.5;
    const dayBonus = day % 7 === 0 || day % 7 === 6 ? 1.2 : 1; // Weekend bonus

    const range = baseReach[difficulty];
    const estimatedMin = Math.round(range.min * platformMultiplier * dayBonus);
    const estimatedMax = Math.round(range.max * platformMultiplier * dayBonus);

    return `${estimatedMin.toLocaleString()} - ${estimatedMax.toLocaleString()}`;
  }

  private generateKeywords(theme: string, niche: string): string[] {
    const keywordSets = {
      tech: ['technology', 'innovation', 'digital', 'software', 'gadgets'],
      fitness: ['exercise', 'health', 'wellness', 'strength', 'cardio'],
      food: ['recipe', 'cooking', 'ingredients', 'meal', 'nutrition'],
      fashion: ['style', 'outfit', 'trend', 'clothing', 'accessories'],
      travel: ['destination', 'adventure', 'culture', 'explore', 'journey']
    };

    const nicheKeywords = keywordSets[niche as keyof typeof keywordSets] || keywordSets.tech;
    const themeKeywords = [theme, `${theme} tips`, `${theme} guide`];
    
    return [...nicheKeywords.slice(0, 3), ...themeKeywords].slice(0, 5);
  }

  private selectTrends(availableTrends: string[], day: number): string[] {
    const numTrends = Math.min(2, availableTrends.length);
    const startIndex = (day - 1) % availableTrends.length;
    return availableTrends.slice(startIndex, startIndex + numTrends);
  }

  private generateMonthlyGoals(niche: string, strategy: any): string[] {
    return [
      `Increase follower count by 15-25%`,
      `Achieve 10% engagement rate across all platforms`,
      `Launch 2 new content series`,
      `Collaborate with 3 ${niche} influencers`,
      `Drive 20% more traffic to website/bio link`
    ];
  }

  private calculateBudgetEstimate(posts: CalendarPost[]): string {
    const baseCost = posts.length * 2; // $2 per post for basic tools
    const videoCosts = posts.filter(p => p.contentType === 'video' || p.contentType === 'reel').length * 10;
    const liveCosts = posts.filter(p => p.contentType === 'live').length * 5;
    const promotionBudget = 100; // Monthly promotion budget
    
    const total = baseCost + videoCosts + liveCosts + promotionBudget;
    return `$${total} - $${total + 200} (including optional paid promotion)`;
  }

  private generateKPITargets(niche: string, totalPosts: number) {
    return {
      followers: `+${Math.round(totalPosts * 15)} - ${Math.round(totalPosts * 25)}`,
      engagement: '8% - 12%',
      reach: `${(totalPosts * 1000).toLocaleString()} - ${(totalPosts * 3000).toLocaleString()}`,
      conversions: '2% - 5%'
    };
  }

  private async saveCalendar(calendar: MonthlyCalendar): Promise<void> {
    try {
      const filename = `${calendar.niche}-${calendar.month}-${calendar.year}.json`;
      const filepath = path.join(this.calendarDir, filename);
      await fs.writeFile(filepath, JSON.stringify(calendar, null, 2));
    } catch (error) {
      console.error('Failed to save calendar:', error);
    }
  }

  async getAvailableNiches(): Promise<string[]> {
    return Object.keys(this.nicheStrategies);
  }

  async getSavedCalendars(): Promise<string[]> {
    try {
      const files = await fs.readdir(this.calendarDir);
      return files.filter(file => file.endsWith('.json'));
    } catch (error) {
      return [];
    }
  }

  async loadCalendar(filename: string): Promise<MonthlyCalendar | null> {
    try {
      const filepath = path.join(this.calendarDir, filename);
      const data = await fs.readFile(filepath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      return null;
    }
  }
}

export const calendarGeneratorService = CalendarGeneratorService.getInstance();