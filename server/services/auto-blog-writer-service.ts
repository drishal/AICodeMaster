export interface BlogPost {
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

export interface BlogGenerationRequest {
  primaryKeyword: string;
  secondaryKeywords: string[];
  targetLength: 'short' | 'medium' | 'long';
  tone: 'professional' | 'casual' | 'informative' | 'persuasive';
  audience: string;
  includeOutline: boolean;
  includeFAQ: boolean;
  includeConclusion: boolean;
}

export class AutoBlogWriterService {
  
  generateBlogPost(request: BlogGenerationRequest): BlogPost {
    const { primaryKeyword, secondaryKeywords, targetLength, tone, audience } = request;
    
    // Generate comprehensive blog content structure
    const blogData = this.createBlogStructure(primaryKeyword, secondaryKeywords, targetLength);
    const content = this.generateContent(blogData, tone, audience, request);
    
    return {
      id: Date.now().toString(),
      title: blogData.title,
      content,
      keywords: [primaryKeyword, ...secondaryKeywords],
      metaDescription: blogData.metaDescription,
      headings: blogData.headings,
      wordCount: this.calculateWordCount(content),
      readingTime: this.calculateReadingTime(content),
      seoScore: this.calculateSEOScore(content, [primaryKeyword, ...secondaryKeywords]),
      createdAt: new Date().toISOString(),
      category: this.categorizeKeyword(primaryKeyword),
      tags: this.generateTags(primaryKeyword, secondaryKeywords),
      outline: blogData.outline
    };
  }

  private createBlogStructure(primaryKeyword: string, secondaryKeywords: string[], targetLength: string) {
    const capitalizedKeyword = primaryKeyword.charAt(0).toUpperCase() + primaryKeyword.slice(1);
    
    const titles = [
      `The Complete Guide to ${capitalizedKeyword}`,
      `${capitalizedKeyword}: Everything You Need to Know`,
      `How to Master ${capitalizedKeyword} in 2025`,
      `${capitalizedKeyword} Best Practices and Tips`,
      `Understanding ${capitalizedKeyword}: A Comprehensive Overview`
    ];

    const title = titles[Math.floor(Math.random() * titles.length)];
    
    const headings = this.generateHeadings(primaryKeyword, secondaryKeywords, targetLength);
    const outline = this.generateOutline(headings);
    
    return {
      title,
      metaDescription: `Learn everything about ${primaryKeyword}. Comprehensive guide covering ${secondaryKeywords.slice(0, 2).join(', ')} and more. Expert insights and practical tips.`,
      headings,
      outline
    };
  }

  private generateHeadings(primaryKeyword: string, secondaryKeywords: string[], targetLength: string): string[] {
    const baseHeadings = [
      `What is ${primaryKeyword}?`,
      `Benefits of ${primaryKeyword}`,
      `How to Get Started with ${primaryKeyword}`,
      `Best Practices for ${primaryKeyword}`,
      `Common Mistakes to Avoid`,
      `Conclusion`
    ];

    const extendedHeadings = [
      ...baseHeadings.slice(0, 3),
      `Advanced ${primaryKeyword} Techniques`,
      `${primaryKeyword} vs Alternatives`,
      `Case Studies and Examples`,
      `Tools and Resources for ${primaryKeyword}`,
      ...baseHeadings.slice(3)
    ];

    // Add secondary keyword sections
    const keywordSections = secondaryKeywords.slice(0, 3).map(keyword => 
      `${keyword} and ${primaryKeyword}`
    );

    if (targetLength === 'short') {
      return [...baseHeadings.slice(0, 4), 'Conclusion'];
    } else if (targetLength === 'medium') {
      return [...baseHeadings, ...keywordSections.slice(0, 2)];
    } else {
      return [...extendedHeadings, ...keywordSections];
    }
  }

  private generateOutline(headings: string[]): string[] {
    return headings.map(heading => {
      return `${heading}:\n  • Key points and explanations\n  • Practical examples\n  • Actionable tips`;
    });
  }

  private generateContent(blogData: any, tone: string, audience: string, request: BlogGenerationRequest): string {
    const { title, headings } = blogData;
    let content = `# ${title}\n\n`;

    // Introduction
    content += this.generateIntroduction(request.primaryKeyword, tone);

    // Main content sections
    headings.forEach((heading: string, index: number) => {
      if (heading !== 'Conclusion') {
        content += `\n## ${heading}\n\n`;
        content += this.generateSectionContent(heading, request.primaryKeyword, request.secondaryKeywords, tone, audience);
      }
    });

    // FAQ Section
    if (request.includeFAQ) {
      content += '\n## Frequently Asked Questions\n\n';
      content += this.generateFAQ(request.primaryKeyword, request.secondaryKeywords);
    }

    // Conclusion
    if (request.includeConclusion) {
      content += '\n## Conclusion\n\n';
      content += this.generateConclusion(request.primaryKeyword, tone);
    }

    return content;
  }

  private generateIntroduction(primaryKeyword: string, tone: string): string {
    const introTemplates = {
      professional: `In today's competitive landscape, understanding ${primaryKeyword} has become essential for businesses and professionals alike. This comprehensive guide will explore the key concepts, strategies, and best practices to help you master ${primaryKeyword} effectively.\n\n`,
      
      casual: `Hey there! Looking to learn about ${primaryKeyword}? You've come to the right place! In this guide, we'll break down everything you need to know about ${primaryKeyword} in simple, easy-to-understand terms.\n\n`,
      
      informative: `${primaryKeyword} is a critical topic that affects many aspects of modern business and technology. This article provides detailed insights, practical examples, and expert analysis to help you understand and implement ${primaryKeyword} successfully.\n\n`,
      
      persuasive: `Don't let the competition get ahead while you're still figuring out ${primaryKeyword}. This guide will show you exactly how to leverage ${primaryKeyword} to achieve remarkable results and stay ahead of the curve.\n\n`
    };

    return introTemplates[tone as keyof typeof introTemplates] || introTemplates.informative;
  }

  private generateSectionContent(heading: string, primaryKeyword: string, secondaryKeywords: string[], tone: string, audience: string): string {
    // Generate contextual content based on heading
    if (heading.includes('What is')) {
      return `${primaryKeyword} refers to a comprehensive approach that combines various strategies and methodologies. Understanding the fundamental concepts is crucial for successful implementation.\n\n**Key Components:**\n• Core principles and frameworks\n• Implementation strategies\n• Best practices and guidelines\n• Common applications and use cases\n\nFor ${audience}, this means having a clear understanding of how ${primaryKeyword} can be effectively utilized to achieve specific goals and objectives.\n\n`;
    }

    if (heading.includes('Benefits')) {
      return `The advantages of implementing ${primaryKeyword} are numerous and significant:\n\n**Primary Benefits:**\n• Improved efficiency and productivity\n• Enhanced performance and results\n• Cost-effective solutions\n• Competitive advantage\n• Scalable implementation\n\n**Secondary Benefits:**\n• Better ${secondaryKeywords[0] || 'resource management'}\n• Improved ${secondaryKeywords[1] || 'operational efficiency'}\n• Enhanced ${secondaryKeywords[2] || 'strategic planning'}\n\nThese benefits make ${primaryKeyword} an essential component of any successful strategy.\n\n`;
    }

    if (heading.includes('How to Get Started') || heading.includes('Getting Started')) {
      return `Starting your ${primaryKeyword} journey requires a systematic approach:\n\n**Step 1: Assessment and Planning**\n• Evaluate current situation\n• Define clear objectives\n• Identify required resources\n\n**Step 2: Implementation**\n• Begin with pilot projects\n• Gradually scale up efforts\n• Monitor progress regularly\n\n**Step 3: Optimization**\n• Analyze results and performance\n• Make necessary adjustments\n• Continuously improve processes\n\n**Pro Tips for Beginners:**\n• Start small and scale gradually\n• Focus on ${secondaryKeywords[0] || 'core fundamentals'} first\n• Seek expert guidance when needed\n• Document your progress and learnings\n\n`;
    }

    if (heading.includes('Best Practices')) {
      return `Follow these proven best practices to maximize your ${primaryKeyword} success:\n\n**Strategic Approach:**\n• Develop a comprehensive plan\n• Set measurable goals and KPIs\n• Regular monitoring and evaluation\n• Continuous improvement mindset\n\n**Implementation Guidelines:**\n• Focus on ${secondaryKeywords[0] || 'quality over quantity'}\n• Ensure proper ${secondaryKeywords[1] || 'resource allocation'}\n• Maintain consistent ${secondaryKeywords[2] || 'execution standards'}\n• Document processes and procedures\n\n**Common Success Factors:**\n• Strong leadership and commitment\n• Clear communication and collaboration\n• Regular training and skill development\n• Adaptive and flexible approach\n\n`;
    }

    if (heading.includes('Common Mistakes')) {
      return `Avoid these common pitfalls when implementing ${primaryKeyword}:\n\n**Strategic Mistakes:**\n• Lack of clear objectives and planning\n• Insufficient resource allocation\n• Poor timing and execution\n• Neglecting stakeholder involvement\n\n**Implementation Errors:**\n• Rushing the process without proper preparation\n• Ignoring ${secondaryKeywords[0] || 'important factors'}\n• Overlooking ${secondaryKeywords[1] || 'critical components'}\n• Failing to measure and track progress\n\n**How to Avoid These Mistakes:**\n• Take time for thorough planning\n• Invest in proper training and education\n• Seek expert advice and guidance\n• Learn from others' experiences\n• Regular review and adjustment\n\n`;
    }

    // Default content for other sections
    return `This section covers important aspects of ${heading.toLowerCase()} related to ${primaryKeyword}. Understanding these concepts is crucial for successful implementation and achieving desired outcomes.\n\n**Key Points:**\n• Comprehensive analysis and understanding\n• Practical implementation strategies\n• Real-world applications and examples\n• Best practices and recommendations\n\nBy focusing on these areas, you can ensure effective utilization of ${primaryKeyword} in your specific context and requirements.\n\n`;
  }

  private generateFAQ(primaryKeyword: string, secondaryKeywords: string[]): string {
    const faqs = [
      {
        question: `What are the key benefits of ${primaryKeyword}?`,
        answer: `The main benefits include improved efficiency, better results, cost-effectiveness, and competitive advantage. ${primaryKeyword} also helps with ${secondaryKeywords[0] || 'optimization'} and ${secondaryKeywords[1] || 'performance improvement'}.`
      },
      {
        question: `How long does it take to see results from ${primaryKeyword}?`,
        answer: `Results typically vary depending on implementation scope and complexity. Most organizations see initial improvements within 30-90 days, with significant results becoming apparent after 3-6 months of consistent application.`
      },
      {
        question: `What are the common challenges with ${primaryKeyword}?`,
        answer: `Common challenges include resource allocation, stakeholder buy-in, proper planning, and maintaining consistency. Success requires addressing ${secondaryKeywords[0] || 'implementation issues'} and ${secondaryKeywords[1] || 'operational challenges'}.`
      },
      {
        question: `Is ${primaryKeyword} suitable for small businesses?`,
        answer: `Yes, ${primaryKeyword} can be adapted for businesses of all sizes. Small businesses often benefit from simplified implementations that focus on core components and gradual scaling.`
      }
    ];

    return faqs.map(faq => `**${faq.question}**\n\n${faq.answer}\n\n`).join('');
  }

  private generateConclusion(primaryKeyword: string, tone: string): string {
    const conclusions = {
      professional: `In conclusion, ${primaryKeyword} represents a critical component of modern business strategy. By implementing the strategies and best practices outlined in this guide, organizations can achieve significant improvements in performance and competitiveness. Success requires commitment, proper planning, and consistent execution.\n\n`,
      
      casual: `And there you have it! Everything you need to know about ${primaryKeyword}. Remember, the key is to start small, stay consistent, and keep learning. You've got this!\n\n`,
      
      informative: `This comprehensive overview of ${primaryKeyword} provides the foundation for successful implementation. By understanding the key concepts, benefits, and best practices, you can make informed decisions and achieve optimal results.\n\n`,
      
      persuasive: `Don't wait any longer to implement ${primaryKeyword} in your strategy. The benefits are clear, the methods are proven, and the time is now. Take action today and start seeing results tomorrow.\n\n`
    };

    return conclusions[tone as keyof typeof conclusions] || conclusions.informative;
  }

  private calculateWordCount(content: string): number {
    return content.split(/\s+/).filter(word => word.length > 0).length;
  }

  private calculateReadingTime(content: string): number {
    const wordsPerMinute = 200;
    const wordCount = this.calculateWordCount(content);
    return Math.ceil(wordCount / wordsPerMinute);
  }

  private calculateSEOScore(content: string, keywords: string[]): number {
    let score = 0;
    const contentLower = content.toLowerCase();
    
    // Check keyword density
    keywords.forEach(keyword => {
      const keywordCount = (contentLower.match(new RegExp(keyword.toLowerCase(), 'g')) || []).length;
      const density = (keywordCount / this.calculateWordCount(content)) * 100;
      
      if (density >= 1 && density <= 3) score += 20;
      else if (density > 0) score += 10;
    });

    // Check content length
    const wordCount = this.calculateWordCount(content);
    if (wordCount >= 1000) score += 20;
    else if (wordCount >= 500) score += 15;
    else if (wordCount >= 300) score += 10;

    // Check headings
    const headingCount = (content.match(/#{1,6}\s/g) || []).length;
    if (headingCount >= 3) score += 20;
    else if (headingCount >= 1) score += 10;

    return Math.min(100, score);
  }

  private categorizeKeyword(keyword: string): string {
    const categories = {
      'technology': ['tech', 'software', 'app', 'digital', 'ai', 'machine learning', 'programming'],
      'business': ['marketing', 'sales', 'strategy', 'management', 'finance', 'growth'],
      'lifestyle': ['health', 'fitness', 'travel', 'food', 'fashion', 'home'],
      'education': ['learn', 'course', 'tutorial', 'guide', 'training', 'skill'],
      'entertainment': ['game', 'movie', 'music', 'art', 'sport', 'hobby']
    };

    const keywordLower = keyword.toLowerCase();
    
    for (const [category, terms] of Object.entries(categories)) {
      if (terms.some(term => keywordLower.includes(term))) {
        return category;
      }
    }

    return 'general';
  }

  private generateTags(primaryKeyword: string, secondaryKeywords: string[]): string[] {
    const baseTags = [primaryKeyword];
    const additionalTags = [
      'guide',
      'tips',
      'best practices',
      'how to',
      '2025',
      'complete guide'
    ];

    return [...baseTags, ...secondaryKeywords.slice(0, 3), ...additionalTags.slice(0, 3)];
  }

  // Bulk blog generation
  generateMultipleBlogs(keywords: string[], baseRequest: Omit<BlogGenerationRequest, 'primaryKeyword'>): BlogPost[] {
    return keywords.map(keyword => {
      const request: BlogGenerationRequest = {
        ...baseRequest,
        primaryKeyword: keyword
      };
      return this.generateBlogPost(request);
    });
  }

  // SEO optimization suggestions
  generateSEOSuggestions(blogPost: BlogPost): string[] {
    const suggestions: string[] = [];

    if (blogPost.seoScore < 70) {
      suggestions.push('Improve keyword density - aim for 1-3% for primary keywords');
    }

    if (blogPost.wordCount < 800) {
      suggestions.push('Consider increasing content length to 800+ words for better SEO');
    }

    if (blogPost.headings.length < 3) {
      suggestions.push('Add more headings (H2, H3) to improve content structure');
    }

    if (blogPost.metaDescription.length > 160) {
      suggestions.push('Shorten meta description to under 160 characters');
    }

    if (!blogPost.content.includes('FAQ')) {
      suggestions.push('Add FAQ section to target featured snippets');
    }

    return suggestions;
  }
}

export const autoBlogWriterService = new AutoBlogWriterService();