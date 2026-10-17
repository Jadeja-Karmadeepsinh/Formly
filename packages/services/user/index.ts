import { randomBytes, createHmac, createHash, timingSafeEqual } from "node:crypto";
import { db, eq, and, isNull, gte, ne } from "@formly/database";
import { usersTable, passwordResetTokensTable } from "@formly/database/schema";
import { logger } from "@formly/logger";
import jwt from "jsonwebtoken";
import { env } from "../env";
import { sendPasswordResetEmail } from "../email";

import {
  createUserWithEmailAndPassword,
  type CreateUserWithEmailAndPasswordSchema,
  generateUserToken,
  type GenerateUserTokenInputSchema,
  signInUserWithEmailAndPassword,
  type SignInUserWithEmailAndPasswordSchema,
  requestPasswordResetSchema,
  type RequestPasswordResetSchema,
  verifyResetTokenSchema,
  type VerifyResetTokenSchema,
  resetPasswordSchema,
  type ResetPasswordSchema,
} from "./model";

const RESET_TOKEN_TTL_MINUTES = 30;
const MAX_RESET_REQUESTS_PER_HOUR = 3;

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

  private async generateUserToken(payload: GenerateUserTokenInputSchema) {
    const { id } = await generateUserToken.parseAsync(payload);
    const token = jwt.sign({ id }, env.JWT_SECRET, { expiresIn: "1h" });
    return { token };
  }

  public async createUserWithEmailAndPassword(payload: CreateUserWithEmailAndPasswordSchema) {
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

    const { token } = await this.generateUserToken({ id: result[0].id });
    if (!token) {
      throw new Error("Token generation failed");
    }

    return {
      id: result[0].id,
      fullName,
      email: normalizedEmail,
      token,
    };
  }

  public async signInUserWithEmailAndPassword(payload: SignInUserWithEmailAndPasswordSchema) {
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

    const { token } = await this.generateUserToken({ id: user.id });
    if (!token) {
      throw new Error("Token generation failed");
    }

    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      token,
    };
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

    // Execute password update, mark token as used, and invalidate others in an atomic transaction
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
    });

    return {
      success: true,
      message: "Password updated successfully",
    };
  }
}

export default UserService;
