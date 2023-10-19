import { messageSchemaEvent } from './../../events/schema';
import { z } from "zod";
import { router, userIsInChannel } from "../../trpc";
import { ev } from "../../ws";

interface Message {
  channelId: number | null;
  content: string;
  id: number;
  createdAt: Date;
  updatedAt: Date;
  authorId: number;
}

export const messageRouter = router({
  create: userIsInChannel
    .input(
      z.object({
        content: z.string(),
        channelId: z.number().or(z.string()),
        nonce: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const message = await ctx.prisma.message.create({
        data: {
          content: input.content,
          author: {
            connect: {
              id: ctx.user.id,
            },
          },
          channel: {
            connect: {
              id: +input.channelId,
            },
          },
        },
        select: {
          id: true,
          content: true,
          createdAt: true,
          updatedAt: true,
          authorId: true,
          channelId: true,
        },
      });

      ev.emit("createMessage", {
        id: message.id,
        content: message.content,
        authorId: message.authorId,
        channelId: message.channelId,
        nonce: input.nonce,
        createdAt: message.createdAt,
        updatedAt: message.updatedAt,
      } satisfies z.infer<typeof messageSchemaEvent>);

      return message;
    }),

  retrieveMessages: userIsInChannel
    .input(
      z.object({
        channelId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const messages = await ctx.prisma.message.findMany({
        where: {
          channelId: input.channelId,
        },
        select: {
          id: true,
          content: true,
          createdAt: true,
          updatedAt: true,
          authorId: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      });

      return messages.reverse();
    }),
});
