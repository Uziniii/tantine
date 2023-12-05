import { userIsInChannel } from "@/trpc";
import { z } from "zod";

export const retrieveMessages = userIsInChannel
  .input(z.object({
    channelId: z.number(),
    beforeId: z.number().optional(),
  }))
  .mutation(
    async ({ ctx, input }) => {
      const messages = await ctx.prisma.message.findMany({
        where: {
          channelId: +input.channelId,
          id: {
            lt: input.beforeId,
          },
        },
        select: {
          id: true,
          content: true,
          createdAt: true,
          updatedAt: true,
          authorId: true,
          system: true,
          invite: true,
          audioFile: true,
          carousel: {
            select: {
              users: {
                select: {
                  id: true
                }
              },
              winnerId: true
            }
          }
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 50,
      });

      return messages;
    }
  );
