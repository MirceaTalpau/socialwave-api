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

export const commentsTable = pgTable('comments', {
  commentId: integer().primaryKey().generatedAlwaysAsIdentity(),
  parentId: integer().references(() => commentsTable.commentId),
  postId: integer()
    .notNull()
    .references(() => postsTable.postId),
  userId: integer()
    .notNull()
    .references(() => usersTable.userId),
  text: varchar().notNull(),
  createdAt: timestamp().notNull(),
  updatedAt: timestamp(),
});

export const likesTable = pgTable('likes', {
  likeId: integer().primaryKey().generatedAlwaysAsIdentity(),
  postId: integer()
    .notNull()
    .references(() => postsTable.postId),
  userId: integer()
    .notNull()
    .references(() => usersTable.userId),
  createdAt: timestamp().notNull(),
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

export const messagesTable = pgTable('messages', {
  messageId: integer().primaryKey().generatedAlwaysAsIdentity(),
  senderId: integer()
    .notNull()
    .references(() => usersTable.userId),
  receiverId: integer()
    .notNull()
    .references(() => usersTable.userId),
  chatId: integer()
    .notNull()
    .references(() => chatTable.chatId),
  text: varchar().notNull(),
  isRead: boolean().notNull().default(false),
  createdAt: timestamp().notNull(),
  updatedAt: timestamp(),
});

export const chatTable = pgTable('chat', {
  chatId: integer().primaryKey().generatedAlwaysAsIdentity(),
  user1Id: integer()
    .notNull()
    .references(() => usersTable.userId),
  user2Id: integer()
    .notNull()
    .references(() => usersTable.userId),
  createdAt: timestamp().notNull(),
  updatedAt: timestamp(),
});

export const storyTable = pgTable('story', {
  storyId: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: integer()
    .notNull()
    .references(() => usersTable.userId),
  imageUrl: varchar().notNull(),
  videoUrl: varchar().notNull(),
  createdAt: timestamp().notNull(),
  updatedAt: timestamp(),
});
