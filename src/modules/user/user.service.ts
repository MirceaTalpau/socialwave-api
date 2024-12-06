import { Injectable } from '@nestjs/common';
import { and, eq, ilike } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import { followRequestsTable, usersTable } from 'src/db/schema';
import { UserProfileDto } from './dtos/user-profile.dto';
import { PostService } from '../post/post.service';
import 'dotenv/config';

@Injectable()
export class UserService {
  private readonly db;
  constructor(private readonly postService: PostService) {
    this.db = drizzle(process.env.DATABASE_URL!);
  }
  async findOne(currentUserId: number, userId?: number) {
    try {
      const user = new UserProfileDto();
      if (!userId) {
        userId = currentUserId;
      }
      const userDb = await this.db
        .select()
        .from(usersTable)
        .where(eq(usersTable.userId, userId));
      console.log(userDb);
      console.log(currentUserId);
      if (userDb[0].userId != currentUserId) {
        const isFollowing = await this.db
          .select()
          .from(followRequestsTable)
          .where(
            and(
              eq(followRequestsTable.followerId, currentUserId),
              eq(followRequestsTable.followeeId, userId),
              eq(followRequestsTable.isAccepted, true),
            ),
          );
        if (isFollowing.length == 0) {
          user.userId = userDb[0].userId;
          user.email = userDb[0].email;
          user.name = userDb[0].name;
          user.createdAt = userDb[0].createdAt;
          user.updatedAt = userDb[0].updatedAt;
          user.bio = userDb[0].bio;
          user.profilePicture = userDb[0].profilePicture;
          user.coverPicture = userDb[0].coverPicture;
          user.birthdate = userDb[0].birthdate;
          return user;
        }
      }
      user.userId = userDb[0].userId;
      user.email = userDb[0].email;
      user.name = userDb[0].name;
      user.createdAt = userDb[0].createdAt;
      user.updatedAt = userDb[0].updatedAt;
      user.bio = userDb[0].bio;
      user.profilePicture = userDb[0].profilePicture;
      user.coverPicture = userDb[0].coverPicture;
      user.birthdate = userDb[0].birthdate;
      const posts = await this.postService.findAllByUser(userId);
      user.posts = posts;
      return user;
    } catch (e) {
      throw e;
    }
  }
  async searchUser(searchParam: string, userId: number) {
    try {
      console.log(searchParam);
      const users = await this.db
        .select({
          userId: usersTable.userId,
          name: usersTable.name,
          profilePicture: usersTable.profilePicture,
        })
        .from(usersTable)
        .where(
          searchParam && searchParam.trim() !== ''
            ? ilike(usersTable.name, `%${searchParam}%`)
            : undefined, // Avoid passing null or invalid values
        )
        .limit(10);
      const filteredUsers = users.filter((user) => user.userId !== userId);
      return filteredUsers;
    } catch (e) {
      throw e;
    }
  }
}
