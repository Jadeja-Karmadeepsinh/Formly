import { createTRPCReact } from "@trpc/react-query";
import { ServerRouter } from "@formly/trpc/client";

export const trpc = createTRPCReact<ServerRouter>();
