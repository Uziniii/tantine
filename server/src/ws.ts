import { FastifyInstance } from "fastify";
import { z } from "zod";
import { Payload, verifyJwtToken } from "./jwt";
import { decode } from "jsonwebtoken";
import { prisma } from "./db";
import { IMapUser, acceptJoinRequestSchema, addMemberSchema, changeVisibilitySchema, deleteGroupSchema, memberJoinSchema, messageSchema, newGroupDayTurnSchema, newGroupPictureSchema, newGroupTitleSchema, removeMemberSchema, sendJoinRequestSchema } from "./events/schema";
import { EventEmitter } from "ws";
import { sendFactory } from "./helpers/event";
import { createMessageEvent } from "./events/message";
import { acceptJoinRequestEvent, addMembersEvent, changeVisibilityEvent, deleteGroupEvent, memberJoinEvent, newGroupDayTurnEvent, newGroupPictureEvent, newGroupTitleEvent, putAdminEvent, removeMemberEvent, sendJoinRequestEvent } from "./events/channel";

function heartbeat(this: { isAlive: boolean }) {
  this.isAlive = true;
}

const users = new Map<string, IMapUser>();
const idToTokens = new Map<string, Set<string>>();

export default async function (fastify: FastifyInstance) {
  fastify.get("/ws", { websocket: true }, async (connection, req) => {
    connection.socket.on("message", async (message) => {
      (connection.socket as any).isAlive = true;

      if (message.toString() === "ping") {
        connection.socket.send(JSON.stringify({ event: "pong" }));
        heartbeat.bind(connection.socket as any)();
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
        connection.socket.send(JSON.stringify({ error: "No token provided" }));
        connection.socket.terminate();
        return;
      }

      const jwt = decode(token) as Payload;

      if (!jwt) {
        connection.socket.send(JSON.stringify({ error: "Invalid token" }));
        connection.socket.terminate();
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
        connection.socket.send(JSON.stringify({ error: "Invalid token" }));
        connection.socket.terminate();
        return;
      }

      if (!verifyJwtToken(token, user.hashedPassword)) {
        connection.socket.send(JSON.stringify({ error: "Invalid token" }));
        connection.socket.terminate();
        return;
      }

      const tokens = idToTokens.get(user.id.toString());

      if (!tokens) {
        idToTokens.set(user.id.toString(), new Set([token]));
      } else {
        idToTokens.set(user.id.toString(), tokens.add(token));
      }

      connection.socket.once("close", (e, a) => {
        console.log(e, a.toString());

        users.delete(token);

        const tokens = idToTokens.get(user.id.toString());

        if (!tokens) return;

        tokens.delete(token);

        if (tokens.size === 0) {
          return idToTokens.delete(user.id.toString());
        }

        idToTokens.set(user.id.toString(), tokens);
        console.log(`➖ Connection (${users.size})`);
      });

      users.set(token, {
        id: user.id,
        ws: connection.socket,
      });

      console.log(`➕ Connection (${users.size})`);
    });
  });
}

const sendToIds = sendFactory(idToTokens, users);

export const ev = new EventEmitter();

ev.on("createMessage", (message: z.infer<typeof messageSchema>) => {
  createMessageEvent({
    payload: message,
    users,
    idToTokens,
    sendToIds,
  })
});

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
  });
});

ev.on("putAdmin", (payload: z.infer<typeof memberJoinSchema>) => {
  putAdminEvent({
    payload,
    users,
    idToTokens,
    sendToIds,
  });
});

ev.on("newGroupPicture", (payload: z.infer<typeof newGroupPictureSchema >) => {
  newGroupPictureEvent({
    payload,
    users,
    idToTokens,
    sendToIds,
  });
});

ev.on("createCommunityMessage", (payload: z.infer<typeof messageSchema>) => {
  createMessageEvent({
    payload,
    users,
    idToTokens,
    sendToIds,
  });
});

ev.on("createJoinRequest", (payload: z.infer<typeof sendJoinRequestSchema>) => {
  sendJoinRequestEvent({
    payload,
    users,
    idToTokens,
    sendToIds,
  })
});

ev.on("acceptJoinRequest", (payload: z.infer<typeof acceptJoinRequestSchema>) => {
  acceptJoinRequestEvent({
    payload,
    users,
    idToTokens,
    sendToIds,
  })
});

ev.on("newGroupDayTurn", (payload: z.infer<typeof newGroupDayTurnSchema>) => {
  newGroupDayTurnEvent({
    payload,
    users,
    idToTokens,
    sendToIds,
  })
});
