import { z } from "zod";

export const createUserWithEmailAndPasswordInputModel = z.object({
  fullName: z.string().describe("full name of the user"),
  email: z.email().describe("email of the user"),
  password: z.string().describe("password of the user"),
});

export const createUserWithEmailAndPasswordOutputModel = z.object({
  id: z.string().describe("id of the user"),
  fullName: z.string().describe("full name of the user"),
  email: z.email().describe("email of the user"),
});

export const signInUserWithEmailAndPasswordInputModel = z.object({
  email: z.email().describe("email of the user"),
  password: z.string().describe("password of the user"),
});

export const signInUserWithEmailAndPasswordOutputModel = z.object({
  id: z.string().describe("id of the user"),
  fullName: z.string().describe("full name of the user"),
  email: z.email().describe("email of the user"),
});

export const requestPasswordResetInputModel = z.object({
  email: z.email().describe("email of the user"),
});

export const requestPasswordResetOutputModel = z.object({
  success: z.boolean(),
  message: z.string(),
});

export const verifyResetTokenInputModel = z.object({
  token: z.string().min(1).describe("raw password reset token"),
});

export const verifyResetTokenOutputModel = z.object({
  valid: z.boolean(),
});

export const resetPasswordInputModel = z.object({
  token: z.string().min(1).describe("raw password reset token"),
  newPassword: z.string().min(8, "Password must be at least 8 characters long").max(100),
  confirmPassword: z.string().min(1, "Please confirm password"),
});

export const resetPasswordOutputModel = z.object({
  success: z.boolean(),
  message: z.string(),
});

export const refreshOutputModel = z.object({
  success: z.boolean(),
});

export const logoutOutputModel = z.object({
  success: z.boolean(),
});

export const logoutAllOutputModel = z.object({
  success: z.boolean(),
});

export const meOutputModel = z.object({
  id: z.string().describe("id of the user"),
  fullName: z.string().describe("full name of the user"),
  email: z.string().describe("email of the user"),
});

export const completeOAuthSignInInputModel = z.object({}).optional().default({});

export const completeOAuthSignInOutputModel = z.object({
  id: z.string().describe("id of the user"),
  fullName: z.string().describe("full name of the user"),
  email: z.string().describe("email of the user"),
});

