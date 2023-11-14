import { messageSchema } from '../../events/schema';
import { z } from "zod";
import { router, userIsInChannel } from "../../trpc";
import { ev } from "../../.";
import { TRPCError } from '@trpc/server';

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

      if (!message.authorId) throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Message authorId is null"
      });

      ev.emit("createMessage", {
        id: message.id,
        content: message.content,
        authorId: message.authorId,
        channelId: message.channelId,
        nonce: input.nonce,
        createdAt: message.createdAt,
        updatedAt: message.updatedAt,
        system: false,
      } satisfies z.infer<typeof messageSchema>);

      return message;
    }),

  retrieveMessages: userIsInChannel
    .mutation(async ({ ctx, input }) => {
      const messages = await ctx.prisma.message.findMany({
        where: {
          channelId: +input.channelId,
        },
        select: {
          id: true,
          content: true,
          createdAt: true,
          updatedAt: true,
          authorId: true,
          system: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      });

      return messages.reverse();
    }),
});
