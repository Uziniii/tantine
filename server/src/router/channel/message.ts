import { messageSchema } from '../../events/schema';
import { z } from "zod";
import { router, userIsInChannel } from "../../trpc";
import { ev } from "../../.";
import { TRPCError } from '@trpc/server';

export const messageRouter = router({
  create: userIsInChannel
    .input(
      z.object({
        content: z.string().trim().min(1).max(2000),
        channelId: z.number().or(z.string()),
        nonce: z.number(),
        invite: z.undefined()
      }).or(z.object({
        content: z.string().trim().max(2000),
        channelId: z.number().or(z.string()),
        nonce: z.number(),
        invite: z.number()
      }))
    )
    .mutation(async ({ ctx, input }) => {
      if (input.invite) {
        if (input.invite === input.channelId) {
          throw new TRPCError({ code: "BAD_REQUEST" });
        }

        const channel = await ctx.prisma.channel.findUnique({
          where: {
            id: +input.invite,
          },
          select: {
            group: {
              select: {
                authorId: true,
                Admin: {
                  where: {
                    id: ctx.user.id,
                  },
                  select: {
                    id: true,
                  }
                }
              },
            },
          },
        });

        if (!channel || !channel.group) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }
        
        if (channel.group.authorId !== ctx.user.id) {
          if (!channel.group.Admin.find((user) => user.id === ctx.user.id)) {
            throw new TRPCError({ code: "UNAUTHORIZED" });
          }
        }
      }

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
          invite: input.invite
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
        invite: input.invite,
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
          invite: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      });

      return messages.reverse();
    }),
});
