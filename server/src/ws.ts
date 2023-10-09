import { Server } from "ws"
import { prisma } from "./db";
import { decode } from "jsonwebtoken";
import { Payload, verifyJwtToken } from "./jwt";
import { messageEvent } from "./events/message";
import { IMapUser, allEventsSchema } from "./events/schema";

const users = new Map<string, IMapUser>()
const tokenToIds = new Map<string, string[]>()

const wss = new Server({
  port: 3001,
});

wss.on("connection", async (ws) => {
  console.log(`➕➕ Connection (${wss.clients.size})`);
  
  const url = new URL(ws.url)
  const token = url.searchParams.get("token")

  if (!token) {
    ws.send(JSON.stringify({ error: "No token provided" }))
    ws.terminate()
    return
  }

  const jwt = decode(token) as Payload;

  if (!jwt) {
    ws.send(JSON.stringify({ error: "Invalid token" }))
    ws.terminate()
    return
  }

  const user = await prisma.user.findUnique({
    where: {
      id: jwt.id
    }
  })
  
  if (!user) {
    ws.send(JSON.stringify({ error: "Invalid token" }))
    ws.terminate()
    return
  }

  if (!verifyJwtToken(token, user.hashedPassword)) {
    ws.send(JSON.stringify({ error: "Invalid token" }))
    ws.terminate()
    return
  }

  const tokens = tokenToIds.get(token)

  if (!tokens) {
    tokenToIds.set(token, [user.id.toString()])
  } else {
    tokenToIds.set(token, tokens.push(user.id.toString()))
  }

  users.set(user.id.toString(), {
    id: user.id,
    ws
  })

  ws.on("message", (message) => {
    const event = allEventsSchema.parse(JSON.parse(message.toString()))

    switch (event.type) {
      case "message":
        messageEvent({ event, users, user, ws })
        break
      default:
        break
    }
  })

  ws.once("close", () => {
    console.log(`➖➖ Connection (${wss.clients.size})`);
  });
});
console.log("✅ WebSocket Server listening on ws://localhost:3001");

process.on("SIGTERM", () => {
  console.log("SIGTERM");
  wss.close();
});

prisma.$on("query", (query) => {
  console.log(query);
  
})
