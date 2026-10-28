import express from "express";
import { logger } from "@formly/logger";
import cors from "cors";
import cookieParser from "cookie-parser";
import { toNodeHandler } from "better-auth/node";
import { auth } from "@formly/services/auth";

import * as trpcExpress from "@trpc/server/adapters/express";
import { generateOpenApiDocument, createOpenApiExpressMiddleware } from "trpc-to-openapi";
import { apiReference } from "@scalar/express-api-reference";

import { serverRouter, createContext } from "@formly/trpc/server";

import { env } from "./env";

export const app = express();
const openApiDocument = generateOpenApiDocument(serverRouter, {
  title: "Formly OpenAPI",
  version: "1.0.0",
  baseUrl: env.BASE_URL.concat("/api"),
});

const allowedOrigins = Array.from(new Set([env.FRONTEND_URL, "http://localhost:3000"].filter(Boolean)));

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// Mount Better Auth before express.json() and before /api OpenAPI middleware
app.all(["/api/auth", "/api/auth/{*any}"], toNodeHandler(auth));

app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  return res.json({ message: "Formly is up and running..." });
});

app.get("/health", (req, res) => {
  return res.json({ message: "Formly server is healthy", healthy: true });
});

logger.debug(`openapi.json: ${env.BASE_URL}/openapi.json`);
app.get("/openapi.json", (req, res) => {
  return res.json(openApiDocument);
});

logger.debug(`docs: ${env.BASE_URL}/docs`);
app.use("/docs", apiReference({ url: "/openapi.json" }));

app.use(
  "/api",
  createOpenApiExpressMiddleware({
    router: serverRouter,
    createContext,
  }),
);

app.use(
  "/trpc",
  trpcExpress.createExpressMiddleware({
    router: serverRouter,
    createContext,
  }),
);

export default app;
