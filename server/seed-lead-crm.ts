import { db } from './db';
import { contacts, contactActivities } from '@shared/schema';

async function seedLeadCRM() {
  console.log('🌱 Seeding Lead CRM data...');

  try {
    // Clear existing data
    await db.delete(contactActivities);
    await db.delete(contacts);

    // Sample contacts data
    const sampleContacts = [
      {
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@techcorp.com',
        phone: '+1-555-0123',
        company: 'TechCorp Solutions',
        position: 'CEO',
        status: 'qualified' as const,
        source: 'website',
        leadScore: 85,
        tags: ['enterprise', 'mobile-dev', 'high-priority'],
        notes: 'Interested in mobile development automation platform. Budget approved for Q1.',
        lastContactDate: new Date('2025-01-15'),
        nextFollowUp: new Date('2025-01-25')
      },
      {
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.j@startupco.io',
        phone: '+1-555-0456',
        company: 'StartupCo',
        position: 'CTO',
        status: 'contacted' as const,
        source: 'social_media',
        leadScore: 72,
        tags: ['startup', 'ai-tools', 'growth'],
        notes: 'Looking for AI-powered content creation tools. Demo scheduled.',
        lastContactDate: new Date('2025-01-18'),
        nextFollowUp: new Date('2025-01-22')
      },
      {
        firstName: 'Michael',
        lastName: 'Chen',
        email: 'mchen@digitalagency.com',
        phone: '+1-555-0789',
        company: 'Digital Marketing Agency',
        position: 'Marketing Director',
        status: 'new' as const,
        source: 'referral',
        leadScore: 65,
        tags: ['marketing', 'automation', 'social-media'],
        notes: 'Referred by existing client. Interested in social media automation.',
        lastContactDate: new Date('2025-01-20')
      },
      {
        firstName: 'Emily',
        lastName: 'Rodriguez',
        email: 'emily.r@consulting.biz',
        phone: '+1-555-0321',
        company: 'Rodriguez Consulting',
        position: 'Founder',
        status: 'converted' as const,
        source: 'cold_outreach',
        leadScore: 95,
        tags: ['converted', 'consulting', 'premium'],
        notes: 'Successfully onboarded. Using full platform for client projects.',
        lastContactDate: new Date('2025-01-19'),
        nextFollowUp: new Date('2025-02-01')
      },
      {
        firstName: 'David',
        lastName: 'Wilson',
        email: 'dwilson@ecommerce.store',
        phone: '+1-555-0654',
        company: 'E-commerce Plus',
        position: 'Operations Manager',
        status: 'lost' as const,
        source: 'event',
        leadScore: 35,
        tags: ['ecommerce', 'price-sensitive'],
        notes: 'Budget constraints. Keep in touch for future opportunities.',
        lastContactDate: new Date('2025-01-10')
      },
      {
        firstName: 'Lisa',
        lastName: 'Anderson',
        email: 'l.anderson@appdev.co',
        phone: '+1-555-0987',
        company: 'AppDev Co',
        position: 'Lead Developer',
        status: 'qualified' as const,
        source: 'website',
        leadScore: 78,
        tags: ['developer', 'mobile-apps', 'technical'],
        notes: 'Technical evaluation in progress. Impressed with automation capabilities.',
        lastContactDate: new Date('2025-01-17'),
        nextFollowUp: new Date('2025-01-24')
      },
      {
        firstName: 'Robert',
        lastName: 'Thompson',
        email: 'rthompson@mediaco.net',
        phone: '+1-555-0234',
        company: 'Media Solutions',
        position: 'Creative Director',
        status: 'contacted' as const,
        source: 'social_media',
        leadScore: 60,
        tags: ['media', 'content-creation', 'creative'],
        notes: 'Interested in AI content generation tools. Needs approval from management.',
        lastContactDate: new Date('2025-01-16'),
        nextFollowUp: new Date('2025-01-26')
      },
      {
        firstName: 'Jennifer',
        lastName: 'Brown',
        email: 'jen.brown@freelancer.com',
        phone: '+1-555-0567',
        company: 'Brown Freelance Services',
        position: 'Freelance Developer',
        status: 'new' as const,
        source: 'referral',
        leadScore: 45,
        tags: ['freelancer', 'individual', 'mobile-dev'],
        notes: 'Individual freelancer looking for productivity tools. Price-conscious.',
        lastContactDate: new Date('2025-01-21')
      }
    ];

    // Insert contacts
    const insertedContacts = await db.insert(contacts).values(sampleContacts).returning();
    console.log(`✅ Inserted ${insertedContacts.length} contacts`);

    // Sample activities for some contacts
    const sampleActivities = [
      {
        contactId: insertedContacts[0].id,
        type: 'email' as const,
        subject: 'Initial Outreach - Mobile Development Platform',
        description: 'Sent introductory email about our mobile development automation platform.',
        status: 'completed' as const,
        completedAt: new Date('2025-01-15')
      },
      {
        contactId: insertedContacts[0].id,
        type: 'call' as const,
        subject: 'Discovery Call',
        description: 'Had 30-minute discovery call to understand their needs and requirements.',
        status: 'completed' as const,
        completedAt: new Date('2025-01-16')
      },
      {
        contactId: insertedContacts[1].id,
        type: 'email' as const,
        subject: 'Demo Proposal',
        description: 'Sent demo proposal with pricing information.',
        status: 'completed' as const,
        completedAt: new Date('2025-01-18')
      },
      {
        contactId: insertedContacts[1].id,
        type: 'meeting' as const,
        subject: 'Product Demo',
        description: 'Scheduled product demonstration for next week.',
        status: 'scheduled' as const,
        scheduledAt: new Date('2025-01-25')
      },
      {
        contactId: insertedContacts[3].id,
        type: 'call' as const,
        subject: 'Onboarding Call',
        description: 'Successful onboarding call. Client is now actively using the platform.',
        status: 'completed' as const,
        completedAt: new Date('2025-01-19')
      },
      {
        contactId: insertedContacts[5].id,
        type: 'email' as const,
        subject: 'Technical Documentation',
        description: 'Sent technical documentation and API guides.',
        status: 'completed' as const,
        completedAt: new Date('2025-01-17')
      }
    ];

    // Insert activities
    const insertedActivities = await db.insert(contactActivities).values(sampleActivities).returning();
    console.log(`✅ Inserted ${insertedActivities.length} contact activities`);

    console.log('🎉 Lead CRM data seeding completed successfully!');
    console.log(`
📊 Summary:
• ${insertedContacts.length} contacts created
• ${insertedActivities.length} activities logged
• Contact statuses: New (2), Qualified (2), Contacted (2), Converted (1), Lost (1)
• Lead scores range from 35 to 95
• Various sources: Website, Social Media, Referral, Cold Outreach, Event
    `);

  } catch (error) {
    console.error('❌ Error seeding Lead CRM data:', error);
    throw error;
  }
}

// Run the seeding function
seedLeadCRM()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

export { seedLeadCRM };