import { createContext, router } from "./trpc";
import { fastifyTRPCPlugin } from "@trpc/server/adapters/fastify";
import dotenv from "dotenv";
import { userRouter } from "./router/user/user";
import { channelRouter } from "./router/channel/channel";
import fastify from "fastify";
import fastifyWebsocket from "@fastify/websocket";
import cors from "@fastify/cors";
import ws, { ev } from "@/ws";
import postAudioMessage from "./router/fastify/audioMessage/post";
import getAudioMessage from "./router/fastify/audioMessage/get";
import postProfilePicture from "./router/fastify/profilePicture/post";
import getProfilePicture from "./router/fastify/profilePicture/get";
import cron from "node-cron"
import { prisma } from "./db";
import { randomInt } from "crypto";

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

  cron.schedule("* 6 * * *", async () => {
    console.log("Check wheel turn");
    
    const channels = await prisma.$queryRaw<{ id: number }[]>`
      SELECT
        ch.id
      FROM
        GroupChannel as gc
        LEFT JOIN Carousel as c ON c.groupId = gc.id
        RIGHT JOIN Channel as ch ON ch.groupId = gc.id
      WHERE
        c.createdAt IS NULL
        AND (
          (
            gc.updatedDayTurn is not null
            AND DAY(gc.updatedDayTurn) = DAY(NOW())
            AND (
              MONTH(gc.updatedDayTurn) = MONTH(NOW())
              AND YEAR(gc.updatedDayTurn) = YEAR(NOW())
            )
            AND gc.dayTurn <= DAY(c.createdAt)
            AND NOT (
              MONTH(c.createdAt) = MONTH(NOW())
              AND YEAR(c.createdAt) = YEAR(NOW())
            )
          )
          OR gc.dayTurn = DAY(NOW())
        )
      GROUP BY
        gc.id
      ORDER BY
        MAX(c.createdAt) asc;
    `;

    if (channels.length === 0) return;

    const usersByChannel = await prisma.channel.findMany({
      where: {
        id: {
          in: channels.map(channel => channel.id)
        }
      },
      select: {
        id: true,
        groupId: true,
        users: {
          select: {
            id: true,
          }
        }
      }
    });

    const winnersByChannel = usersByChannel
      .map((channel) => ({
        channelId: channel.id,
        groupId: channel.groupId,
        winnerId: channel.users[randomInt(0, channel.users.length)].id,
        users: channel.users.map((user) => user.id),
      }))
    
    for (const channel of winnersByChannel) {
      if (channel.groupId === null) continue;

      const carousel = await prisma.carousel.create({
        data: {
          winner: {
            connect: {
              id: channel.winnerId
            }
          },
          group: {
            connect: {
              id: channel.groupId
            }
          },
          message: {
            create: {
              content: "",
              system: true,
              channel: {
                connect: {
                  id: channel.channelId
                }
              }
            }
          }
        },
        select: {
          message: {
            select: {
              id: true,
              createdAt: true,
              updatedAt: true,
            }
          }
        }
      })

      ev.emit("createMessage", {
        id: carousel.message.id,
        system: true,
        content: "",
        createdAt: carousel.message.createdAt,
        updatedAt: carousel.message.updatedAt,
        channelId: channel.channelId,
      })
    }
  })
})();
