import { applyWSSHandler } from '@trpc/server/adapters/ws';
import ws from 'ws';
import { createContext, createContextWS, protectedProcedure, router } from "./trpc";
import { createHTTPServer } from "@trpc/server/adapters/standalone";
import cors from "cors"
import dotenv from "dotenv"
import { userRouter } from "./router/user";
import { channelRouter } from "./router/channel";

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

const wss = new ws.Server({
  port: 3001,
});
const handler = applyWSSHandler({
  wss,
  router: appRouter,
  createContext 
});

wss.on("connection", (ws) => {
  console.log(`➕➕ Connection (${wss.clients.size})`);
  ws.once("close", () => {
    console.log(`➖➖ Connection (${wss.clients.size})`);
  });
});
console.log("✅ WebSocket Server listening on ws://localhost:3001");

process.on("SIGTERM", () => {
  console.log("SIGTERM");
  handler.broadcastReconnectNotification();
  wss.close();
});
