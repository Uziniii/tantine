import { prisma } from '../db';
import { Args, messageSchemaEvent } from './schema';
import z from "zod"

export const messageEvent = async ({
  payload,
  users,
  idToTokens,
}: Args<z.infer<typeof messageSchemaEvent>>) => {
  const channel = await prisma.channel.findUnique({
    where: {
      id: +payload.channelId,
      users: {
        some: {
          id: payload.authorId,
        },
      },
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

  for (const user of channel.users) {
    const tokens = idToTokens.get(user.id.toString());

    if (!tokens) continue;

    for (const token of tokens) {
      users.get(token)?.ws.send(
        JSON.stringify({
          event: "createMessage",
          payload,
        }),
        (e) => console.error(e)
      );
    }
  }
};
