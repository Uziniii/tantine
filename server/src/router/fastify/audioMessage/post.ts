import { FastifyInstance } from "fastify";
import { decode } from "jsonwebtoken";
import { prisma } from "../../../db";
import { Payload } from "../../../jwt";
import { pipeline } from "stream";
import util from "util";
import fs from "fs";
import { ev } from "../../../ws";

const pump = util.promisify(pipeline);

export default async function (server: FastifyInstance) {
  server.post("/create/audioMessage/:channelId", async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).send({ error: "No token provided" });
    }

    const jwt = decode(token) as Payload;
    const channelId = (req.params as any).channelId;

    if (!jwt) {
      return res.status(401).send({ error: "Invalid token" });
    } else if (!channelId) {
      return res.status(400).send({ error: "No channel id provided" });
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

    const data = await (req as any).file();

    console.time("upload");
    const message = await prisma.$transaction(async (tx) => {
      const message = await tx.message.create({
        data: {
          authorId: jwt.id,
          channelId: channel.id,
          content: "",
        },
      });

      fs.mkdirSync(`./uploads/channels/${channel.id}/audios/`, {
        recursive: true,
      });
      await pump(
        data.file,
        fs.createWriteStream(
          `./uploads/channels/${channel.id}/audios/${message.id}.m4a`
        )
      );

      return tx.message.update({
        where: {
          id: message.id,
        },
        data: {
          audioFile: `${message.id}.m4a`,
        },
      });
    });
    console.timeEnd("upload");

    ev.emit("createMessage", message);

    res.send({ ok: true });
  });
}
