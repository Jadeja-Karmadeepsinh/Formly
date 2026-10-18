import type { ServerRouter } from "@formly/trpc/client";
import { createTRPCProxyClient, httpLink } from "@formly/trpc/client";
import { cookies } from "next/headers";
import { createTRPCHttpBatchClientClient } from "~/trpc/create-client";
import { env } from "~/env.js";

const getBaseUrl = () => {
  return env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
};

/**
 * Creates a server-side tRPC proxy client forwarding incoming request cookies
 */
export const createServerTRPCClient = async () => {
  const cookieStore = await cookies();
  const baseUrl = getBaseUrl();
  const url = baseUrl.endsWith("/trpc") ? baseUrl : `${baseUrl}/trpc`;

  return createTRPCProxyClient<ServerRouter>({
    links: [
      httpLink({
        url,
        fetch(url, options) {
          return fetch(url, {
            ...options,
            headers: {
              ...options?.headers,
              cookie: cookieStore.toString(),
            },
            credentials: "include",
          });
        },
      }),
    ],
  });
};

export const api = createTRPCProxyClient<ServerRouter>({
  links: [createTRPCHttpBatchClientClient()],
});

export const apiStreaming = createTRPCProxyClient<ServerRouter>({
  links: [createTRPCHttpBatchClientClient({ enableStreaming: true })],
});
