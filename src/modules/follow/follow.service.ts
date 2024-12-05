import { Injectable } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/node-postgres';
import 'dotenv/config';
import { RequestFollowDto } from './dtos/request-follow.dto';
import { followRequestsTable, usersTable } from 'src/db/schema';
import { eq } from 'drizzle-orm';
import { FollowRequest } from 'src/entities/follow-request.entity';
import { FollowResponseDto } from './dtos/follow-response.dto';
@Injectable()
export class FollowService {
  private readonly db;
  constructor() {
    this.db = drizzle(process.env.DATABASE_URL);
  }

  async getFollowStatus(followRequest: RequestFollowDto) {
    const follow = await this.db
      .select()
      .from(followRequestsTable)
      .where(eq(followRequestsTable.followerId, followRequest.followerId))
      .where(eq(followRequestsTable.followeeId, followRequest.followeeId));
    if (follow.length > 0) {
      return { message: 'Following' };
    }
    return { message: 'Not following' };
  }

  async getFollowRequests(userId: number) {
    try {
      const followRequests = await this.db
        .select()
        .from(followRequestsTable)
        .where(eq(followRequestsTable.followeeId, userId))
        .where(eq(followRequestsTable.isAccepted, false));
      const user = await this.db
        .select({
          profilePic: usersTable.profilePicture,
          username: usersTable.name,
        })
        .from(usersTable)
        .where(eq(usersTable.userId, followRequests[0].followerId));
      const response = new FollowResponseDto();
      response.followerId = followRequests[0].followerId;
      response.followeeId = followRequests[0].followeeId;
      response.createdAt = followRequests[0].createdAt;
      response.isAccepted = followRequests[0].isAccepted;
      response.updatedAt = followRequests[0].updatedAt;
      response.followerProfilePic = user[0].profilePic;
      response.followerUsername = user[0].username;
      return response;
    } catch (error) {
      throw error;
    }
  }
  async requestFollow(followRequest: RequestFollowDto) {
    try {
      if (followRequest.followerId === followRequest.followeeId) {
        return { message: 'Cannot follow yourself' };
      }
      const follow = new FollowRequest();
      follow.followerId = followRequest.followerId;
      follow.followeeId = followRequest.followeeId;
      follow.createdAt = new Date();

      const followRequestExists = await this.db
        .select()
        .from(followRequestsTable)
        .where(eq(followRequestsTable.followerId, follow.followerId))
        .where(eq(followRequestsTable.followeeId, follow.followeeId));
      if (followRequestExists.length > 0) {
        return { message: 'Follow request already sent' };
      }

      await this.db.insert(followRequestsTable).values(follow).execute();
      return { message: 'Follow request sent' };
    } catch (error) {
      throw error;
    }
  }
  async acceptFollow(followRequest: RequestFollowDto) {
    try {
      const followRequestExists = await this.db
        .select()
        .from(followRequestsTable)
        .where(eq(followRequestsTable.followerId, followRequest.followerId))
        .where(eq(followRequestsTable.followeeId, followRequest.followeeId));
      if (followRequestExists.length == 0) {
        return { message: 'Follow request not found' };
      }
      await this.db
        .update(followRequestsTable)
        .set({ isAccepted: true, updatedAt: new Date() })
        .where(eq(followRequestsTable.followerId, followRequest.followerId))
        .where(eq(followRequestsTable.followeeId, followRequest.followeeId))
        .execute();
      return { message: 'Follow request accepted' };
    } catch (error) {
      throw error;
    }
  }

  async rejectFollow(followRequest: RequestFollowDto) {
    try {
      const followRequestExists = await this.db
        .select()
        .from(followRequestsTable)
        .where(eq(followRequestsTable.followerId, followRequest.followerId))
        .where(eq(followRequestsTable.followeeId, followRequest.followeeId));
      if (followRequestExists.length == 0) {
        return { message: 'Follow request not found' };
      }
      await this.db
        .delete(followRequestsTable)
        .where(eq(followRequestsTable.followerId, followRequest.followerId))
        .where(eq(followRequestsTable.followeeId, followRequest.followeeId))
        .execute();
      return { message: 'Follow request rejected' };
    } catch (error) {
      throw error;
    }
  }

  async unfollow(followRequest: RequestFollowDto) {
    try {
      const followRequestExists = await this.db
        .select()
        .from(followRequestsTable)
        .where(eq(followRequestsTable.followerId, followRequest.followerId))
        .where(eq(followRequestsTable.followeeId, followRequest.followeeId));
      if (followRequestExists.length == 0) {
        return { message: 'Follow request not found' };
      }
      await this.db
        .delete(followRequestsTable)
        .where(eq(followRequestsTable.followerId, followRequest.followerId))
        .where(eq(followRequestsTable.followeeId, followRequest.followeeId))
        .execute();
      return { message: 'Unfollowed' };
    } catch (error) {
      throw error;
    }
  }
}
