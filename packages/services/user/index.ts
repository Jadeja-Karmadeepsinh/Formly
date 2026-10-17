import { randomBytes, createHmac, timingSafeEqual } from "node:crypto";
import { db, eq } from "@formly/database";
import { usersTable } from "@formly/database/schema";
import jwt from "jsonwebtoken";
import { env } from "../env";

import {
  createUserWithEmailAndPassword,
  type CreateUserWithEmailAndPasswordSchema,
  generateUserToken,
  type GenerateUserTokenInputSchema,
  signInUserWithEmailAndPassword,
  type SignInUserWithEmailAndPasswordSchema
} from "./model";

class UserService {
  private async getUserByEmail(email:string) {
    const result = await db.select().from(usersTable).where(eq(usersTable.email, email));

    if (!result || result.length === 0) {
      return null;
    }

    return result[0];
  }

  private async generateUserToken(payload:GenerateUserTokenInputSchema) {
    const { id } = await generateUserToken.parseAsync(payload);

    const token = jwt.sign({ id }, env.JWT_SECRET, { expiresIn: "1h" });

    return { token };
  }

  public async createUserWithEmailAndPassword(payload: CreateUserWithEmailAndPasswordSchema) {
    const { fullName, email, password } = await createUserWithEmailAndPassword.parseAsync(payload);

    const existingUser = await this.getUserByEmail(email);

    if(existingUser){
      throw new Error("User with this email already exists");
    }

    const salt = randomBytes(16).toString("hex");
    const hashedPassword = createHmac("sha256", salt).update(password).digest("hex");

    const result = await db.insert(usersTable).values({
      fullName: fullName,
      email: email,
      password: hashedPassword,
      salt: salt,
    }).returning({ id: usersTable.id });

    if (!result || result.length === 0 || !result[0]?.id) {
      throw new Error("User creation failed");
    }

    const { token } = await this.generateUserToken({ id: result[0].id });
    
    if(!token) {
      throw new Error("Token generation failed");
    }

    return {
      id: result[0].id,
      fullName: fullName,
      email: email,
      token: token,
    }
  } 

  public async signInUserWithEmailAndPassword(payload: SignInUserWithEmailAndPasswordSchema) {
    const { email, password } = await signInUserWithEmailAndPassword.parseAsync(payload);

    const user = await this.getUserByEmail(email);

    // 1. Generic check: user doesn't exist OR user has no password (e.g. signed up via OAuth)
    if (!user || !user.password || !user.salt) {
      throw new Error("Invalid email or password");
    }

    // 2. Hash the candidate password using the user's stored salt
    const candidateHash = createHmac("sha256", user.salt).update(password).digest("hex");

    // 3. Constant-time comparison to prevent timing attacks
    const candidateBuffer = Buffer.from(candidateHash, "hex");
    const storedBuffer = Buffer.from(user.password, "hex");

    const passwordsMatch =
      candidateBuffer.length === storedBuffer.length &&
      timingSafeEqual(candidateBuffer, storedBuffer);

    if (!passwordsMatch) {
      throw new Error("Invalid email or password");
    }

    // 4. Generate token
    const { token } = await this.generateUserToken({ id: user.id });

    if (!token) {
      throw new Error("Token generation failed");
    }

    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      token: token,
    };
  }

}

export default UserService;
