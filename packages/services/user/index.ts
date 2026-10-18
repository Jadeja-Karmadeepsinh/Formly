import { randomBytes, randomUUID, createHmac, createHash, timingSafeEqual } from "node:crypto";
import { db, eq, and, or, isNull, isNotNull, gte, lt, ne, asc } from "@formly/database";
import { usersTable, passwordResetTokensTable, refreshTokensTable } from "@formly/database/schema";
import { logger } from "@formly/logger";
import { env } from "../env";
import { sendPasswordResetEmail } from "../email";

import {
  createUserWithEmailAndPassword,
  type CreateUserWithEmailAndPasswordSchema,
  signInUserWithEmailAndPassword,
  type SignInUserWithEmailAndPasswordSchema,
  requestPasswordResetSchema,
  type RequestPasswordResetSchema,
  verifyResetTokenSchema,
  type VerifyResetTokenSchema,
  resetPasswordSchema,
  type ResetPasswordSchema,
} from "./model";
import {
  signAccessToken,
  verifyAccessToken,
  generateRefreshToken,
  hashToken,
  REFRESH_TOKEN_TTL,
  REUSE_GRACE_SECONDS,
  MAX_SESSION_DAYS,
} from "./tokens";
import {
  AUTH_ERROR_CODES,
  type AuthErrorCode,
  type AuthTokens,
  type AuthUserInfo,
} from "./types";

const RESET_TOKEN_TTL_MINUTES = 30;
const MAX_RESET_REQUESTS_PER_HOUR = 3;

export class AuthServiceError extends Error {
  constructor(public code: AuthErrorCode, message?: string) {
    super(message || code);
    this.name = "AuthServiceError";
  }
}

export interface ServiceAuthResult {
  id: string;
  fullName: string;
  email: string;
  tokens: AuthTokens;
}

