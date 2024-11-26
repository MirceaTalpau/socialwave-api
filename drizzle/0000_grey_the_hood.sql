CREATE TABLE IF NOT EXISTS "users" (
	"userId" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "users_userId_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"email" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"birthdate" date NOT NULL,
	"name" varchar(255) NOT NULL,
	"bio" varchar(255) NOT NULL,
	"profilePicture" varchar(255) NOT NULL,
	"coverPicture" varchar(255),
	"isActivated" boolean DEFAULT false NOT NULL,
	"isAdmin" boolean DEFAULT false NOT NULL,
	"verificationToken" varchar(255),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
