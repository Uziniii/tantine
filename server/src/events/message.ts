import { prisma } from '../db';
import { Args, messageSchemaEvent } from './schema';
import z from "zod"

export const messageEvent = async ({
  event,
  users,
  user,
  ws
}: Args<z.infer<typeof messageSchemaEvent>>) => {
  const channel = await prisma.channel.findUnique({
    where: {
      id: +event.payload.channelId,
      users: {
        some: {
          id: user.id
        }
      }
    }
  })

  if (!channel) return


}