class UserService {
  private async getUserByEmail(email: string) {
    const result = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email.trim().toLowerCase()));

    if (!result || result.length === 0) {
      return null;
    }

    return result[0];
  }

  public async createUserWithEmailAndPassword(
    payload: CreateUserWithEmailAndPasswordSchema,
    metadata?: { userAgent?: string; ipAddress?: string }
  ): Promise<ServiceAuthResult> {
    const { fullName, email, password } = await createUserWithEmailAndPassword.parseAsync(payload);
    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await this.getUserByEmail(normalizedEmail);
    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    const salt = randomBytes(16).toString("hex");
    const hashedPassword = createHmac("sha256", salt).update(password).digest("hex");

    const result = await db
      .insert(usersTable)
      .values({
        fullName,
        email: normalizedEmail,
        password: hashedPassword,
        salt,
      })
      .returning({ id: usersTable.id });

    if (!result || result.length === 0 || !result[0]?.id) {
      throw new Error("User creation failed");
    }

    const userId = result[0].id;

    // Create a new session family for the user
    const familyId = randomUUID();
    const { raw: rawRefreshToken, hash: tokenHash } = generateRefreshToken();
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL * 1000);

    await db.insert(refreshTokensTable).values({
      userId,
      tokenHash,
      familyId,
      expiresAt,
      userAgent: metadata?.userAgent,
      ipAddress: metadata?.ipAddress,
    });

    const accessToken = signAccessToken(userId);

    return {
      id: userId,
      fullName,
      email: normalizedEmail,
      tokens: {
        accessToken,
        refreshToken: rawRefreshToken,
      },
    };
  }

  public async signInUserWithEmailAndPassword(
    payload: SignInUserWithEmailAndPasswordSchema,
    metadata?: { userAgent?: string; ipAddress?: string }
  ): Promise<ServiceAuthResult> {
    const { email, password } = await signInUserWithEmailAndPassword.parseAsync(payload);
    const normalizedEmail = email.trim().toLowerCase();

    const user = await this.getUserByEmail(normalizedEmail);

    if (!user || !user.password || !user.salt) {
      throw new Error("Invalid email or password");
    }

    const candidateHash = createHmac("sha256", user.salt).update(password).digest("hex");
    const candidateBuffer = Buffer.from(candidateHash, "hex");
    const storedBuffer = Buffer.from(user.password, "hex");

    const passwordsMatch =
      candidateBuffer.length === storedBuffer.length &&
      timingSafeEqual(candidateBuffer, storedBuffer);

    if (!passwordsMatch) {
      throw new Error("Invalid email or password");
    }

    // Create a new session family for this login
    const familyId = randomUUID();
    const { raw: rawRefreshToken, hash: tokenHash } = generateRefreshToken();
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL * 1000);

    await db.insert(refreshTokensTable).values({
      userId: user.id,
      tokenHash,
      familyId,
      expiresAt,
      userAgent: metadata?.userAgent,
      ipAddress: metadata?.ipAddress,
    });

    const accessToken = signAccessToken(user.id);

    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      tokens: {
        accessToken,
        refreshToken: rawRefreshToken,
      },
    };
  }

  /**
   * Refreshes an existing session using rotation, grace period for concurrency,
   * family reuse detection, and bounded session lifetime.
   */
  public async refreshSession(params: {
    refreshToken?: string;
    userAgent?: string;
    ipAddress?: string;
  }): Promise<AuthTokens> {
    const { refreshToken, userAgent, ipAddress } = params;

    if (!refreshToken) {
      throw new AuthServiceError(AUTH_ERROR_CODES.REFRESH_TOKEN_MISSING, "Refresh token is missing");
    }

    const tokenHash = hashToken(refreshToken);

    const records = await db
      .select()
      .from(refreshTokensTable)
      .where(eq(refreshTokensTable.tokenHash, tokenHash));

    if (!records || records.length === 0 || !records[0]) {
      throw new AuthServiceError(AUTH_ERROR_CODES.REFRESH_TOKEN_INVALID, "Invalid refresh token");
    }

    const currentToken = records[0];

    // Check expiry
    if (new Date(currentToken.expiresAt).getTime() < Date.now()) {
      throw new AuthServiceError(AUTH_ERROR_CODES.REFRESH_TOKEN_EXPIRED, "Refresh token has expired");
    }

    // Check if token was already revoked (Reuse Detection)
    if (currentToken.revokedAt) {
      const revokedTime = new Date(currentToken.revokedAt).getTime();
      const isWithinGrace = Date.now() - revokedTime <= REUSE_GRACE_SECONDS * 1000;
      const hasReplacement = Boolean(currentToken.replacedByTokenId);

      if (isWithinGrace && hasReplacement) {
        // Benign concurrency race: another tab or request already rotated this token
        // Do NOT revoke the family or clear cookies.
        logger.info(`Refresh token race detected within grace period for family ${currentToken.familyId}`);
        throw new AuthServiceError(
          AUTH_ERROR_CODES.REFRESH_RACE,
          "Concurrent refresh detected; existing rotation in progress"
        );
      }

      // Malicious replay / theft: Revoke ALL tokens in this family immediately
      logger.warn(`Refresh token reuse detected! Revoking family ${currentToken.familyId}`);
      await db
        .update(refreshTokensTable)
        .set({ revokedAt: new Date() })
        .where(
          and(
            eq(refreshTokensTable.familyId, currentToken.familyId),
            isNull(refreshTokensTable.revokedAt)
          )
        );

      throw new AuthServiceError(
        AUTH_ERROR_CODES.REFRESH_TOKEN_REUSED,
        "Refresh token reuse detected; session revoked"
      );
    }

    // Check absolute session lifetime: max MAX_SESSION_DAYS from family creation
    const earliestToken = await db
      .select({ createdAt: refreshTokensTable.createdAt })
      .from(refreshTokensTable)
      .where(eq(refreshTokensTable.familyId, currentToken.familyId))
      .orderBy(asc(refreshTokensTable.createdAt))
      .limit(1);

    if (
      earliestToken[0] &&
      Date.now() - new Date(earliestToken[0].createdAt).getTime() >
        MAX_SESSION_DAYS * 24 * 60 * 60 * 1000
    ) {
      // Family exceeded maximum session lifetime
      await db
        .update(refreshTokensTable)
        .set({ revokedAt: new Date() })
        .where(
          and(
            eq(refreshTokensTable.familyId, currentToken.familyId),
            isNull(refreshTokensTable.revokedAt)
          )
        );
      throw new AuthServiceError(
        AUTH_ERROR_CODES.REFRESH_TOKEN_EXPIRED,
        "Maximum session lifetime reached; please sign in again"
      );
    }

    // Rotate token inside ONE atomic transaction
    const newTokens = await db.transaction(async (tx) => {
      // 1. Conditionally revoke the current token to prevent double-spend under concurrency
      const updatedOld = await tx
        .update(refreshTokensTable)
        .set({
          revokedAt: new Date(),
          lastUsedAt: new Date(),
        })
        .where(
          and(
            eq(refreshTokensTable.id, currentToken.id),
            isNull(refreshTokensTable.revokedAt)
          )
        )
        .returning({ id: refreshTokensTable.id });

      if (!updatedOld || updatedOld.length !== 1) {
        // Another concurrent request just rotated it
        throw new AuthServiceError(
          AUTH_ERROR_CODES.REFRESH_RACE,
          "Concurrent refresh detected"
        );
      }

      // 2. Verify the user still exists and is active
      const userCheck = await tx
        .select({ id: usersTable.id })
        .from(usersTable)
        .where(eq(usersTable.id, currentToken.userId));

      if (!userCheck || userCheck.length === 0) {
        await tx
          .update(refreshTokensTable)
          .set({ revokedAt: new Date() })
          .where(eq(refreshTokensTable.familyId, currentToken.familyId));
        throw new AuthServiceError(AUTH_ERROR_CODES.INVALID_ACCESS_TOKEN, "User no longer exists");
      }

      // 3. Generate new refresh token
      const { raw: newRaw, hash: newHash } = generateRefreshToken();
      const newExpiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL * 1000);

      // 4. Insert new RefreshToken in the SAME family
      const [newRow] = await tx
        .insert(refreshTokensTable)
        .values({
          userId: currentToken.userId,
          tokenHash: newHash,
          familyId: currentToken.familyId,
          expiresAt: newExpiresAt,
          userAgent: userAgent ?? currentToken.userAgent,
          ipAddress: ipAddress ?? currentToken.ipAddress,
        })
        .returning({ id: refreshTokensTable.id });

      if (!newRow) {
        throw new Error("Failed to insert rotated refresh token");
      }

      // 5. Link replacedByTokenId on the old row
      await tx
        .update(refreshTokensTable)
        .set({
          replacedByTokenId: newRow.id,
        })
        .where(eq(refreshTokensTable.id, currentToken.id));

      // 6. Sign new access token
      const newAccessToken = signAccessToken(currentToken.userId);

      return {
        accessToken: newAccessToken,
        refreshToken: newRaw,
      };
    });

    return newTokens;
  }

  /**
   * Logs out the session by revoking the entire family of the provided refresh token.
   * Tolerates missing or expired tokens gracefully.
   */
  public async logoutSession(refreshToken?: string): Promise<{ success: boolean }> {
    if (!refreshToken) {
      return { success: true };
    }

    try {
      const tokenHash = hashToken(refreshToken);
      const records = await db
        .select({ familyId: refreshTokensTable.familyId })
        .from(refreshTokensTable)
        .where(eq(refreshTokensTable.tokenHash, tokenHash));

      if (records && records.length > 0 && records[0]?.familyId) {
        await db
          .update(refreshTokensTable)
          .set({ revokedAt: new Date() })
          .where(
            and(
              eq(refreshTokensTable.familyId, records[0].familyId),
              isNull(refreshTokensTable.revokedAt)
            )
          );
      }
    } catch (err) {
      logger.error("Error during session logout", { err });
    }

    return { success: true };
  }

  /**
   * Revokes all active refresh tokens for the given user.
   */
  public async revokeAllUserRefreshTokens(userId: string): Promise<void> {
    await db
      .update(refreshTokensTable)
      .set({ revokedAt: new Date() })
      .where(
        and(
          eq(refreshTokensTable.userId, userId),
          isNull(refreshTokensTable.revokedAt)
        )
      );
  }

  /**
   * Cleans up expired and revoked refresh tokens older than 7 days.
   */
  public async deleteExpiredRefreshTokens(): Promise<{ deletedCount: number }> {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const deleted = await db
      .delete(refreshTokensTable)
      .where(
        or(
          lt(refreshTokensTable.expiresAt, sevenDaysAgo),
          and(
            isNotNull(refreshTokensTable.revokedAt),
            lt(refreshTokensTable.revokedAt, sevenDaysAgo)
          )
        )
      )
      .returning({ id: refreshTokensTable.id });

    return { deletedCount: deleted.length };
  }

  public async requestPasswordReset(payload: RequestPasswordResetSchema) {
    const { email } = await requestPasswordResetSchema.parseAsync(payload);
    const normalizedEmail = email.trim().toLowerCase();

    // Constant response path to prevent email enumeration
    const genericResponse = {
      success: true,
      message: "If an account exists for that email, we've sent a password reset link.",
    };

    const user = await this.getUserByEmail(normalizedEmail);
    if (!user) {
      return genericResponse;
    }

    // Rate limiting: Maximum 3 requests per hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentTokens = await db
      .select({ id: passwordResetTokensTable.id })
      .from(passwordResetTokensTable)
      .where(
        and(
          eq(passwordResetTokensTable.userId, user.id),
          gte(passwordResetTokensTable.createdAt, oneHourAgo)
        )
      );

    if (recentTokens.length >= MAX_RESET_REQUESTS_PER_HOUR) {
      logger.warn(`Password reset rate limit exceeded for user ${user.id}`);
      return genericResponse;
    }

    // Invalidate/delete previous unused reset tokens for this user
    await db
      .delete(passwordResetTokensTable)
      .where(
        and(
          eq(passwordResetTokensTable.userId, user.id),
          isNull(passwordResetTokensTable.usedAt)
        )
      );

    // Generate cryptographically secure raw token and SHA-256 storage hash
    const rawToken = randomBytes(32).toString("hex");
    const tokenHash = createHash("sha256").update(rawToken).digest("hex");
    const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MINUTES * 60 * 1000);

    await db.insert(passwordResetTokensTable).values({
      userId: user.id,
      tokenHash,
      expiresAt,
    });

    const resetUrl = `${env.APP_URL}/reset-password?token=${rawToken}`;

    // Safely send email without failing the generic response
    try {
      await sendPasswordResetEmail({
        to: user.email,
        resetUrl,
        expiresInMinutes: RESET_TOKEN_TTL_MINUTES,
      });
    } catch (err) {
      logger.error("Failed to send password reset email", { err });
    }

    return genericResponse;
  }

  public async verifyResetToken(payload: VerifyResetTokenSchema) {
    const { token } = await verifyResetTokenSchema.parseAsync(payload);
    const tokenHash = createHash("sha256").update(token).digest("hex");

    const records = await db
      .select()
      .from(passwordResetTokensTable)
      .where(eq(passwordResetTokensTable.tokenHash, tokenHash));

    if (!records || records.length === 0 || !records[0]) {
      return { valid: false };
    }

    const record = records[0];

    const isUnused = !record.usedAt;
    const isUnexpired = new Date(record.expiresAt).getTime() > Date.now();

    return {
      valid: Boolean(isUnused && isUnexpired),
    };
  }

  public async resetPassword(payload: ResetPasswordSchema) {
    const { token, newPassword } = await resetPasswordSchema.parseAsync(payload);
    const tokenHash = createHash("sha256").update(token).digest("hex");

    const records = await db
      .select()
      .from(passwordResetTokensTable)
      .where(eq(passwordResetTokensTable.tokenHash, tokenHash));

    if (!records || records.length === 0 || !records[0]) {
      throw new Error("Invalid or expired reset link");
    }

    const tokenRecord = records[0];

    const isUnused = !tokenRecord.usedAt;
    const isUnexpired = new Date(tokenRecord.expiresAt).getTime() > Date.now();

    if (!isUnused || !isUnexpired) {
      throw new Error("Invalid or expired reset link");
    }

    // Generate new salt and hash using exact signup parameters
    const newSalt = randomBytes(16).toString("hex");
    const newHashedPassword = createHmac("sha256", newSalt).update(newPassword).digest("hex");

    // Execute password update, mark token as used, invalidate reset tokens,
    // and revoke ALL active refresh tokens for the user in an atomic transaction
    await db.transaction(async (tx) => {
      await tx
        .update(usersTable)
        .set({
          password: newHashedPassword,
          salt: newSalt,
        })
        .where(eq(usersTable.id, tokenRecord.userId));

      await tx
        .update(passwordResetTokensTable)
        .set({
          usedAt: new Date(),
        })
        .where(eq(passwordResetTokensTable.id, tokenRecord.id));

      await tx
        .delete(passwordResetTokensTable)
        .where(
          and(
            eq(passwordResetTokensTable.userId, tokenRecord.userId),
            ne(passwordResetTokensTable.id, tokenRecord.id)
          )
        );

      // Security requirement: On password change/reset, revoke all active refresh tokens for this user
      await tx
        .update(refreshTokensTable)
        .set({ revokedAt: new Date() })
        .where(
          and(
            eq(refreshTokensTable.userId, tokenRecord.userId),
            isNull(refreshTokensTable.revokedAt)
          )
        );
    });

    return {
      success: true,
      message: "Password updated successfully",
    };
  }

  public async getUserInfoById(id: string): Promise<AuthUserInfo> {
    const user = await db
      .select({
        id: usersTable.id,
        fullName: usersTable.fullName,
        email: usersTable.email,
      })
      .from(usersTable)
      .where(eq(usersTable.id, id));

    if (!user || user.length === 0 || !user[0]) {
      throw new Error("User does not exist");
    }

    return user[0];
  }

  /**
   * Backward-compatible token verification helper
   */
  public async verifyAndDecodeUserToken(token: string) {
    const result = verifyAccessToken(token);
    if (!result.valid) {
      throw new Error(result.error === "EXPIRED" ? "Token expired" : "Invalid token");
    }
    return { id: result.userId };
  }
}

export default UserService;
