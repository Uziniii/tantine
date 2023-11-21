import { ev } from "../../../../..";
import { groupIsPublic } from "../../../../../trpc";

export const join = groupIsPublic
  .mutation(async ({ ctx, input }) => {
    await ctx.prisma.channel.update({
      where: {
        id: input.channelId,
      },
      data: {
        users: {
          connect: {
            id: ctx.user.id,
          },
        },
      },
    });

    ev.emit("memberJoin", {
      channelId: input.channelId,
      userId: ctx.user.id,
    });
  });
