# Better Auth Implementation Plan for Formly

## Your Current Architecture (Quick Recap)

```
Formly/
├── apps/
│   ├── api/          → Express server (tRPC + OpenAPI on port 8000)
│   └── web/          → Next.js 16 frontend (port 3000)
├── packages/
│   ├── database/     → Drizzle ORM + PostgreSQL
│   ├── trpc/         → tRPC router, context, procedures
│   ├── services/     → Business logic (UserService, clients)
│   ├── logger/
│   └── ...configs
```

**Key insight**: Better Auth runs as its own HTTP handler. Since your backend is Express, Better Auth will be mounted as Express middleware. The Next.js frontend will use Better Auth's client SDK to talk to it.

---

## Phase 0: Cleanup — Remove Existing Auth Code

> [!WARNING]
> You said to ignore existing auth code. Here's exactly what to delete/replace.

| File                                                                                                                                             | Action                                                      |
| ------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------- |
| [packages/trpc/server/routes/auth/route.ts](file:///c:/Users/ASUS/Desktop/CoHort%2026/Projects/Formly/packages/trpc/server/routes/auth/route.ts) | Delete entire file and directory                            |
| [packages/trpc/server/index.ts](file:///c:/Users/ASUS/Desktop/CoHort%2026/Projects/Formly/packages/trpc/server/index.ts)                         | Remove `authRouter` import and from the `serverRouter`      |
| [packages/services/user/index.ts](file:///c:/Users/ASUS/Desktop/CoHort%2026/Projects/Formly/packages/services/user/index.ts)                     | Remove `getAuthenticationMethods()` and Google OAuth logic  |
| [packages/services/user/model.ts](file:///c:/Users/ASUS/Desktop/CoHort%2026/Projects/Formly/packages/services/user/model.ts)                     | Delete the `getAuthenticationMethodOutputSchema`            |
| [packages/services/clients/google-oauth.ts](file:///c:/Users/ASUS/Desktop/CoHort%2026/Projects/Formly/packages/services/clients/google-oauth.ts) | Delete — Better Auth handles OAuth clients internally       |
| [packages/database/models/user.ts](file:///c:/Users/ASUS/Desktop/CoHort%2026/Projects/Formly/packages/database/models/user.ts)                   | Will be **replaced** by Better Auth's auto-generated tables |

---

## Phase 1: Install Better Auth

### 1.1 Install on the API (Express backend)

```bash
# From monorepo root
pnpm add better-auth --filter @repo/api
```

Better Auth's core runs server-side. Since your Express app in `apps/api` is where all HTTP traffic routes through, this is where Better Auth lives.

### 1.2 Install on the Web (Next.js frontend)

```bash
pnpm add better-auth --filter web
```

The frontend needs Better Auth's **client SDK** (`createAuthClient`) to interact with the auth endpoints.

---

## Phase 2: Create a Shared Auth Package

> [!IMPORTANT]
> This is the key architectural decision. Better Auth configuration should live in a **shared package** so both `apps/api` and `apps/web` can import from it, and your tRPC context can access the auth instance.

### 2.1 Create `packages/auth/`

```
packages/auth/
├── package.json        → name: "@repo/auth"
├── tsconfig.json
├── server.ts           → Better Auth server instance (betterAuth())
├── client.ts           → Better Auth client instance (createAuthClient())
└── schema.ts           → Re-exports auth-related Drizzle schema (optional)
```

### 2.2 `packages/auth/server.ts` — The Auth Server Instance

This is the **heart** of Better Auth. You configure:

```ts
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@repo/database";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),

  // Email + Password authentication
  emailAndPassword: {
    enabled: true,
    // Optional: require email verification
    // requireEmailVerification: true,
  },

  // Social providers
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
  },

  // IMPORTANT: Tell Better Auth where it's mounted
  basePath: "/api/auth",

  // Trusted origins for CORS
  trustedOrigins: [process.env.FRONTEND_URL || "http://localhost:3000"],
});
```

### 2.3 `packages/auth/client.ts` — The Auth Client

```ts
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
});

// Export typed hooks
export const { signIn, signUp, signOut, useSession } = authClient;
```

> [!NOTE]
> The client points to your **Express API** URL, not the Next.js server. Better Auth's client will call `{baseURL}/api/auth/*` endpoints.

---

## Phase 3: Database Schema — Let Better Auth Generate Tables

### 3.1 How Better Auth Schema Works

Better Auth manages its own tables. It creates:

| Table          | Purpose                                                                      |
| -------------- | ---------------------------------------------------------------------------- |
| `user`         | User profiles (id, name, email, emailVerified, image, createdAt, updatedAt)  |
| `session`      | Active sessions (id, userId, token, expiresAt, ipAddress, userAgent)         |
| `account`      | OAuth accounts linked to users (userId, provider, providerAccountId, tokens) |
| `verification` | Email verification tokens                                                    |

### 3.2 Generate the Drizzle Schema

Better Auth has a CLI that generates the Drizzle schema for you:

```bash
npx @better-auth/cli generate --config ./packages/auth/server.ts --output ./packages/database/models/auth.ts
```

This will output a Drizzle schema file with all required tables. You then:

1. **Replace** your old `user.ts` model with the generated schema
2. **Update** [packages/database/schema.ts](file:///c:/Users/ASUS/Desktop/CoHort%2026/Projects/Formly/packages/database/schema.ts) to export from the new file:
   ```ts
   export * from "./models/auth";
   ```
3. **Run Drizzle migrations**:
   ```bash
   pnpm drizzle-kit generate --filter @repo/database
   pnpm drizzle-kit migrate --filter @repo/database
   ```

### 3.3 Extending the User Table (if needed later)

You can add custom fields to the `user` table via Better Auth's `user.additionalFields` config. For Formly, you might later want fields like `plan`, `role`, etc. But start clean first.

---

## Phase 4: Mount Better Auth on Express

### 4.1 Update [apps/api/src/server.ts](file:///c:/Users/ASUS/Desktop/CoHort%2026/Projects/Formly/apps/api/src/server.ts)

Add Better Auth as Express middleware **before** the tRPC middleware:

```ts
import { auth } from "@repo/auth/server";
import { toNodeHandler } from "better-auth/node";

// Mount Better Auth handler — handles ALL /api/auth/* routes
app.all("/api/auth/*", toNodeHandler(auth));

// ... existing tRPC and OpenAPI middleware below
```

> [!IMPORTANT]
> Better Auth uses `toNodeHandler()` to convert its handler into a Node.js-compatible handler for Express. This must be mounted **before** your tRPC `/api` route, otherwise the tRPC catch-all would intercept auth requests.

### 4.2 Update CORS

```ts
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true, // ← CRITICAL for cookies/sessions
  }),
);
```

---

## Phase 5: Integrate Auth with tRPC Context

This is where everything ties together. Your tRPC procedures need to know **who** the current user is.

### 5.1 Update [packages/trpc/server/context.ts](file:///c:/Users/ASUS/Desktop/CoHort%2026/Projects/Formly/packages/trpc/server/context.ts)

```ts
import { auth } from "@repo/auth/server";
import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";

export async function createContext({ req, res }: CreateExpressContextOptions) {
  // Use Better Auth's API to get session from the request headers
  const session = await auth.api.getSession({
    headers: req.headers as any,
  });

  return {
    user: session?.user ?? null,
    session: session?.session ?? null,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
```

### 5.2 Create a Protected Procedure in [packages/trpc/server/trpc.ts](file:///c:/Users/ASUS/Desktop/CoHort%2026/Projects/Formly/packages/trpc/server/trpc.ts)

```ts
import { TRPCError } from "@trpc/server";

// ... existing setup

export const protectedProcedure = publicProcedure.use(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      user: ctx.user, // Now guaranteed non-null
      session: ctx.session, // Now guaranteed non-null
    },
  });
});
```

Now any tRPC route using `protectedProcedure` will automatically reject unauthenticated users.

---

## Phase 6: Frontend — Auth Pages & Session Management

### 6.1 Environment Variables for Frontend

Update [apps/web/env.js](file:///c:/Users/ASUS/Desktop/CoHort%2026/Projects/Formly/apps/web/env.js):

```ts
client: {
  NEXT_PUBLIC_API_URL: z.string().url(),
},
```

### 6.2 Create Auth Pages

```
apps/web/app/
├── (auth)/
│   ├── login/
│   │   └── page.tsx      → Login form (email/password + social buttons)
│   ├── register/
│   │   └── page.tsx      → Signup form (email/password + social buttons)
│   └── layout.tsx        → Shared auth layout (centered card, branding)
├── (dashboard)/
│   ├── layout.tsx        → Protected layout (checks session, redirects)
│   └── ...
```

### 6.3 Login Page Logic (Pseudocode)

```tsx
import { authClient } from "@repo/auth/client";

// Email + Password login
await authClient.signIn.email({
  email: "user@example.com",
  password: "password123",
});

// Google OAuth
await authClient.signIn.social({
  provider: "google",
  callbackURL: "/dashboard",
});

// GitHub OAuth
await authClient.signIn.social({
  provider: "github",
  callbackURL: "/dashboard",
});
```

### 6.4 Signup Page Logic (Pseudocode)

```tsx
import { authClient } from "@repo/auth/client";

// Email + Password signup
await authClient.signUp.email({
  email: "user@example.com",
  password: "password123",
  name: "John Doe",
});
```

### 6.5 Session Hook Usage

```tsx
import { authClient } from "@repo/auth/client";

export function Dashboard() {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) return <Loading />;
  if (!session) redirect("/login");

  return <div>Welcome, {session.user.name}</div>;
}
```

### 6.6 Sign Out

```tsx
await authClient.signOut();
```

### 6.7 Protect Routes with Next.js Middleware (Optional but Recommended)

Create `apps/web/middleware.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  // Check for Better Auth session cookie
  const sessionCookie = request.cookies.get("better-auth.session_token");

  if (!sessionCookie && request.nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
```

> [!NOTE]
> This is a lightweight client-side guard. The real protection is in the tRPC `protectedProcedure` — even if someone bypasses the middleware, the API won't serve data without a valid session.

---

## Phase 7: OAuth Provider Setup

### 7.1 Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create/select a project
3. Go to **APIs & Services → Credentials**
4. Create **OAuth 2.0 Client ID** (Web application)
5. Add authorized redirect URI:
   ```
   http://localhost:8000/api/auth/callback/google
   ```
6. Copy Client ID and Client Secret

### 7.2 GitHub OAuth

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **New OAuth App**
3. Set:
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:8000/api/auth/callback/github`
4. Copy Client ID and Client Secret

### 7.3 Environment Variables

Add to your root `.env`:

```env
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/formly

# Better Auth
BETTER_AUTH_SECRET=your-random-secret-at-least-32-chars
BETTER_AUTH_URL=http://localhost:8000

# Google OAuth
GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxx

# GitHub OAuth
GITHUB_CLIENT_ID=Ov23liXXXXXX
GITHUB_CLIENT_SECRET=xxxxxxxx

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000
```

---

## Phase 8: Execution Order (Step-by-Step)

Here's the exact order to implement everything:

```mermaid
flowchart TD
    A["Step 1: Cleanup old auth code"] --> B["Step 2: Install better-auth in api & web"]
    B --> C["Step 3: Create packages/auth/ shared package"]
    C --> D["Step 4: Configure Better Auth server instance"]
    D --> E["Step 5: Generate Drizzle schema via CLI"]
    E --> F["Step 6: Run drizzle-kit generate + migrate"]
    F --> G["Step 7: Mount Better Auth on Express"]
    G --> H["Step 8: Update tRPC context with session"]
    H --> I["Step 9: Create protectedProcedure"]
    I --> J["Step 10: Setup OAuth on Google & GitHub"]
    J --> K["Step 11: Add env variables"]
    K --> L["Step 12: Create auth client in packages/auth/client.ts"]
    L --> M["Step 13: Build login & register pages"]
    M --> N["Step 14: Add session provider/hook to layout"]
    N --> O["Step 15: Add Next.js middleware for route protection"]
    O --> P["Step 16: Test all 3 auth flows"]
```

---

## Summary of Files to Create/Modify

| Action     | File                                        | Description                     |
| ---------- | ------------------------------------------- | ------------------------------- |
| 🆕 Create  | `packages/auth/package.json`                | New shared auth package         |
| 🆕 Create  | `packages/auth/server.ts`                   | Better Auth server config       |
| 🆕 Create  | `packages/auth/client.ts`                   | Better Auth client for React    |
| 🆕 Create  | `packages/auth/tsconfig.json`               | TypeScript config               |
| 🗑️ Delete  | `packages/trpc/server/routes/auth/`         | Old auth tRPC route             |
| 🗑️ Delete  | `packages/services/clients/google-oauth.ts` | Old Google OAuth client         |
| ✏️ Modify  | `packages/trpc/server/index.ts`             | Remove authRouter               |
| ✏️ Modify  | `packages/trpc/server/context.ts`           | Add session extraction          |
| ✏️ Modify  | `packages/trpc/server/trpc.ts`              | Add `protectedProcedure`        |
| ✏️ Replace | `packages/database/models/user.ts`          | Replace with Better Auth schema |
| ✏️ Modify  | `packages/database/schema.ts`               | Update exports                  |
| ✏️ Modify  | `apps/api/src/server.ts`                    | Mount Better Auth + fix CORS    |
| ✏️ Modify  | `apps/api/package.json`                     | Add `@repo/auth` dependency     |
| ✏️ Modify  | `apps/web/package.json`                     | Add `@repo/auth` dependency     |
| ✏️ Modify  | `apps/web/env.js`                           | Add API URL validation          |
| 🆕 Create  | `apps/web/app/(auth)/login/page.tsx`        | Login page                      |
| 🆕 Create  | `apps/web/app/(auth)/register/page.tsx`     | Register page                   |
| 🆕 Create  | `apps/web/app/(auth)/layout.tsx`            | Auth layout                     |
| 🆕 Create  | `apps/web/middleware.ts`                    | Route protection                |
| ✏️ Modify  | `.env`                                      | Add all auth env vars           |
| ✏️ Modify  | `pnpm-workspace.yaml`                       | Already covers `packages/*` ✅  |

---

## Key Things to Remember

> [!CAUTION]
>
> - **`BETTER_AUTH_SECRET`** must be a strong random string (32+ chars). Use `openssl rand -base64 32` to generate one.
> - **`credentials: true`** in CORS is essential — without it, cookies won't be sent cross-origin and sessions will break.
> - **Mount order matters** — Better Auth middleware must come before tRPC's `/api` catch-all.
> - Better Auth uses **cookies** for session management by default (not JWTs). This is more secure and works seamlessly with SSR.

> [!TIP]
> Better Auth's auto-generated schema will handle all the complexity of user/session/account/verification tables. You don't need to manually define any auth-related schema — just generate it with the CLI and run migrations.
