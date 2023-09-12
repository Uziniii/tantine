import { prisma } from './db';
import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";
import type { CreateHTTPContextOptions } from "@trpc/server/adapters/standalone"

export const createContext = async (opts: CreateHTTPContextOptions) => {
  return {
    prisma,
  };
};

/**
 * Initialization of tRPC backend
 * Should be done only once per backend!
 */
const t = initTRPC.context<typeof createContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

/**
 * Export reusable router and procedure helpers
 * that can be used throughout the router
 */
export const router = t.router;
export const publicProcedure = t.procedure;
