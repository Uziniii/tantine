import { createContext, router } from "./trpc";
import { fastifyTRPCPlugin } from "@trpc/server/adapters/fastify";
import dotenv from "dotenv";
import { userRouter } from "./router/user/user";
import { channelRouter } from "./router/channel/channel";
import fastify from "fastify";
import fastifyWebsocket from "@fastify/websocket";
import cors from "@fastify/cors";
import ws from "@/ws";
import postAudioMessage from "./router/fastify/audioMessage/post";
import getAudioMessage from "./router/fastify/audioMessage/get";
import postProfilePicture from "./router/fastify/profilePicture/post";
import getProfilePicture from "./router/fastify/profilePicture/get";
import cron from "node-cron"

dotenv.config();

const appRouter = router({
  user: userRouter,
  channel: channelRouter,
});

// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;

const server = fastify({
  maxParamLength: 5000,
  logger: true,
});

server.register(fastifyTRPCPlugin, {
  prefix: "/trpc/",
  trpcOptions: {
    router: appRouter,
    createContext,
  },
});

server.register(cors, {
  origin: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["Content-Type", "Authorization"],
  strictPreflight: false,
  // credentials: true,
  maxAge: 86400,
})

server.register(require("@fastify/multipart"))

server.register(fastifyWebsocket, {
  options: {
    maxPayload: 1048576,
  },
});

server.register(ws);

// post audio message
server.register(postAudioMessage);

// get audio message
server.register(getAudioMessage);

// post profile picture
server.register(postProfilePicture);

// get profile picture
server.register(getProfilePicture);

;(async () => {
  try {
    await server.listen({ port: 3000, host: "0.0.0.0" });
    console.log("Server started");
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }

  cron.schedule("1 * * * *", async () => {
    
  });
})();
