CREATE TABLE IF NOT EXISTS "comments" (
	"commentId" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "comments_commentId_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"parentId" integer,
	"postId" integer NOT NULL,
	"userId" integer NOT NULL,
	"text" varchar NOT NULL,
	"createdAt" timestamp NOT NULL,
	"updatedAt" timestamp
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "comments" ADD CONSTRAINT "comments_parentId_comments_commentId_fk" FOREIGN KEY ("parentId") REFERENCES "public"."comments"("commentId") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "comments" ADD CONSTRAINT "comments_postId_posts_postId_fk" FOREIGN KEY ("postId") REFERENCES "public"."posts"("postId") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "comments" ADD CONSTRAINT "comments_userId_users_userId_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("userId") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
