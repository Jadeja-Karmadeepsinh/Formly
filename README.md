# Formly

A Typeform/Tally-inspired form builder SaaS platform built with modern TypeScript, Express 5, tRPC v11, Next.js 16, and PostgreSQL with Drizzle ORM.

---

## Architecture Overview

- **`apps/web`**: Next.js 16 (App Router) + React 19 + Tailwind CSS v4 web application (port `3000`).
- **`apps/api`**: Express 5 API server mounting native tRPC at `/trpc`, Better Auth at `/api/auth/{*any}`, REST endpoints at `/api`, and Scalar docs at `/docs` (port `8000`).
- **`packages/services`**: Domain business logic, `UserService`, Better Auth identity layer, token cryptographic engine, and Nodemailer email dispatch.
- **`packages/trpc`**: tRPC server router, context, authentication procedures, and client re-exports.
- **`packages/database`**: Drizzle ORM client singleton, PostgreSQL 15 schemas (`users`, `accounts`, `auth_sessions`, `verifications`, `refresh_tokens`, `password_reset_tokens`), and migration management.
- **`packages/logger`**: Winston structured logging package.
- **`packages/typescript-config` & `packages/eslint-config`**: Shared toolchain configurations.

### Authentication Strategy (Hybrid Architecture)

Formly uses a hybrid authentication model:
1. **OAuth Identity Layer**: Better Auth handles third-party OAuth flows with Google and GitHub.
2. **Session Authority**: The custom dual-token session architecture remains the sole authority:
   - `access_token`: 15-minute HS256 JWT, scoped to `/`
   - `refresh_token`: 7-day cryptographically secure opaque token with SHA-256 storage hash, session family tracking, reuse detection, and path scoped to `/trpc`
3. **Bridge Mutation**: Upon successful OAuth redirect to `/oauth/callback`, the web client calls `auth.completeOAuthSignIn`, which validates the temporary Better Auth session, applies account pre-hijack mitigation, issues standard dual tokens via `UserService`, and revokes the temporary Better Auth session.

---

## Getting Started

### Prerequisites

- Node.js >= 18
- pnpm 9.0.0 (`npm i -g pnpm`)
- PostgreSQL 15 (Docker or local instance)

### 1. Environment Configuration

Copy the example environment file:
```bash
cp .env.example .env
```

Distribute `.env` to all workspace packages:
```bash
bash setup.sh
```

### 2. Database Setup

Start local PostgreSQL 15 container (if using Docker):
```bash
docker compose up -d
```

Generate and run migrations:
```bash
pnpm db:generate
pnpm db:migrate
```

### 3. Development Server

Start both the API (`http://localhost:8000`) and Web app (`http://localhost:3000`):
```bash
pnpm dev
```

Key Endpoints:
- Web App: `http://localhost:3000`
- API Health: `http://localhost:8000/health`
- tRPC Endpoint: `http://localhost:8000/trpc`
- Better Auth Base: `http://localhost:8000/api/auth`
- Interactive OpenAPI Docs (Scalar): `http://localhost:8000/docs`
- OpenAPI Specification: `http://localhost:8000/openapi.json`

---

## OAuth Provider Setup Guide

To enable Google and GitHub social authentication, register OAuth applications with the respective providers and populate your local `.env`. Never commit secrets to version control.

### 1. Google Cloud Console

1. Navigate to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create or select an existing project.
3. Configure the **OAuth consent screen** (User Type: External) and add the `userinfo.email` and `userinfo.profile` scopes.
4. Go to **Credentials** -> **Create Credentials** -> **OAuth client ID**.
5. Select **Application type**: **Web application**.
6. Set **Authorized JavaScript origins**:
   - Development: `http://localhost:3000`
   - Production: `https://your-frontend-domain.com`
7. Set **Authorized redirect URIs**:
   - Development: `http://localhost:8000/api/auth/callback/google`
   - Production: `https://your-api-domain.com/api/auth/callback/google`
