CREATE TABLE IF NOT EXISTS "notifications" (
	"notificationId" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "notifications_notificationId_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"userId" integer NOT NULL,
	"type" varchar NOT NULL,
	"text" varchar NOT NULL,
	"seen" boolean DEFAULT false NOT NULL,
	"details" jsonb DEFAULT '{}'::jsonb,
	"createdAt" timestamp NOT NULL,
	"updatedAt" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "story" ALTER COLUMN "imageUrl" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "story" ALTER COLUMN "videoUrl" DROP NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_users_userId_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("userId") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
