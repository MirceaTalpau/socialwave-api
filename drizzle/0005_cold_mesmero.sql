CREATE TABLE IF NOT EXISTS "images_post" (
	"imagePostId" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "images_post_imagePostId_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"postId" integer NOT NULL,
	"imageUrl" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "videos_post" (
	"videoPostId" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "videos_post_videoPostId_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"postId" integer NOT NULL,
	"videoUrl" varchar NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "images_post" ADD CONSTRAINT "images_post_postId_posts_postId_fk" FOREIGN KEY ("postId") REFERENCES "public"."posts"("postId") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "videos_post" ADD CONSTRAINT "videos_post_postId_posts_postId_fk" FOREIGN KEY ("postId") REFERENCES "public"."posts"("postId") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
