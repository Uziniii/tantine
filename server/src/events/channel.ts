import { prisma } from "../db";
import { ev } from "../ws";
import { Args, newGroupTitleSchema } from "./schema";
import z from "zod"

export const newGroupTitleEvent = async ({
  payload,
  idToTokens,
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

  ev.emit("createMessage", {
    payload: {
      
    }
  })

  sendToIds(Array.from(idToTokens.keys()), "editGroupTitle", payload);
};
