import { z } from "zod";

export const meOutputModel = z.object({
  id: z.string().describe("id of the user"),
  name: z.string().describe("name of the user"),
  fullName: z.string().describe("full name of the user"),
  email: z.string().describe("email of the user"),
  image: z.string().nullable().optional().describe("profile image of the user"),
  emailVerified: z.boolean().describe("email verification status"),
  createdAt: z.date().optional(),
});

export type MeOutput = z.infer<typeof meOutputModel>;
