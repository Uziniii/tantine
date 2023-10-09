import { EventEmitter, Server } from "ws"
import { prisma } from "./db";
import { decode } from "jsonwebtoken";
import { Payload, verifyJwtToken } from "./jwt";
import { messageEvent } from "./events/message";
import { IMapUser, messageSchemaEvent } from "./events/schema";
import z from "zod"

const users = new Map<string, IMapUser>()
const idToTokens = new Map<string, Set<string>>()

function heartbeat(this: { isAlive: boolean }) {
  this.isAlive = true;
}
const wss = new Server({
  port: 3001,
});

wss.on("connection", async (ws) => {
  console.log(`➕➕ Connection (${wss.clients.size})`);
  
  (ws as any).isAlive = true;

  ws.on("message", async (message) => {
    if (message.toString() === "ping") {
      heartbeat.bind(ws as any)()
      return
    }

    let parse = z.object({
      event: z.literal("init"),
      payload: z.string(),
    }).safeParse(JSON.parse(message.toString()))

    if (!parse.success) return

    const event = parse.data
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
      }
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

    users.set(token, {
      id: user.id,
      ws,
    });
  })

  ws.once("close", () => {
    console.log(`➖➖ Connection (${wss.clients.size})`);
  });
});

const interval = setInterval(function ping() {
  wss.clients.forEach(function each(ws) {
    if ((ws as any).isAlive === false) {
      return ws.terminate();
    }

    (ws as any).isAlive = false;
    ws.ping();
  });
}, 30000);

wss.on("close", function close() {
  clearInterval(interval);
});

console.log("✅ WebSocket Server listening on ws://localhost:3001");

process.on("SIGTERM", () => {
  console.log("SIGTERM");
  wss.close();
});

export const ev = new EventEmitter()

ev.on(
  "createMessage",
  (message: z.infer<typeof messageSchemaEvent>) => messageEvent({
    payload: message,
    users,
    idToTokens,
  })
);
