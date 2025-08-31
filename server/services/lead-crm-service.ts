import { db } from '../db';
import { contacts, contactActivities } from '@shared/schema';
import { eq, desc, asc, ilike, and, or, sql } from 'drizzle-orm';
import type { Contact, InsertContact, ContactActivity, InsertContactActivity } from '@shared/schema';

export class LeadCRMService {
  // Get all contacts with filtering and sorting
  async getContacts(filters: {
    search?: string;
    status?: string;
    source?: string;
    sort?: string;
    limit?: number;
    offset?: number;
  } = {}) {
    let query = db.select().from(contacts);

    // Apply filters
    const conditions = [];
    
    if (filters.search) {
      conditions.push(
        or(
          ilike(contacts.firstName, `%${filters.search}%`),
          ilike(contacts.lastName, `%${filters.search}%`),
          ilike(contacts.email, `%${filters.search}%`),
          ilike(contacts.company, `%${filters.search}%`)
        )
      );
    }

    if (filters.status && filters.status !== 'all') {
      conditions.push(eq(contacts.status, filters.status));
    }

    if (filters.source && filters.source !== 'all') {
      conditions.push(eq(contacts.source, filters.source));
    }

    if (conditions.length > 0) {
      query = (query as any).where(and(...conditions));
    }

    // Apply sorting
    switch (filters.sort) {
      case 'name':
        query = (query as any).orderBy(asc(contacts.firstName), asc(contacts.lastName));
        break;
      case 'score':
        query = (query as any).orderBy(desc(contacts.leadScore));
        break;
      case 'company':
        query = (query as any).orderBy(asc(contacts.company));
        break;
      case 'recent':
      default:
        query = (query as any).orderBy(desc(contacts.createdAt));
        break;
    }

    // Apply pagination
    if (filters.limit) {
      query = (query as any).limit(filters.limit);
    }
    if (filters.offset) {
      query = (query as any).offset(filters.offset);
    }

    const results = await query;

    // Add activity count for each contact
    const contactsWithActivity = await Promise.all(
      results.map(async (contact) => {
        const activityCount = await db
          .select({ count: sql<number>`count(*)` })
          .from(contactActivities)
          .where(eq(contactActivities.contactId, contact.id));

        const lastActivity = await db
          .select()
          .from(contactActivities)
          .where(eq(contactActivities.contactId, contact.id))
          .orderBy(desc(contactActivities.createdAt))
          .limit(1);

        return {
          ...contact,
          activityCount: activityCount[0]?.count || 0,
          lastActivity: lastActivity[0]?.createdAt?.toISOString()
        };
      })
    );

    return contactsWithActivity;
  }

  // Get contact statistics
  async getContactStats() {
    const totalResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(contacts);

    const convertedResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(contacts)
      .where(eq(contacts.status, 'converted'));

    const newLeadsResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(contacts)
      .where(eq(contacts.status, 'new'));

    const activeResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(contacts)
      .where(
        or(
          eq(contacts.status, 'qualified'),
          eq(contacts.status, 'contacted')
        )
      );

    return {
      total: totalResult[0]?.count || 0,
      converted: convertedResult[0]?.count || 0,
      newLeads: newLeadsResult[0]?.count || 0,
      active: activeResult[0]?.count || 0
    };
  }

  // Get single contact with activities
  async getContact(id: number) {
    const contact = await db
      .select()
      .from(contacts)
      .where(eq(contacts.id, id))
      .limit(1);

    if (!contact[0]) {
      throw new Error('Contact not found');
    }

    const activities = await db
      .select()
      .from(contactActivities)
      .where(eq(contactActivities.contactId, id))
      .orderBy(desc(contactActivities.createdAt));

    return {
      ...contact[0],
      activities
    };
  }

