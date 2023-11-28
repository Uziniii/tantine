import { prisma } from "@/db";
import { Payload } from "@/jwt";
import { FastifyInstance } from "fastify";
import { decode } from "jsonwebtoken";
import { pipeline } from "stream";
import util from "util";
import fs from "fs";
import { ev } from "@/ws";

const pump = util.promisify(pipeline);

export default async function (fastify: FastifyInstance) {
  fastify.post("/profilePicture/:channelId", async (req, res) => {
    const channelId = (req.params as any).channelId;
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).send({ error: "No token provided" });
    }

    const jwt = decode(token) as Payload;

    if (!jwt) {
      return res.status(401).send({ error: "Invalid token" });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: jwt.id,
      },
      select: {
        id: true,
        admin: true,
      },
    });

    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }

    if (channelId) {
      let authorized = false;

      const channel = await prisma.channel.findUnique({
        where: {
          id: +channelId,
        },
        select: {
          id: true,
          group: {
            select: {
              authorId: true,
              Admin: {
                where: {
                  id: user.id,
                },
                select: {
                  id: true,
                },
              },
            },
          },
        },
      });

      if (!channel?.group) {
        return res.status(404).send({ error: "Channel not found" });
      }

      if (user.admin) {
        authorized = true;
      } else if (!authorized && channel.group.authorId === user.id) {
        authorized = true;
      } else if (
        !authorized &&
        channel.group.Admin.some((admin) => admin.id === user.id)
      ) {
        authorized = true;
      } else {
        return res.status(403).send({ error: "Forbidden" });
      }

      const data = await (req as any).file();

      fs.rmdirSync(`./uploads/channels/${channel.id}/profilePicture/`, {
        recursive: true,
      });
      fs.mkdirSync(`./uploads/channels/${channel.id}/profilePicture/`, {
        recursive: true,
      });
      await pump(
        data.file,
        fs.createWriteStream(
          `./uploads/channels/${
            channel.id
          }/profilePicture/picture.${data.filename.split(".").at(-1)}`
        )
      );

      await prisma.channel.update({
        where: {
          id: channel.id,
        },
        data: {
          group: {
            update: {
              profilePicture: `picture.${data.filename.split(".").at(-1)}`,
            },
          },
        },
      });

      ev.emit("newGroupPicture", {
        channelId: channel.id,
        profilePicture: `picture.${data.filename.split(".").at(-1)}`,
      });

      return res.send({ ok: true });
    }

    const data = await (req as any).file();

    fs.rmdirSync(`./uploads/users/${user.id}/profilePicture/`, {
      recursive: true,
    });
    fs.mkdirSync(`./uploads/users/${user.id}/profilePicture/`, {
      recursive: true,
    });
    await pump(
      data.file,
      fs.createWriteStream(
        `./uploads/users/${user.id}/profilePicture/picture.${data.filename
          .split(".")
          .at(-1)}`
      )
    );

    ev.emit("newProfilePicture", {
      userId: user.id,
      profilePicture: `picture.${data.filename.split(".").at(-1)}`,
    });

    return res.send({ ok: true });
  });
}
