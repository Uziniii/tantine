import fs from 'fs';
import { FastifyInstance } from "fastify";
import { decode } from "jsonwebtoken";
import { Payload } from "../../../jwt";
import { prisma } from "../../../db";

export default async function (fastify: FastifyInstance) {
  fastify.get("/audioMessage/:channelId/:messageId", async (req, res) => {
    const channelId = (req.params as any).channelId;
    const messageId = (req.params as any).messageId;

    if (!channelId) {
      return res.status(400).send({ error: "No channel id provided" });
    } else if (!messageId) {
      return res.status(400).send({ error: "No message id provided" });
    }

    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).send({ error: "No token provided" });
    }

    const jwt = decode(token) as Payload;

    if (!jwt) {
      return res.status(401).send({ error: "Invalid token" });
    }

    const channel = await prisma.channel.findUnique({
      where: {
        id: +channelId,
      },
      select: {
        id: true,
        users: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!channel) {
      return res.status(404).send({ error: "Channel not found" });
    } else if (!channel.users.some((user) => user.id === jwt.id)) {
      return res.status(403).send({ error: "Forbidden" });
    }

    res.header("Content-Type", "audio/m4a");
    return res.send(
      fs.createReadStream(
        `./uploads/channels/${channel.id}/audios/${messageId}`
      )
    );
  });
}
