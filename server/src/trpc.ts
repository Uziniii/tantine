import ws from 'ws';
import { IncomingMessage } from "http"
import { prisma } from './db';
import { TRPCError, initTRPC } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";
import type { CreateHTTPContextOptions } from "@trpc/server/adapters/standalone"
import { Payload, verifyJwtToken } from './jwt';
import { decode } from 'jsonwebtoken';
import { NodeHTTPCreateContextFnOptions } from '@trpc/server/dist/adapters/node-http';

export const createContext = async ({
  req,
  res,
}:
  | CreateHTTPContextOptions
  | NodeHTTPCreateContextFnOptions<IncomingMessage, ws>) => {
  async function getUserFromHeader() {
    if (req.headers.authorization) {
      const token = req.headers.authorization.split(" ")[1];

      const user = decode(token) as Payload;

      const dbUser = await prisma.user.findUnique({
        where: {
          id: user.id,
        },
        select: {
          hashedPassword: true,
        },
      });

      if (!dbUser || !verifyJwtToken(token, dbUser.hashedPassword)) {
        return null;
      }

      return user;
    }

    return null;
  }

  const user = await getUserFromHeader();

  return {
    prisma,
    user,
  };
};

export const createContextWS = async ({
  req,
  res,
}: NodeHTTPCreateContextFnOptions<IncomingMessage, ws>) => {
  async function getUserFromHeader() {
    if (req.headers.authorization) {
      const token = req.headers.authorization.split(" ")[1];

      const user = decode(token) as Payload;

      const dbUser = await prisma.user.findUnique({
        where: {
          id: user.id,
        },
        select: {
          hashedPassword: true,
        },
      });

      if (!dbUser || !verifyJwtToken(token, dbUser.hashedPassword)) {
        return null;
      }

      return user;
    }

    return null;
  }

  const user = await getUserFromHeader();

  return {
    prisma,
    user,
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

const userIsAuthed = t.middleware(({ ctx, next }) => {
  if (ctx.user === null) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return next({
    ctx: {
      prisma,
      user: ctx.user,
    },
  });
});

export const protectedProcedure = t.procedure.use(userIsAuthed);
