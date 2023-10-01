import { createContext, protectedProcedure, publicProcedure, router } from "./trpc";
import { createHTTPServer } from "@trpc/server/adapters/standalone";
import { z } from "zod";
import cors from "cors"
import dotenv from "dotenv"
import { userRouter } from "./router/user";
import { channelRouter } from "./router/channel";

dotenv.config()

const appRouter = router({
  test: protectedProcedure
    .input(z.undefined())
    .query(async ({ ctx: { prisma, user } }) => {
      console.log(user);

      return {
        count: await prisma.user.count(),
      };
    }),
  user: userRouter,
  channel: channelRouter,
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
