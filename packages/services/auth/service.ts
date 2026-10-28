import { auth } from "./index";
import { db, eq } from "@formly/database";
import { user as userTable } from "@formly/database/schema";

export interface SafeUser {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class AuthService {
  /**
   * Resolves the current Better Auth session from incoming request headers
   */
  public async getSessionFromHeaders(headers: Headers) {
    return await auth.api.getSession({
      headers,
    });
  }

  /**
   * Returns a safe user profile by ID from the database
   */
  public async getUserById(userId: string): Promise<SafeUser | null> {
    const records = await db
      .select({
        id: userTable.id,
        name: userTable.name,
        email: userTable.email,
        image: userTable.image,
        emailVerified: userTable.emailVerified,
        createdAt: userTable.createdAt,
        updatedAt: userTable.updatedAt,
      })
      .from(userTable)
      .where(eq(userTable.id, userId))
      .limit(1);

    return records[0] || null;
  }

  /**
   * Revoke current session
   */
  public async revokeCurrentSession(headers: Headers) {
    await auth.api.signOut({
      headers,
    });
  }

  /**
   * Revoke all other active sessions for current user
   */
  public async revokeOtherSessions(headers: Headers) {
    await auth.api.revokeOtherSessions({
      headers,
    });
  }

  /**
   * Revoke all active sessions for current user
   */
  public async revokeAllSessions(headers: Headers) {
    await auth.api.revokeSessions({
      headers,
    });
  }
}

export const authService = new AuthService();

