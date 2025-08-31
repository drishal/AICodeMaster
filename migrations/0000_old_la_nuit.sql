CREATE TABLE "ai_conversations" (
	"id" serial PRIMARY KEY NOT NULL,
	"message" text NOT NULL,
	"response" text NOT NULL,
	"mode" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "automation_tasks" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"type" text NOT NULL,
	"status" text DEFAULT 'idle' NOT NULL,
	"config" jsonb DEFAULT '{}',
	"last_run" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "campaigns" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"profile_id" integer,
	"content" jsonb DEFAULT '{}',
	"schedule" jsonb DEFAULT '{}',
	"budget" integer DEFAULT 0,
	"status" text DEFAULT 'draft' NOT NULL,
	"metrics" jsonb DEFAULT '{}',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "code_snippets" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"language" text NOT NULL,
	"code" text NOT NULL,
	"tags" text[],
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "command_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"command" text NOT NULL,
	"output" text,
	"status" text NOT NULL,
	"executed_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "contact_activities" (
	"id" serial PRIMARY KEY NOT NULL,
	"contact_id" integer NOT NULL,
	"type" text NOT NULL,
	"subject" text NOT NULL,
	"description" text,
	"status" text DEFAULT 'completed',
	"scheduled_at" timestamp,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "contacts" (
	"id" serial PRIMARY KEY NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"company" text,
	"position" text,
	"status" text DEFAULT 'new' NOT NULL,
	"source" text,
	"tags" text[] DEFAULT '{}',
	"notes" text,
	"last_contact_date" timestamp,
	"next_follow_up" timestamp,
	"lead_score" integer DEFAULT 0,
	"custom_fields" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "cross_platform_posts" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"original_content" text NOT NULL,
	"media_urls" text[],
	"platform_formats" jsonb DEFAULT '{}',
	"target_platforms" text[],
	"scheduled_time" timestamp,
	"posting_status" text DEFAULT 'draft' NOT NULL,
	"post_results" jsonb DEFAULT '{}',
	"auto_format_enabled" boolean DEFAULT true,
	"hashtag_strategy" text DEFAULT 'trending',
	"engagement_boost" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "documents" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"encrypted_data" text NOT NULL,
	"uploaded_at" timestamp DEFAULT now(),
	"expiry_date" timestamp
);
--> statement-breakpoint
CREATE TABLE "platform_connections" (
	"id" serial PRIMARY KEY NOT NULL,
	"platform" text NOT NULL,
	"connection_type" text NOT NULL,
	"credentials" jsonb DEFAULT '{}',
	"is_active" boolean DEFAULT true,
	"last_sync" timestamp,
	"rate_limits" jsonb DEFAULT '{}',
	"posting_capabilities" jsonb DEFAULT '{}',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"template" text NOT NULL,
	"language" text NOT NULL,
	"code" text NOT NULL,
	"files" jsonb DEFAULT '{}',
	"is_template" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "scheduled_tasks" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"type" text DEFAULT 'command' NOT NULL,
	"command" text,
	"cron_expression" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"last_run" timestamp,
	"next_run" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"sid" text PRIMARY KEY NOT NULL,
	"sess" jsonb NOT NULL,
	"expire" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "social_profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"platform" text NOT NULL,
	"username" text NOT NULL,
	"profile_type" text NOT NULL,
	"strategy" text NOT NULL,
	"access_token" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"email" text,
	"role" text DEFAULT 'user' NOT NULL,
	"is_active" boolean DEFAULT true,
	"last_login" timestamp,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_profile_id_social_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."social_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contact_activities" ADD CONSTRAINT "contact_activities_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE cascade ON UPDATE no action;