import { protectedProcedure } from "@/trpc";
import { ev } from "@/ws";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const createCommunityMessage = protectedProcedure
  .input(
    z.object({
      content: z.string().trim().min(1).max(2000),
      channelId: z.number().or(z.string()),
      nonce: z.number(),
      invite: z.undefined(),
    })
    .or(
      z.object({
        content: z.string().trim().min(0).max(2000),
        channelId: z.number().or(z.string()),
        nonce: z.number(),
        invite: z.number(),
      })
    )
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
                },
              },
            },
          },
        },
      });

      if (!channel || !channel.group) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
    }

    const message = await ctx.prisma.communityMessage.create({
      data: {
        content: input.content,
        author: {
          connect: {
            id: ctx.user.id,
          },
        },
        invite: input.invite,
      },
      select: {
        id: true,
        content: true,
        createdAt: true,
        updatedAt: true,
        authorId: true,
        invite: true,
        audioFile: true,
      },
    });

    ev.emit("createCommunityMessage", {
      message,
      nonce: input.nonce,
    });

    return message;
  })
