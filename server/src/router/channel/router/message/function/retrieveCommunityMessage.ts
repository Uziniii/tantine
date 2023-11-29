import { protectedProcedure } from "@/trpc";

export const retrieveCommunityMessage = protectedProcedure
  .mutation(async ({ ctx }) => {
    const message = await ctx.prisma.communityMessage.findMany({
      take: 50,
      orderBy: {
        createdAt: "desc",
      },
    });

    return message.reverse();
  })
