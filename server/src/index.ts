import { createContext, publicProcedure, router } from "./trpc";
import { createHTTPServer } from "@trpc/server/adapters/standalone";
import { z } from "zod";
import cors from "cors"
import dotenv from "dotenv"
import { generateAccessToken } from "./jwt";
import { userRouter } from "./router/user";
import bcrypt from "bcrypt"

const salt = bcrypt.genSaltSync(12);
const hash = bcrypt.hashSync("aaaaa", salt);
console.log(hash);

async function main () {
  console.log(await bcrypt.compare("aaa", hash));
  console.log(await bcrypt.compare("aaaaa", hash));
}
main()
console.log(salt);

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
  middleware: cors()
});

server.listen(3000);
