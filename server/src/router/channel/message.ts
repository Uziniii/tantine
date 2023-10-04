import { z } from "zod";
import { publicProcedure, router, userIsInChannel, wsUserIsInChannel } from "../../trpc";
import { observable } from "@trpc/server/observable";
import { EventEmitter } from "events";

interface Message {
  channelId: number | null;
  content: string;
  id: number;
  createdAt: Date;
  updatedAt: Date;
  authorId: number;
}

const ee = new EventEmitter();

export const messageRouter = router({
  onCreate: wsUserIsInChannel.subscription(() => {
    return observable<Message>((emit) => {
      const onCreate = (data: Message) => {
        emit.next(data);
      };

      ee.on("create", onCreate);

      return () => {
        ee.off("create", onCreate);
      };
    });
  }),

  create: userIsInChannel
    .input(
      z.object({
        content: z.string(),
        channelId: z.number().or(z.string()),
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

      ee.emit("create", message);

      return message;
    }),
});
