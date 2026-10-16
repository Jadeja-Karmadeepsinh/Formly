import type { ServerRouter } from "@formly/trpc/client";
import { createTRPCProxyClient } from "@formly/trpc/client";
import { createTRPCHttpBatchClientClient } from "~/trpc/create-client";

export const api = createTRPCProxyClient<ServerRouter>({
  links: [createTRPCHttpBatchClientClient()],
});

export const apiStreaming = createTRPCProxyClient<ServerRouter>({
  links: [createTRPCHttpBatchClientClient({ enableStreaming: true })],
});
