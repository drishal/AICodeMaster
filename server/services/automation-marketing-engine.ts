import OpenAI from 'openai';
import { leadCRMService } from './lead-crm-service';
import type { InsertContact } from '@shared/schema';

// API Key rotation system for handling quota limits
const API_KEYS = (process.env.OPENAI_API_KEYS || process.env.OPENAI_API_KEY || "").split(',').filter(key => key.trim());
let keyIndex = 0;

function getNextKey(): string {
  if (API_KEYS.length === 0) {
    throw new Error('No OpenAI API keys configured');
  }
  const key = API_KEYS[keyIndex].trim();
  keyIndex = (keyIndex + 1) % API_KEYS.length;
  return key;
}

function createOpenAIClient(): OpenAI {
  return new OpenAI({
    apiKey: getNextKey()
  });
}

export class AutomationMarketingEngine {
  
  // SEO keyword generator with key rotation
  async generateSEOKeywords(topic: string) {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt < API_KEYS.length; attempt++) {
      try {
        const openai = createOpenAIClient();
        const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are an SEO expert. Generate comprehensive keyword research for the given topic. Return JSON with:
            {
              "primary_keywords": ["main keyword phrases"],
              "long_tail_keywords": ["specific long-tail variations"],
              "related_keywords": ["semantically related terms"],
              "search_volume_estimates": {"keyword": "volume_category"},
              "competition_analysis": {"keyword": "difficulty_level"},
              "content_suggestions": ["content ideas based on keywords"]
            }`
          },
          {
            role: "user",
            content: `Generate SEO keywords for: ${topic}`
          }
        ],
        response_format: { type: "json_object" }
      });

        return JSON.parse(response.choices[0].message.content || '{}');
      } catch (error: any) {
        lastError = error;
        console.error(`OpenAI API error (attempt ${attempt + 1}):`, error);
        
        if (error.status === 429 && error.code === 'insufficient_quota' && attempt < API_KEYS.length - 1) {
          console.log(`Quota exceeded on key ${attempt + 1}, trying next key...`);
          continue;
        }
        break;
      }
    }
    
    throw new Error(`SEO keyword generation failed: ${lastError?.message || 'All API keys exhausted'}`);
  }

  // Emotion/tone detection with key rotation
  async detectEmotion(text: string) {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt < API_KEYS.length; attempt++) {
      try {
        const openai = createOpenAIClient();
        const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are an emotion detection expert. Analyze the emotional tone of the given text. Return JSON with:
            {
              "primary_emotion": "main emotion detected",
              "secondary_emotions": ["additional emotions present"],
              "sentiment": "positive/negative/neutral",
              "confidence_score": 0.95,
              "emotional_intensity": "low/medium/high",
              "tone_attributes": ["professional", "casual", "urgent", etc.],
              "recommended_response_tone": "suggested tone for response"
            }`
          },
          {
            role: "user",
            content: `Analyze the emotion and tone of this text: "${text}"`
          }
        ],
        response_format: { type: "json_object" }
      });

        return JSON.parse(response.choices[0].message.content || '{}');
      } catch (error: any) {
        lastError = error;
        console.error(`OpenAI API error (attempt ${attempt + 1}):`, error);
        
        if (error.status === 429 && error.code === 'insufficient_quota' && attempt < API_KEYS.length - 1) {
          console.log(`Quota exceeded on key ${attempt + 1}, trying next key...`);
          continue;
        }
        break;
      }
    }
    
    throw new Error(`Emotion detection failed: ${lastError?.message || 'All API keys exhausted'}`);
  }

  // Content post pack generator with key rotation
  async generateContentPack(niche: string) {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt < API_KEYS.length; attempt++) {
      try {
        const openai = createOpenAIClient();
        const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a content marketing expert. Create a pack of 3 diverse, engaging posts for the given niche. Return JSON with:
            {
              "posts": [
                {
                  "type": "educational/promotional/entertaining",
                  "title": "post title",
                  "content": "full post content",
                  "hashtags": ["relevant hashtags"],
                  "call_to_action": "specific CTA",
                  "best_time_to_post": "optimal posting time",
                  "platform_optimization": {"instagram": "tips", "facebook": "tips", "linkedin": "tips"}
                }
              ],
              "content_calendar_suggestions": ["when to post each piece"],
              "engagement_strategies": ["how to boost engagement"]
            }`
          },
          {
            role: "user",
            content: `Create a content pack for the ${niche} niche`
          }
        ],
        response_format: { type: "json_object" }
      });

        return JSON.parse(response.choices[0].message.content || '{}');
      } catch (error: any) {
        lastError = error;
        console.error(`OpenAI API error (attempt ${attempt + 1}):`, error);
        
        if (error.status === 429 && error.code === 'insufficient_quota' && attempt < API_KEYS.length - 1) {
          console.log(`Quota exceeded on key ${attempt + 1}, trying next key...`);
          continue;
        }
        break;
      }
    }
    
    throw new Error(`Content pack generation failed: ${lastError?.message || 'All API keys exhausted'}`);
  }

  // Strategy generator (ROAS vs Engagement) with key rotation
  async generateStrategy(type: string) {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt < API_KEYS.length; attempt++) {
      try {
        const openai = createOpenAIClient();
        const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a digital marketing strategist. Create a comprehensive strategy based on the specified type. Return JSON with:
            {
              "strategy_type": "ROAS-focused/Engagement-focused/Hybrid",
              "objective": "main goal of the strategy",
              "target_metrics": ["key performance indicators"],
              "budget_allocation": {"channel": "percentage"},
              "timeline": "implementation timeline",
              "tactics": [
                {
                  "tactic_name": "specific tactic",
                  "description": "how to implement",
                  "expected_outcome": "what to expect",
                  "budget_required": "₹0 or minimal cost",
                  "timeframe": "when to implement"
                }
              ],
              "optimization_tips": ["ongoing optimization strategies"],
              "risk_mitigation": ["potential risks and solutions"]
            }`
          },
          {
            role: "user",
            content: `Generate a ${type} marketing strategy with zero-budget optimization focus`
          }
        ],
        response_format: { type: "json_object" }
      });

        return JSON.parse(response.choices[0].message.content || '{}');
      } catch (error: any) {
        lastError = error;
        console.error(`OpenAI API error (attempt ${attempt + 1}):`, error);
        
        if (error.status === 429 && error.code === 'insufficient_quota' && attempt < API_KEYS.length - 1) {
          console.log(`Quota exceeded on key ${attempt + 1}, trying next key...`);
          continue;
        }
        break;
      }
    }
    
    throw new Error(`Strategy generation failed: ${lastError?.message || 'All API keys exhausted'}`);
  }

  // Lead capture functionality
  async captureLeadData(name: string, email: string, phone: string, type: string, interest: string) {
    try {
      // Validate required fields
      if (!name || !email) {
        throw new Error('Name and email are required for lead capture');
      }

      // Create contact data
      const contactData: InsertContact = {
        firstName: name.split(' ')[0] || name,
        lastName: name.split(' ').slice(1).join(' ') || '',
        email: email,
        phone: phone || '',
        company: '',
        position: '',
        status: 'new',
        source: 'automation_engine',
        leadScore: 0,
        tags: [type, interest].filter(Boolean),
        notes: `Lead captured via automation engine. Type: ${type}, Interest: ${interest}`,
        customFields: JSON.stringify({
          lead_type: type,
          interest_area: interest,
          capture_method: 'automation_command',
          capture_date: new Date().toISOString()
        })
      };

      // Save to CRM
      const savedContact = await leadCRMService.createContact(contactData);

      // Calculate initial lead score
      await leadCRMService.updateLeadScore(savedContact.id);

      return {
        success: true,
        contact_id: savedContact.id,
        message: 'Lead captured successfully',
        next_steps: [
          'Send welcome email',
          'Schedule follow-up call',
          'Add to nurture sequence'
        ]
      };
    } catch (error) {
      throw new Error(`Lead capture failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // AI marketing email generator with key rotation
  async generateMarketingEmail(name: string, contactId?: number) {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt < API_KEYS.length; attempt++) {
      try {
        let contactContext = '';
        
        // Get contact information if ID provided
        if (contactId) {
          try {
            const contact = await leadCRMService.getContact(contactId);
            contactContext = `
              Contact Details:
              - Company: ${contact.company || 'Not specified'}
              - Position: ${contact.position || 'Not specified'}
              - Lead Score: ${contact.leadScore}
              - Status: ${contact.status}
              - Tags: ${contact.tags?.join(', ') || 'None'}
              - Notes: ${contact.notes || 'None'}
            `;
          } catch (error) {
            // Continue without contact context if not found
          }
        }

        const openai = createOpenAIClient();
        const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are an expert email marketing copywriter. Create personalized, engaging marketing email copy. Return JSON with:
            {
              "subject_lines": ["3 different subject line options"],
              "email_body": "complete email content with personalization",
              "call_to_action": "specific CTA",
              "follow_up_sequence": ["suggested follow-up emails"],
              "personalization_elements": ["ways this email is personalized"],
              "a_b_test_suggestions": ["elements to test"],
              "optimal_send_time": "best time to send",
              "email_type": "welcome/nurture/promotional/follow-up"
            }`
          },
          {
            role: "user",
            content: `Generate marketing email copy for ${name}. ${contactContext}`
          }
        ],
        response_format: { type: "json_object" }
      });

        return JSON.parse(response.choices[0].message.content || '{}');
      } catch (error: any) {
        lastError = error;
        console.error(`OpenAI API error (attempt ${attempt + 1}):`, error);
        
        if (error.status === 429 && error.code === 'insufficient_quota' && attempt < API_KEYS.length - 1) {
          console.log(`Quota exceeded on key ${attempt + 1}, trying next key...`);
          continue;
        }
        break;
      }
    }
    
    throw new Error(`Email generation failed: ${lastError?.message || 'All API keys exhausted'}`);
  }

  // WhatsApp sales/engagement copy generator with key rotation
  async generateWhatsAppCopy(name: string, contactId?: number) {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt < API_KEYS.length; attempt++) {
      try {
        let contactContext = '';
        
        // Get contact information if ID provided
        if (contactId) {
          try {
            const contact = await leadCRMService.getContact(contactId);
            contactContext = `
              Contact Details:
              - Company: ${contact.company || 'Not specified'}
              - Position: ${contact.position || 'Not specified'}
              - Lead Score: ${contact.leadScore}
              - Status: ${contact.status}
              - Interest Areas: ${contact.tags?.join(', ') || 'General'}
            `;
          } catch (error) {
            // Continue without contact context if not found
          }
        }

        const openai = createOpenAIClient();
        const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a WhatsApp marketing expert. Create engaging, conversational WhatsApp messages that drive sales and engagement. Return JSON with:
            {
              "message_variations": [
                {
                  "type": "opening_message",
                  "content": "initial outreach message",
                  "tone": "casual/professional/friendly"
                },
                {
                  "type": "follow_up",
                  "content": "follow-up message",
                  "tone": "persistent but not pushy"
                },
                {
                  "type": "value_proposition",
                  "content": "message highlighting value",
                  "tone": "benefit-focused"
                }
              ],
              "conversation_starters": ["questions to engage the contact"],
              "call_to_action_options": ["different CTAs to test"],
              "emoji_suggestions": ["relevant emojis to use"],
              "timing_recommendations": ["best times to send messages"],
              "response_handling": ["how to handle common responses"]
            }`
          },
          {
            role: "user",
            content: `Generate WhatsApp sales/engagement copy for ${name}. ${contactContext}`
          }
        ],
        response_format: { type: "json_object" }
      });

        return JSON.parse(response.choices[0].message.content || '{}');
      } catch (error: any) {
        lastError = error;
        console.error(`OpenAI API error (attempt ${attempt + 1}):`, error);
        
        if (error.status === 429 && error.code === 'insufficient_quota' && attempt < API_KEYS.length - 1) {
          console.log(`Quota exceeded on key ${attempt + 1}, trying next key...`);
          continue;
        }
        break;
      }
    }
    
    throw new Error(`WhatsApp copy generation failed: ${lastError?.message || 'All API keys exhausted'}`);
  }

  // List contacts (proxy to CRM service)
  async listContacts(filters?: {
    search?: string;
    status?: string;
    source?: string;
    sort?: string;
  }) {
    try {
      return await leadCRMService.getContacts(filters || {});
    } catch (error: any) {
      throw new Error(`Failed to list contacts: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Export CSV (proxy to CRM service)
  async exportContactsCSV() {
    try {
      return await leadCRMService.exportContacts();
    } catch (error) {
      throw new Error(`Failed to export CSV: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Process automation command
  async processCommand(commandText: string) {
    try {
      const command = commandText.toLowerCase().trim();
      
      // Parse command and parameters
      if (command.startsWith('/seo ')) {
        const topic = command.replace('/seo ', '');
        return await this.generateSEOKeywords(topic);
      }
      
      if (command.startsWith('/emotion ')) {
        const text = command.replace('/emotion ', '');
        return await this.detectEmotion(text);
      }
      
      if (command.startsWith('/content ')) {
        const niche = command.replace('/content ', '');
        return await this.generateContentPack(niche);
      }
      
      if (command.startsWith('/strategy ')) {
        const type = command.replace('/strategy ', '');
        return await this.generateStrategy(type);
      }
      
      if (command.startsWith('/capture ')) {
        const params = command.replace('/capture ', '').split(' ');
        if (params.length < 5) {
          throw new Error('Usage: /capture [name] [email] [phone] [type] [interest]');
        }
        return await this.captureLeadData(params[0], params[1], params[2], params[3], params[4]);
      }
      
      if (command.startsWith('/email ')) {
        const name = command.replace('/email ', '');
        return await this.generateMarketingEmail(name);
      }
      
      if (command.startsWith('/whatsapp ')) {
        const name = command.replace('/whatsapp ', '');
        return await this.generateWhatsAppCopy(name);
      }
      
      if (command === '/list_contacts') {
        return await this.listContacts();
      }
      
      if (command === '/export_csv') {
        return await this.exportContactsCSV();
      }
      
      if (command.startsWith('/calendar ')) {
        const niche = command.replace('/calendar ', '').trim().toLowerCase();
        return await this.handleCalendarCommand(niche);
      }
      
      if (command.startsWith('/trends ')) {
        const category = command.replace('/trends ', '').trim().toLowerCase();
        return await this.handleTrendsCommand(category);
      }

      if (command.startsWith('/blog ')) {
        const args = command.replace('/blog ', '').split(' ');
        return await this.handleBlogCommand(args);
      }
      
      throw new Error(`Unknown command: ${command}. Available commands: /seo, /emotion, /content, /strategy, /capture, /email, /whatsapp, /calendar, /trends, /blog, /list_contacts, /export_csv`);
      
    } catch (error) {
      throw new Error(`Command processing failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Calendar generation command handler
  private async handleCalendarCommand(niche: string): Promise<string> {
    if (!niche) {
      return 'Usage: /calendar [niche] - specify a niche (tech, fitness, food, fashion, travel, business, lifestyle, gaming)';
    }

    try {
      // Import calendar generator service
      const { calendarGeneratorService } = await import('./calendar-generator-service');
      
      // Generate full calendar using the service
      const calendar = await calendarGeneratorService.generateMonthlyCalendar(niche);
      
      // Format output for command line
      const summary = `📅 ${calendar.month} ${calendar.year} Calendar - ${calendar.niche.toUpperCase()}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 OVERVIEW:
• Total Posts: ${calendar.totalPosts}
• Platforms: ${Object.keys(calendar.platformDistribution).join(', ')}
• Budget Estimate: ${calendar.budgetEstimate}

🎯 KPI TARGETS:
• Followers: ${calendar.kpiTargets.followers}
• Engagement: ${calendar.kpiTargets.engagement}
• Reach: ${calendar.kpiTargets.reach}
• Conversions: ${calendar.kpiTargets.conversions}

📈 CONTENT BREAKDOWN:
${Object.entries(calendar.contentBreakdown)
  .map(([type, count]) => `• ${type.charAt(0).toUpperCase() + type.slice(1)}: ${count} posts`)
  .join('\n')}

🗓️ SAMPLE POSTS (First 7 Days):
${calendar.posts.slice(0, 7).map(post => 
  `Day ${post.day}: ${post.title}
  • Type: ${post.contentType} | Time: ${post.optimalTime}
  • Platforms: ${post.platforms.join(', ')}
  • CTA: ${post.callToAction}`
).join('\n\n')}

💡 WEEKLY THEMES:
${calendar.weeklyThemes.map((theme, i) => `Week ${i + 1}: ${theme}`).join('\n')}

Full calendar saved as: ${calendar.niche}-${calendar.month}-${calendar.year}.json`;
      
      return summary;
    } catch (error) {
      return `Failed to generate calendar: ${error instanceof Error ? error instanceof Error ? error.message : String(error) : String(error)}`;
    }
  }

  // Trends analysis command handler
  private async handleTrendsCommand(category: string): Promise<string> {
    if (!category) {
      return 'Usage: /trends [category] - specify a category (technology, entertainment, business)';
    }

    try {
      // Import trends scraper service
      const { trendsScraperService } = await import('./trends-scraper-service');
      
      // Get comprehensive analysis
      const analysis = await trendsScraperService.getComprehensiveAnalysis({
        categories: [category],
        region: 'Global',
        includeYouTube: true
      });
      
      // Format output for command line
      const summary = `📈 TRENDS ANALYSIS - ${category.toUpperCase()}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔍 GOOGLE TRENDS (Top 10):
${analysis.googleTrends.slice(0, 10).map((trend, i) => 
  `${i + 1}. ${trend.keyword} (${trend.searchVolume}, ${trend.trend})`
).join('\n')}

📺 YOUTUBE TRENDS (Top 5):
${analysis.youtubeTrends.slice(0, 5).map((video, i) => 
  `${i + 1}. ${video.title}
     ${video.channel} • ${video.views} views • ${video.engagement_rate}% engagement`
).join('\n\n')}

💡 KEY INSIGHTS:
• Top Keywords: ${analysis.combinedInsights.topKeywords.slice(0, 5).join(', ')}
• Emerging Topics: ${analysis.combinedInsights.emergingTopics.slice(0, 3).join(', ')}
• Best Times: ${analysis.combinedInsights.bestTimes.join(', ')}

🎯 CONTENT OPPORTUNITIES:
${analysis.combinedInsights.contentOpportunities.slice(0, 3).map(opp => `• ${opp}`).join('\n')}

#️⃣ RECOMMENDED HASHTAGS:
${analysis.combinedInsights.recommendedHashtags.slice(0, 8).join(' ')}

Analysis saved as: trends-analysis-${new Date().toISOString().split('T')[0]}.json`;
      
      return summary;
    } catch (error) {
      return `Failed to analyze trends: ${error instanceof Error ? error instanceof Error ? error.message : String(error) : String(error)}`;
    }
  }

  private async handleBlogCommand(args: string[]): Promise<string> {
    const keyword = args.join(' ').trim();
    
    if (!keyword) {
      return 'Usage: /blog [keyword] - Generate a blog post from a keyword (e.g., /blog digital marketing)';
    }

    try {
      // Import auto blog writer service
      const { autoBlogWriterService } = await import('./auto-blog-writer-service');
      
      // Generate blog post with optimized settings
      const blogPost = await autoBlogWriterService.generateBlogPost({
        primaryKeyword: keyword,
        secondaryKeywords: [],
        targetLength: 'medium',
        tone: 'informative',
        audience: 'general readers',
        includeOutline: true,
        includeFAQ: true,
        includeConclusion: true
      });
      
      // Format output for command line
      const summary = `✍️ BLOG POST GENERATED - "${blogPost.title}"
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📝 CONTENT OVERVIEW:
• Word Count: ${blogPost.wordCount} words
• Reading Time: ${blogPost.readingTime} minutes
• SEO Score: ${blogPost.seoScore}% (${blogPost.seoScore >= 80 ? 'Excellent' : blogPost.seoScore >= 60 ? 'Good' : 'Needs Improvement'})
• Category: ${blogPost.category}

🔑 TARGET KEYWORDS:
${blogPost.keywords.map(k => `• ${k}`).join('\n')}

📋 CONTENT STRUCTURE:
${blogPost.headings.map((heading, i) => `${i + 1}. ${heading}`).join('\n')}

🏷️ TAGS:
${blogPost.tags.join(' • ')}

📄 META DESCRIPTION:
${blogPost.metaDescription}

💡 SEO OPTIMIZATION:
• Keywords properly distributed throughout content  
• Proper heading structure (H1, H2, H3)
• Meta description optimized for search engines
• FAQ section included for featured snippets
• Comprehensive conclusion with call-to-action

📁 Blog post saved as: blog-${blogPost.id}.md
🔗 Access via Auto Blog Writer module for full content and editing`;
      
      return summary;
    } catch (error) {
      return `Failed to generate blog post: ${error instanceof Error ? error instanceof Error ? error.message : String(error) : String(error)}`;
    }
  }
}

export const automationMarketingEngine = new AutomationMarketingEngine();