8. Copy the **Client ID** and **Client Secret** into `.env`:
   ```env
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   ```

### 2. GitHub Developer Settings

1. Navigate to [GitHub Developer Settings](https://github.com/settings/developers) -> **OAuth Apps**.
2. Click **New OAuth App** (recommend separate apps for Dev and Prod, as GitHub allows only one callback URL per OAuth App).
3. Set **Application name**: `Formly (Dev)`
4. Set **Homepage URL**:
   - Development: `http://localhost:3000`
   - Production: `https://your-frontend-domain.com`
5. Set **Authorization callback URL**:
   - Development: `http://localhost:8000/api/auth/callback/github`
   - Production: `https://your-api-domain.com/api/auth/callback/github`
6. Register the application, then generate a new client secret.
7. Copy the **Client ID** and **Client Secret** into `.env`:
   ```env
   GITHUB_CLIENT_ID=your_github_client_id
   GITHUB_CLIENT_SECRET=your_github_client_secret
   ```

*(Note: In development mode, if provider credentials are omitted, Formly logs a warning and disables that provider rather than crashing. In production, provider credentials are required).*

---

## Available Scripts

| Script | Command | Purpose |
|---|---|---|
| `pnpm dev` | `turbo dev` | Runs all applications in watch mode |
| `pnpm build` | `turbo build` | Compiles API (`tsup`) and builds Next.js production bundle |
| `pnpm check-types` | `turbo check-types` | Type-checks all 8 workspace packages |
| `pnpm format` | `prettier --write "**/*.{ts,tsx,md}"` | Formats all source files with Prettier |
| `pnpm db:generate` | `drizzle-kit generate` | Generates SQL migrations from schema |
| `pnpm db:migrate` | `drizzle-kit migrate` | Applies pending SQL migrations |
| `pnpm --filter @formly/database dev` | `drizzle-kit studio` | Opens Drizzle Studio database viewer |

---

## Documentation

Full architectural specifications, data schemas, API procedures, and recipes can be found in `docs/ai-context/`:
- [`00-OVERVIEW.md`](file:///c:/Users/ASUS/Desktop/CoHort%2026/Projects/Formly/docs/ai-context/00-OVERVIEW.md)
- [`01-DATABASE.md`](file:///c:/Users/ASUS/Desktop/CoHort%2026/Projects/Formly/docs/ai-context/01-DATABASE.md)
- [`02-SERVICES.md`](file:///c:/Users/ASUS/Desktop/CoHort%2026/Projects/Formly/docs/ai-context/02-SERVICES.md)
- [`03-TRPC-API.md`](file:///c:/Users/ASUS/Desktop/CoHort%2026/Projects/Formly/docs/ai-context/03-TRPC-API.md)
- [`04-AUTH.md`](file:///c:/Users/ASUS/Desktop/CoHort%2026/Projects/Formly/docs/ai-context/04-AUTH.md)
- [`05-FORM-BUILDER-DOMAIN.md`](file:///c:/Users/ASUS/Desktop/CoHort%2026/Projects/Formly/docs/ai-context/05-FORM-BUILDER-DOMAIN.md)
- [`06-FRONTEND.md`](file:///c:/Users/ASUS/Desktop/CoHort%2026/Projects/Formly/docs/ai-context/06-FRONTEND.md)
- [`07-FLOWS-AND-RECIPES.md`](file:///c:/Users/ASUS/Desktop/CoHort%2026/Projects/Formly/docs/ai-context/07-FLOWS-AND-RECIPES.md)
- [`08-RISKS-AND-OPEN-QUESTIONS.md`](file:///c:/Users/ASUS/Desktop/CoHort%2026/Projects/Formly/docs/ai-context/08-RISKS-AND-OPEN-QUESTIONS.md)
- [`PROJECT_CONTEXT.md`](file:///c:/Users/ASUS/Desktop/CoHort%2026/Projects/Formly/docs/ai-context/PROJECT_CONTEXT.md)
