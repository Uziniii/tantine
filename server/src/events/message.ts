import { prisma } from '../db';
import { Args, communityMessageSchema, messageSchema } from './schema';
import z from "zod"

export const createMessageEvent = async ({
  payload,
  sendToIds
}: Args<z.infer<typeof messageSchema>>) => {
  const channel = await prisma.channel.findUnique({
    where: {
      id: +payload.channelId,
      // users: {
      //   some: {
      //     id: payload.authorId,
      //   },
      // },
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

  if (!channel) return;
// console.log(channel.users.map((user) => user.id));

  sendToIds(
    channel.users.map((user) => user.id),
    "createMessage",
    payload
  )
};

export const createCommunityMessageEvent = async ({
  payload,
  idToTokens,
  sendToIds
}: Args<z.infer<typeof communityMessageSchema>>) => {
  sendToIds([...idToTokens.keys()], "createCommunityMessage", payload);
}
