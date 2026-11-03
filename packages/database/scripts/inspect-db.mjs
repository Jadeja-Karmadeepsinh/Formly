import { Client } from 'pg';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });

const client = new Client({ connectionString: process.env.DATABASE_URL });
await client.connect();

const { rows: forms } = await client.query('SELECT id, title, created_by, status FROM forms ORDER BY updated_at DESC LIMIT 5');
console.log('Forms:', forms);

const { rows: users } = await client.query('SELECT id, email, name FROM "user" LIMIT 3');
console.log('Users:', users);

const { rows: sessions } = await client.query('SELECT token, user_id, expires_at FROM session WHERE expires_at > NOW() LIMIT 3');
console.log('Active Sessions:', sessions);

await client.end();

