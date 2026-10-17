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
    token: z.string().describe("jwt token of the user"),
});

export const signInUserWithEmailAndPasswordInputModel = z.object({
    email: z.email().describe("email of the user"),
    password: z.string().describe("password of the user"),
});

export const signInUserWithEmailAndPasswordOutputModel = z.object({
    id: z.string().describe("id of the user"), 
    fullName: z.string().describe("full name of the user"),
    email: z.email().describe("email of the user"),
    token: z.string().describe("jwt token of the user"),
});