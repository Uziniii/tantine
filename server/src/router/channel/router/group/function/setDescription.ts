import { userIsAuthorOrSuperAdminOrAdmin } from "@/trpc";
import { ev } from "@/ws";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const setDescription = userIsAuthorOrSuperAdminOrAdmin
  .input(
    z.object({
      channelId: z.number().or(z.string()),
      description: z.string().trim().max(500),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const channel = await ctx.prisma.channel.findUnique({
      where: {
        id: +input.channelId,
      },
      select: {
        group: {
          select: {
            id: true,
            authorId: true,
          },
        },
      },
    });

    if (!channel || !channel.group) {
      throw new TRPCError({ code: "NOT_FOUND" });
    }

    const group = await ctx.prisma.groupChannel.update({
      where: {
        id: channel.group.id,
      },
      data: {
        description: input.description,
      },
    });

    ev.emit("")
  })
