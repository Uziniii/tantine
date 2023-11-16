import { createContext, router } from "./trpc";
import { createHTTPServer } from "@trpc/server/adapters/standalone";
import cors from "cors"
import dotenv from "dotenv"
import { userRouter } from "./router/user";
import { channelRouter } from "./router/channel";
import { EventEmitter, WebSocketServer } from "ws";
import { prisma } from "./db";
import { decode } from "jsonwebtoken";
import { Payload, verifyJwtToken } from "./jwt";
import { createMessageEvent } from "./events/message";
import {
  IMapUser,
  addMemberSchema,
  changeVisibilitySchema,
  deleteGroupSchema,
  memberJoinSchema,
  messageSchema,
  newGroupTitleSchema,
  removeMemberSchema,
} from "./events/schema";
import z from "zod";
import { sendFactory } from "./helpers/event";
import {
  addMembersEvent,
  changeVisibilityEvent,
  deleteGroupEvent,
  memberJoinEvent,
  newGroupTitleEvent,
  removeMemberEvent,
} from "./events/channel";

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

const users = new Map<string, IMapUser>();
const idToTokens = new Map<string, Set<string>>();

function heartbeat(this: { isAlive: boolean }) {
  this.isAlive = true;
}
const wss = new WebSocketServer({
  server: server.server,
});

wss.on("connection", async (ws) => {
  console.log(`➕ Connection (${wss.clients.size})`);

  (ws as any).isAlive = true;

  ws.on("message", async (message) => {
    if (message.toString() === "ping") {
      ws.send(JSON.stringify({ event: "pong" }));
      heartbeat.bind(ws as any)();
      return;
    }

    let parse = z
      .object({
        event: z.literal("init"),
        payload: z.string(),
      })
      .safeParse(JSON.parse(message.toString()));

    if (!parse.success) return;

    const event = parse.data;
    const token = event.payload;

    if (!token) {
      ws.send(JSON.stringify({ error: "No token provided" }));
      ws.terminate();
      return;
    }

    const jwt = decode(token) as Payload;

    if (!jwt) {
      ws.send(JSON.stringify({ error: "Invalid token" }));
      ws.terminate();
      return;
    }

    const user = await prisma.user.findUnique({
      where: {
        id: jwt.id,
      },
      select: {
        id: true,
        email: true,
        name: true,
        surname: true,
        hashedPassword: true,
      },
    });

    if (!user) {
      ws.send(JSON.stringify({ error: "Invalid token" }));
      ws.terminate();
      return;
    }

    if (!verifyJwtToken(token, user.hashedPassword)) {
      ws.send(JSON.stringify({ error: "Invalid token" }));
      ws.terminate();
      return;
    }

    const tokens = idToTokens.get(user.id.toString());

    if (!tokens) {
      idToTokens.set(user.id.toString(), new Set([token]));
    } else {
      idToTokens.set(user.id.toString(), tokens.add(token));
    }

    ws.once("close", (e, a) => {
      console.log(e, a.toString());
      
      users.delete(token);

      const tokens = idToTokens.get(user.id.toString());

      if (!tokens) return;

      tokens.delete(token);

      if (tokens.size === 0) {
        return idToTokens.delete(user.id.toString());
      }

      idToTokens.set(user.id.toString(), tokens);
    });

    users.set(token, {
      id: user.id,
      ws,
    });
  });

  ws.once("close", () => {
    console.log(`➖ Connection (${wss.clients.size})`);
  });
});

const interval = setInterval(function ping() {
  wss.clients.forEach(function each(ws) {
    if ((ws as any).isAlive === false) {
      console.log("❌ Terminating");

      return ws.terminate();
    }

    (ws as any).isAlive = false;
    ws.ping();
  });
}, 30000);

wss.on("close", function close() {
  clearInterval(interval);
});

console.log("✅ WebSocket Server listening on ws://localhost:3000");

process.on("SIGTERM", () => {
  console.log("SIGTERM");
  wss.close();
});

const sendToIds = sendFactory(idToTokens, users);

export const ev = new EventEmitter();

ev.on("createMessage", (message: z.infer<typeof messageSchema>) =>
  createMessageEvent({
    payload: message,
    users,
    idToTokens,
    sendToIds,
  })
);

ev.on("newGroupTitle", (payload: z.infer<typeof newGroupTitleSchema>) =>
  newGroupTitleEvent({
    payload,
    users,
    idToTokens,
    sendToIds,
  })
);

ev.on("removeMember", (payload: z.infer<typeof removeMemberSchema>) =>
  removeMemberEvent({
    payload,
    users,
    idToTokens,
    sendToIds,
  })
);

ev.on("addMembers", (payload: z.infer<typeof addMemberSchema>) =>
  addMembersEvent({
    payload,
    users,
    idToTokens,
    sendToIds,
  })
);

ev.on("deleteGroup", (payload: z.infer<typeof deleteGroupSchema>) => {
  deleteGroupEvent({
    payload,
    users,
    idToTokens,
    sendToIds,
  });
});

ev.on("changeVisibility", (payload: z.infer<typeof changeVisibilitySchema>) => {
  changeVisibilityEvent({
    payload,
    users,
    idToTokens,
    sendToIds,
  });
});

ev.on("memberJoin", (payload: z.infer<typeof memberJoinSchema>) => {
  memberJoinEvent({
    payload,
    users,
    idToTokens,
    sendToIds,
  })
})

server.listen(3000);
console.log("Server started");
