import crypto from 'crypto';
import path from 'path';
import dotenv from 'dotenv';
import { Client } from 'pg';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });

const secret = process.env.BETTER_AUTH_SECRET;
console.log('Secret exists:', Boolean(secret));

const client = new Client({ connectionString: process.env.DATABASE_URL });
await client.connect();

const { rows: sessions } = await client.query('SELECT token, user_id FROM session WHERE expires_at > NOW() LIMIT 1');
await client.end();

if (!sessions.length) {
  console.log('No session');
  process.exit(1);
}

const token = sessions[0].token;

// Better auth uses standard HMAC-SHA256 base64url or base64
// Let's test with fetch to http://localhost:8000/api/auth/get-session
const unsignedToken = token;

// Test 1: raw token
const res1 = await fetch('http://localhost:8000/api/auth/get-session', {
  headers: {
    'cookie': `better-auth.session_token=${unsignedToken}`,
  }
});
console.log('Raw token get-session status:', res1.status, await res1.text());

// Test 2: signed token
// In better-call:
// sign(value, secret) => `${value}.${base64(hmac(value, secret))}`
const hmac = crypto.createHmac('sha256', secret).update(token).digest('base64');
const signedToken = `${token}.${hmac}`;

const res2 = await fetch('http://localhost:8000/api/auth/get-session', {
  headers: {
    'cookie': `better-auth.session_token=${signedToken}`,
  }
});
console.log('Signed token get-session status:', res2.status, await res2.text());

