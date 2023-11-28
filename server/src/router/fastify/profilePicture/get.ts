import fs from 'fs';
import { FastifyInstance } from "fastify";
import { prisma } from '@/db';

export default async function (fastify: FastifyInstance) {
  fastify.get("/profilePicture/:channelOrUser/:id", async (req, res) => {
    const id = (req.params as any).id;
    const channelOrUser = (req.params as any).channelOrUser;

    if (!id) {
      return res.status(400).send({ error: "No id provided" });
    }

    if (!channelOrUser) {
      return res.status(400).send({ error: "No channel or user provided" });
    }

    if (channelOrUser === "channel") {
      const channel = await prisma.channel.findUnique({
        where: {
          id: +id,
        },
        select: {
          id: true,
          group: {
            select: {
              profilePicture: true,
            },
          },
        },
      });

      if (!channel?.group) {
        return res.status(404).send({ error: "Channel not found" });
      } else if (!channel.group.profilePicture) {
        return res.status(404).send({ error: "Profile picture not found" });
      }

      res.header(
        "Content-Type",
        `image/${channel.group.profilePicture.split(".").at(-1)}`
      );
      return res.send(
        fs.createReadStream(
          `./uploads/channels/${channel.id}/profilePicture/${channel.group?.profilePicture}`
        )
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        id: +id,
      },
      select: {
        id: true,
        profilePicture: true,
      },
    });

    if (!user) {
      return res.status(404).send({ error: "User not found" });
    } else if (!user.profilePicture) {
      return res.status(404).send({ error: "Profile picture not found" });
    }

    res.header(
      "Content-Type",
      `image/${user.profilePicture.split(".").at(-1)}`
    );
    return res.send(
      fs.createReadStream(
        `./uploads/users/${user.id}/profilePicture/${user.profilePicture}`
      )
    );
  });
}
