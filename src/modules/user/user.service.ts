import { Injectable } from '@nestjs/common';
import { eq, ilike } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import { usersTable } from 'src/db/schema';
import { UserProfileDto } from './dtos/user-profile.dto';
import { PostService } from '../post/post.service';
import 'dotenv/config';

@Injectable()
export class UserService {
  private readonly db;
  constructor(private readonly postService: PostService) {
    this.db = drizzle(process.env.DATABASE_URL!);
  }
  async findOne(userId: number) {
    try {
      const user = new UserProfileDto();
      const userDb = await this.db
        .select()
        .from(usersTable)
        .where(eq(usersTable.userId, userId));
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
  async searchUser(searchParam: string) {
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
      return users;
    } catch (e) {
      throw e;
    }
  }
}
