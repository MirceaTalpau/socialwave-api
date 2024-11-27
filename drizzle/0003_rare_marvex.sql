CREATE TABLE IF NOT EXISTS "posts" (
	"postId" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "posts_postId_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"userId" integer NOT NULL,
	"description" varchar(255),
	"createdAt" date NOT NULL,
	"updatedAt" date
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "posts" ADD CONSTRAINT "posts_userId_users_userId_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("userId") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
