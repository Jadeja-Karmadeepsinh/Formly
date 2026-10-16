import { httpLink, httpBatchStreamLink } from "@formly/trpc/client";
import { env } from "~/env.js";

interface CreateTRPCHttpBatchClientClientOpts {
  enableStreaming?: boolean;
}

const getBaseUrl = () => {
  if (typeof window !== "undefined") {
    return env.NEXT_PUBLIC_API_URL ?? "";
  }
  return env.NEXT_PUBLIC_API_URL ?? `http://localhost:${process.env.API_PORT ?? 8000}`;
};

export const createTRPCHttpBatchClientClient = (opts?: CreateTRPCHttpBatchClientClientOpts) => {
  const c = opts?.enableStreaming ? httpBatchStreamLink : httpLink;
  const baseUrl = getBaseUrl();
  const url = baseUrl.endsWith("/trpc") ? baseUrl : `${baseUrl}/trpc`;
  return c({
    url,
    fetch(url, options) {
      return fetch(url, {
        ...options,
        credentials: "include",
      });
    },
  });
};
