import { createContext, router } from "./trpc";
import { createHTTPServer } from "@trpc/server/adapters/standalone";
import cors from "cors"
import dotenv from "dotenv"
import { userRouter } from "./router/user";
import { channelRouter } from "./router/channel";
import "./ws"

dotenv.config()

const appRouter = router({
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
  onError({ error }) {
    console.error(error);
  },
});

server.listen(3000);
console.log("Server started");
