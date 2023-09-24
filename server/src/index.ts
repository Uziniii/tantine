import { createContext, publicProcedure, router } from "./trpc";
import { createHTTPServer } from "@trpc/server/adapters/standalone";
import { z } from "zod";
import cors from "cors"
import dotenv from "dotenv"
import { userRouter } from "./router/user";

dotenv.config()

const appRouter = router({
  test: publicProcedure
    .input(z.undefined())
    .query(async ({ ctx: { prisma } }) => {
      return {
        count: await prisma.user.count()
      }
    }),
  user: userRouter
});

// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;

const server = createHTTPServer({
  createContext,
  router: appRouter,
  middleware: cors(),
});

server.listen(3000);
console.log("Server started");