  // Create new contact
  async createContact(contactData: InsertContact) {
    const result = await db
      .insert(contacts)
      .values({
        ...contactData,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();

    return result[0];
  }

  // Update contact
  async updateContact(id: number, updates: Partial<Contact>) {
    const result = await db
      .update(contacts)
      .set({
        ...updates,
        updatedAt: new Date()
      })
      .where(eq(contacts.id, id))
      .returning();

    if (!result[0]) {
      throw new Error('Contact not found');
    }

    return result[0];
  }

  // Delete contact
  async deleteContact(id: number) {
    const result = await db
      .delete(contacts)
      .where(eq(contacts.id, id))
      .returning();

    if (!result[0]) {
      throw new Error('Contact not found');
    }

    return result[0];
  }

  // Add contact activity
  async addContactActivity(activityData: InsertContactActivity) {
    const result = await db
      .insert(contactActivities)
      .values({
        ...activityData,
        createdAt: new Date(),
        completedAt: activityData.status === 'completed' ? new Date() : null
      })
      .returning();

    return result[0];
  }

  // Get contact activities
  async getContactActivities(contactId: number) {
    return await db
      .select()
      .from(contactActivities)
      .where(eq(contactActivities.contactId, contactId))
      .orderBy(desc(contactActivities.createdAt));
  }

  // Export contacts to CSV format
  async exportContacts() {
    const allContacts = await this.getContacts();
    
    const csvHeader = [
      'First Name',
      'Last Name', 
      'Email',
      'Phone',
      'Company',
      'Position',
      'Status',
      'Source',
      'Lead Score',
      'Tags',
      'Notes',
      'Last Contact Date',
      'Next Follow Up',
      'Created At'
    ].join(',');

    const csvRows = allContacts.map(contact => [
      contact.firstName,
      contact.lastName,
      contact.email,
      contact.phone || '',
      contact.company || '',
      contact.position || '',
      contact.status,
      contact.source || '',
      (contact.leadScore || 0).toString(),
      contact.tags?.join(';') || '',
      contact.notes ? contact.notes.replace(/"/g, '""') : '',
      contact.lastContactDate ? new Date(contact.lastContactDate).toISOString() : '',
      contact.nextFollowUp ? new Date(contact.nextFollowUp).toISOString() : '',
      contact.createdAt ? new Date(contact.createdAt).toISOString() : new Date().toISOString()
    ].map(field => `"${field}"`).join(','));

    return [csvHeader, ...csvRows].join('\n');
  }

  // Import contacts from CSV data
  async importContacts(csvData: string) {
    const lines = csvData.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim().toLowerCase());
    
    let imported = 0;
    let skipped = 0;

    for (let i = 1; i < lines.length; i++) {
      try {
        const values = lines[i].split(',').map(v => v.replace(/"/g, '').trim());
        
        const contactData: Partial<InsertContact> = {};
        
        headers.forEach((header, index) => {
          const value = values[index];
          if (!value) return;

          switch (header) {
            case 'first name':
            case 'firstname':
              contactData.firstName = value;
              break;
            case 'last name':
            case 'lastname':
              contactData.lastName = value;
              break;
            case 'email':
              contactData.email = value;
              break;
            case 'phone':
              contactData.phone = value;
              break;
            case 'company':
              contactData.company = value;
              break;
            case 'position':
            case 'title':
              contactData.position = value;
              break;
            case 'status':
              if (['new', 'qualified', 'contacted', 'converted', 'lost'].includes(value)) {
                contactData.status = value;
              }
              break;
            case 'source':
              contactData.source = value;
              break;
            case 'lead score':
            case 'leadscore':
              const score = parseInt(value);
              if (!isNaN(score)) {
                contactData.leadScore = score;
              }
              break;
            case 'tags':
              contactData.tags = value.split(';').filter(t => t.trim());
              break;
            case 'notes':
              contactData.notes = value;
              break;
          }
        });

        // Validate required fields
        if (!contactData.firstName || !contactData.lastName || !contactData.email) {
          skipped++;
          continue;
        }

        // Check if contact already exists
        const existing = await db
          .select()
          .from(contacts)
          .where(eq(contacts.email, contactData.email))
          .limit(1);

        if (existing.length > 0) {
          skipped++;
          continue;
        }

        // Create contact
        await this.createContact(contactData as InsertContact);
        imported++;

      } catch (error) {
        console.error('Error importing contact:', error);
        skipped++;
      }
    }

    return { imported, skipped };
  }

  // Update lead score based on activities and engagement
  async updateLeadScore(contactId: number) {
    const contact = await this.getContact(contactId);
    const activities = contact.activities || [];

    let score = 0;

    // Base score for having complete profile
    if (contact.company) score += 10;
    if (contact.position) score += 10;
    if (contact.phone) score += 5;

    // Score based on activities
    activities.forEach(activity => {
      switch (activity.type) {
        case 'email':
          score += 5;
          break;
        case 'call':
          score += 15;
          break;
        case 'meeting':
          score += 25;
          break;
        default:
          score += 2;
      }
    });

    // Recent activity bonus
    const recentActivities = activities.filter(a => 
      a.createdAt && new Date(a.createdAt).getTime() > Date.now() - (30 * 24 * 60 * 60 * 1000) // Last 30 days
    );
    score += recentActivities.length * 3;

    // Cap score at 100
    score = Math.min(score, 100);

    await this.updateContact(contactId, { leadScore: score });
    return score;
  }

  // Get contacts needing follow-up
  async getFollowUpContacts() {
    const now = new Date();
    return await db
      .select()
      .from(contacts)
      .where(
        and(
          sql`${contacts.nextFollowUp} <= ${now}`,
          or(
            eq(contacts.status, 'new'),
            eq(contacts.status, 'qualified'),
            eq(contacts.status, 'contacted')
          )
        )
      )
      .orderBy(asc(contacts.nextFollowUp));
  }

  // Search contacts with advanced filters
  async searchContacts(query: string, filters: {
    status?: string[];
    source?: string[];
    minScore?: number;
    maxScore?: number;
    hasPhone?: boolean;
    hasCompany?: boolean;
    dateRange?: { from: Date; to: Date };
  } = {}) {
    let dbQuery = db.select().from(contacts);
    const conditions = [];

    // Text search
    if (query) {
      conditions.push(
        or(
          ilike(contacts.firstName, `%${query}%`),
          ilike(contacts.lastName, `%${query}%`),
          ilike(contacts.email, `%${query}%`),
          ilike(contacts.company, `%${query}%`),
          ilike(contacts.position, `%${query}%`),
          ilike(contacts.notes, `%${query}%`)
        )
      );
    }

    // Status filter
    if (filters.status && filters.status.length > 0) {
      conditions.push(
        or(...filters.status.map(status => eq(contacts.status, status)))
      );
    }

    // Source filter
    if (filters.source && filters.source.length > 0) {
      conditions.push(
        or(...filters.source.map(source => eq(contacts.source, source)))
      );
    }

    // Lead score range
    if (filters.minScore !== undefined) {
      conditions.push(sql`${contacts.leadScore} >= ${filters.minScore}`);
    }
    if (filters.maxScore !== undefined) {
      conditions.push(sql`${contacts.leadScore} <= ${filters.maxScore}`);
    }

    // Has phone
    if (filters.hasPhone) {
      conditions.push(sql`${contacts.phone} IS NOT NULL AND ${contacts.phone} != ''`);
    }

    // Has company
    if (filters.hasCompany) {
      conditions.push(sql`${contacts.company} IS NOT NULL AND ${contacts.company} != ''`);
    }

    // Date range
    if (filters.dateRange) {
      conditions.push(
        and(
          sql`${contacts.createdAt} >= ${filters.dateRange.from}`,
          sql`${contacts.createdAt} <= ${filters.dateRange.to}`
        )
      );
    }

    if (conditions.length > 0) {
      dbQuery = (dbQuery as any).where(and(...conditions));
    }

    return await dbQuery.orderBy(desc(contacts.leadScore));
  }
}

export const leadCRMService = new LeadCRMService();