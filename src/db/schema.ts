import { date, boolean, integer, pgTable, varchar } from 'drizzle-orm/pg-core';

export const usersTable = pgTable('users', {
  userId: integer().primaryKey().generatedAlwaysAsIdentity(),
  email: varchar({ length: 255 }).notNull().unique(),
  password: varchar({ length: 255 }).notNull(),
  birthdate: date().notNull(),
  name: varchar({ length: 255 }).notNull(),
  bio: varchar({ length: 255 }).notNull(),
  profilePicture: varchar().notNull(),
  coverPicture: varchar({ length: 255 }),
  isActivated: boolean().notNull().default(false),
  isAdmin: boolean().notNull().default(false),
  verificationToken: varchar({ length: 255 }),
  resetToken: varchar({ length: 255 }),
});

export const postsTable = pgTable('posts', {
  postId: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: integer()
    .notNull()
    .references(() => usersTable.userId),
  description: varchar({ length: 255 }),
  createdAt: date().notNull(),
  updatedAt: date(),
});
