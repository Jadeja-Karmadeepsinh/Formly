import { z } from "zod";

export const createUserWithEmailAndPassword = z.object({
  fullName: z.string().min(3, "Full name must be at least 3 characters long").max(100, "Full name must be at most 100 characters long").describe("fullname of the user"),
  email: z.email("Invalid email address").describe("email of the user"),
  password: z.string().min(6, "Password must be at least 6 characters long").max(100, "Password must be at most 100 characters long").describe("password of the user"),
  
});
export type CreateUserWithEmailAndPasswordSchema = z.infer<typeof createUserWithEmailAndPassword>;

export const generateUserToken = z.object({
    id: z.string().describe("user id of the user"),
});

export type GenerateUserTokenInputSchema = z.infer<typeof generateUserToken>;
