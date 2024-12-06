CREATE TABLE IF NOT EXISTS "chat" (
	"chatId" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "chat_chatId_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user1Id" integer NOT NULL,
	"user2Id" integer NOT NULL,
	"createdAt" timestamp NOT NULL,
	"updatedAt" timestamp
);
--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "chatId" integer NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "chat" ADD CONSTRAINT "chat_user1Id_users_userId_fk" FOREIGN KEY ("user1Id") REFERENCES "public"."users"("userId") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "chat" ADD CONSTRAINT "chat_user2Id_users_userId_fk" FOREIGN KEY ("user2Id") REFERENCES "public"."users"("userId") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "messages" ADD CONSTRAINT "messages_chatId_chat_chatId_fk" FOREIGN KEY ("chatId") REFERENCES "public"."chat"("chatId") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
