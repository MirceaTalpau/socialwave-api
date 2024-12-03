CREATE TABLE IF NOT EXISTS "follow_requests" (
	"followerId" integer NOT NULL,
	"followeeId" integer NOT NULL,
	"isAccepted" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp NOT NULL,
	"updatedAt" timestamp
);
--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "createdAt" DROP NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "follow_requests" ADD CONSTRAINT "follow_requests_followerId_users_userId_fk" FOREIGN KEY ("followerId") REFERENCES "public"."users"("userId") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "follow_requests" ADD CONSTRAINT "follow_requests_followeeId_users_userId_fk" FOREIGN KEY ("followeeId") REFERENCES "public"."users"("userId") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
