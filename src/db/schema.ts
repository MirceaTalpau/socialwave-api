import {
  date,
  boolean,
  integer,
  pgTable,
  varchar,
  timestamp,
} from 'drizzle-orm/pg-core';

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
  createdAt: timestamp(),
  updatedAt: timestamp(),
});

export const postsTable = pgTable('posts', {
  postId: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: integer()
    .notNull()
    .references(() => usersTable.userId),
  description: varchar({ length: 255 }),
  createdAt: timestamp().notNull(),
  updatedAt: timestamp(),
});

export const imagesPostTable = pgTable('images_post', {
  imagePostId: integer().primaryKey().generatedAlwaysAsIdentity(),
  postId: integer()
    .notNull()
    .references(() => postsTable.postId),
  imageUrl: varchar().notNull(),
});

export const videosPostTable = pgTable('videos_post', {
  videoPostId: integer().primaryKey().generatedAlwaysAsIdentity(),
  postId: integer()
    .notNull()
    .references(() => postsTable.postId),
  videoUrl: varchar().notNull(),
});

export const followRequestsTable = pgTable('follow_requests', {
  followerId: integer()
    .notNull()
    .references(() => usersTable.userId),
  followeeId: integer()
    .notNull()
    .references(() => usersTable.userId),
  isAccepted: boolean().notNull().default(false),
  createdAt: timestamp().notNull(),
  updatedAt: timestamp(),
});
