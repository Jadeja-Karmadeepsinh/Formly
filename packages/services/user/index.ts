import { randomBytes, createHmac} from "node:crypto";
import { db, eq } from "@formly/database";
import { usersTable } from "@formly/database/schema";
import jwt from "jsonwebtoken";
import { env } from "../env";

import {
  createUserWithEmailAndPassword,
  type CreateUserWithEmailAndPasswordSchema,
  generateUserToken,
  type GenerateUserTokenInputSchema
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
}

export default UserService;
