import { protectedProcedure } from "@/trpc";
import { z } from "zod";

export const retrieveCommunityMessage = protectedProcedure
  .input(z.number().optional())
  .mutation(async ({ ctx, input }) => {
    const message = await ctx.prisma.communityMessage.findMany({
      where: {
        id: {
          lt: input
        }
      },
      take: 50,
      orderBy: {
        createdAt: "desc",
      },
    });

    return message.reverse();
  })
