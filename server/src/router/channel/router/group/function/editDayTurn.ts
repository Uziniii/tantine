import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { userIsAuthorOrSuperAdminOrAdmin } from "@/trpc";
import { ev } from "@/ws";

export const editDayTurn = userIsAuthorOrSuperAdminOrAdmin
  .input(
    z.object({
      dayTurn: z
      .number()
      .int()
      .min(1, { message: 'Le nombre doit être supérieur ou égal à 1' })
      .max(31, { message: 'Le nombre doit être inférieur ou égal à 31' }),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const group = await ctx.prisma.channel.findUnique({
      where: {
        id: +input.channelId,
      },
      select: {
        group: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!group) throw new TRPCError({ code: "NOT_FOUND" });

    const { dayTurn } = await ctx.prisma.groupChannel.update({
      where: {
        id: group.group?.id,
      },
      data: {
        dayTurn: input.dayTurn,
      },
    });

    ev.emit("newGroupDayTurn", {
      dayTurn,
      channelId: input.channelId,
    });

    return undefined;
  });
