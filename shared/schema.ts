import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  role: text("role").notNull().default("user"), // admin, user
  isActive: boolean("is_active").default(true),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const sessions = pgTable("sessions", {
  sid: text("sid").primaryKey(),
  sess: jsonb("sess").notNull(),
  expire: timestamp("expire").notNull(),
});

export const codeSnippets = pgTable("code_snippets", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  language: text("language").notNull(),
  code: text("code").notNull(),
  tags: text("tags").array(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  template: text("template").notNull(),
  language: text("language").notNull(),
  code: text("code").notNull(),
  files: jsonb("files").default('{}'),
  isTemplate: boolean("is_template").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const aiConversations = pgTable("ai_conversations", {
  id: serial("id").primaryKey(),
  message: text("message").notNull(),
  response: text("response").notNull(),
  mode: text("mode").notNull(), // code-generation, phone-automation, file-management, browser-control
  createdAt: timestamp("created_at").defaultNow(),
});

export const automationTasks = pgTable("automation_tasks", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  type: text("type").notNull(), // seo-manager, social-media, email-marketing, data-acquisition, etc.
  status: text("status").notNull().default('idle'), // idle, active, scanning, error, scheduled
  config: jsonb("config").default('{}'),
  lastRun: timestamp("last_run"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const socialProfiles = pgTable("social_profiles", {
  id: serial("id").primaryKey(),
  platform: text("platform").notNull(), // instagram, facebook, youtube, threads, telegram, whatsapp
  username: text("username").notNull(),
  profileType: text("profile_type").notNull(), // service, product, creator
  strategy: text("strategy").notNull(), // roas, engagement
  accessToken: text("access_token"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const campaigns = pgTable("campaigns", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // seo, social, email, whatsapp
  profileId: integer("profile_id").references(() => socialProfiles.id),
  content: jsonb("content").default('{}'),
  schedule: jsonb("schedule").default('{}'),
  budget: integer("budget").default(0), // in paise (₹0 default)
  status: text("status").notNull().default('draft'), // draft, scheduled, running, completed, paused
  metrics: jsonb("metrics").default('{}'),
  createdAt: timestamp("created_at").defaultNow(),
});

export const crossPlatformPosts = pgTable("cross_platform_posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  originalContent: text("original_content").notNull(),
  mediaUrls: text("media_urls").array(),
  platformFormats: jsonb("platform_formats").default('{}'), // Platform-specific formatted content
  targetPlatforms: text("target_platforms").array(), // instagram, telegram, youtube, facebook, etc.
  scheduledTime: timestamp("scheduled_time"),
  postingStatus: text("posting_status").notNull().default('draft'), // draft, scheduled, posting, completed, failed
  postResults: jsonb("post_results").default('{}'), // Results from each platform
  autoFormatEnabled: boolean("auto_format_enabled").default(true),
  hashtagStrategy: text("hashtag_strategy").default('trending'), // trending, niche, custom
  engagementBoost: boolean("engagement_boost").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const platformConnections = pgTable("platform_connections", {
  id: serial("id").primaryKey(),
  platform: text("platform").notNull(), // instagram, telegram, youtube, facebook, twitter, linkedin
  connectionType: text("connection_type").notNull(), // api, webhook, automation
  credentials: jsonb("credentials").default('{}'), // Encrypted platform credentials
  isActive: boolean("is_active").default(true),
  lastSync: timestamp("last_sync"),
  rateLimits: jsonb("rate_limits").default('{}'),
  postingCapabilities: jsonb("posting_capabilities").default('{}'),
  createdAt: timestamp("created_at").defaultNow(),
});

export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // passport, pan, gst, aadhar, license
  encryptedData: text("encrypted_data").notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
  expiryDate: timestamp("expiry_date"),
});

export const commandHistory = pgTable("command_history", {
  id: serial("id").primaryKey(),
  command: text("command").notNull(),
  output: text("output"),
  status: text("status").notNull(), // success, error, pending
  executedAt: timestamp("executed_at").defaultNow(),
});

export const scheduledTasks = pgTable("scheduled_tasks", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull().default("command"), // command, api, social, email
  command: text("command"),
  cronExpression: text("cron_expression").notNull(),
  status: text("status").notNull().default("active"), // active, paused, error
  lastRun: timestamp("last_run"),
  nextRun: timestamp("next_run"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  lastLogin: true,
  createdAt: true,
});

export const insertCodeSnippetSchema = createInsertSchema(codeSnippets).omit({
  id: true,
  createdAt: true,
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
});

export const insertAiConversationSchema = createInsertSchema(aiConversations).omit({
  id: true,
  createdAt: true,
});

export const insertAutomationTaskSchema = createInsertSchema(automationTasks).omit({
  id: true,
  createdAt: true,
  lastRun: true,
});

export const insertSocialProfileSchema = createInsertSchema(socialProfiles).omit({
  id: true,
  createdAt: true,
});

export const insertCampaignSchema = createInsertSchema(campaigns).omit({
  id: true,
  createdAt: true,
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  uploadedAt: true,
});

export const insertCommandHistorySchema = createInsertSchema(commandHistory).omit({
  id: true,
  executedAt: true,
});

export const insertScheduledTaskSchema = createInsertSchema(scheduledTasks).omit({
  id: true,
  createdAt: true,
  lastRun: true,
  nextRun: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type CodeSnippet = typeof codeSnippets.$inferSelect;
export type InsertCodeSnippet = z.infer<typeof insertCodeSnippetSchema>;
export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type AiConversation = typeof aiConversations.$inferSelect;
export type InsertAiConversation = z.infer<typeof insertAiConversationSchema>;
export type AutomationTask = typeof automationTasks.$inferSelect;
export type InsertAutomationTask = z.infer<typeof insertAutomationTaskSchema>;
export type SocialProfile = typeof socialProfiles.$inferSelect;
export type InsertSocialProfile = z.infer<typeof insertSocialProfileSchema>;
export type Campaign = typeof campaigns.$inferSelect;
export type InsertCampaign = z.infer<typeof insertCampaignSchema>;

// Cross Platform Posts
export const insertCrossPlatformPostSchema = createInsertSchema(crossPlatformPosts);
export type CrossPlatformPost = typeof crossPlatformPosts.$inferSelect;
export type InsertCrossPlatformPost = z.infer<typeof insertCrossPlatformPostSchema>;

// Platform Connections
export const insertPlatformConnectionSchema = createInsertSchema(platformConnections);
export type PlatformConnection = typeof platformConnections.$inferSelect;
export type InsertPlatformConnection = z.infer<typeof insertPlatformConnectionSchema>;
export type Document = typeof documents.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type CommandHistory = typeof commandHistory.$inferSelect;
export type InsertCommandHistory = z.infer<typeof insertCommandHistorySchema>;
export type ScheduledTask = typeof scheduledTasks.$inferSelect;
export type InsertScheduledTask = z.infer<typeof insertScheduledTaskSchema>;

// Contact and CRM tables
export const contacts = pgTable("contacts", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  company: text("company"),
  position: text("position"),
  status: text("status").notNull().default("new"), // new, qualified, contacted, converted, lost
  source: text("source"), // website, social_media, referral, cold_outreach, etc.
  tags: text("tags").array().default([]),
  notes: text("notes"),
  lastContactDate: timestamp("last_contact_date"),
  nextFollowUp: timestamp("next_follow_up"),
  leadScore: integer("lead_score").default(0),
  customFields: text("custom_fields"), // JSON string for additional fields
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const contactActivities = pgTable("contact_activities", {
  id: serial("id").primaryKey(),
  contactId: integer("contact_id").notNull().references(() => contacts.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // email, call, meeting, note, task
  subject: text("subject").notNull(),
  description: text("description"),
  status: text("status").default("completed"), // scheduled, completed, cancelled
  scheduledAt: timestamp("scheduled_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const contactRelations = relations(contacts, ({ many }) => ({
  activities: many(contactActivities),
}));

export const contactActivityRelations = relations(contactActivities, ({ one }) => ({
  contact: one(contacts, {
    fields: [contactActivities.contactId],
    references: [contacts.id],
  }),
}));

export const insertContactSchema = createInsertSchema(contacts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertContactActivitySchema = createInsertSchema(contactActivities).omit({
  id: true,
  createdAt: true,
});

export type Contact = typeof contacts.$inferSelect;
export type InsertContact = z.infer<typeof insertContactSchema>;
export type ContactActivity = typeof contactActivities.$inferSelect;
export type InsertContactActivity = z.infer<typeof insertContactActivitySchema>;
