import { getCookie, setCookie, deleteCookie } from "./utils/cookie";
import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";

export interface TRPCCtxUser {
    id: string,
}

export interface TRPCContext {
    setCookie: (name: string, value: string, options: object) => void;
    getCookie: (name: string) => string | undefined;
    deleteCookie: (name: string) => void;

    user?: TRPCCtxUser;
}

export async function createContext({ req, res }: CreateExpressContextOptions): Promise<TRPCContext> {
    const ctx: TRPCContext = {
        setCookie: (name: string, value: string, options: object) => setCookie(res, name, value, options),
        getCookie: (name: string) => getCookie(name, req),
        deleteCookie: (name: string) => deleteCookie(res, name),

        user: undefined,
    }

    return ctx;
}

export type Context = Awaited<ReturnType<typeof createContext>>;
