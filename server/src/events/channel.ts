import { prisma } from "../db";
import { ev } from "../ws";
import { Args, newGroupTitleSchema, removeMemberSchema } from "./schema";
import z from "zod"

export const newGroupTitleEvent = async ({
  payload,
  sendToIds,
}: Args<z.infer<typeof newGroupTitleSchema>>) => {
  const message = await prisma.message.create({
    data: {
      content: `Le nom du groupe a été modifié en ${payload.title}`,
      channel: {
        connect: {
          id: payload.channelId,
        },
      },
      system: true,
    },
  });

  const channel = await prisma.channel.findUnique({
    where: {
      id: +payload.channelId,
    },
    select: {
      users: {
        select: {
          id: true,
        },
      },
    },
  });

  ev.emit("createMessage", {
    channelId: payload.channelId,
    authorId: null,
    content: message.content,
    id: message.id,
    system: message.system,
    createdAt: message.createdAt,
    updatedAt: message.updatedAt,
  })

  if (!channel) return;

  sendToIds(channel.users.map(({ id }) => id), "editGroupTitle", payload);
};

export const removeMemberEvent = async ({
  payload,
  sendToIds,
}: Args<z.infer<typeof removeMemberSchema>>) => {
  const channel = await prisma.channel.findUnique({
    where: {
      id: +payload.channelId,
    },
    select: {
      users: {
        select: {
          id: true
        }
      },
    },
  });

  if (!channel) return;

  sendToIds(channel.users.map(({ id }) => id), "removeMember", payload);
}
