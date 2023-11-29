import { userIsAuthorOrSuperAdminOrAdmin } from "@/trpc";
import { ev } from "@/ws";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const acceptJoinRequest = userIsAuthorOrSuperAdminOrAdmin
  .input(
    z.object({
      channelId: z.number(),
      joinRequest: z.number(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    try {
      const joinRequest = await ctx.prisma.$transaction(async (tx) => {
        const joinRequest = await tx.joinRequest.findUnique({
          where: {
            id: input.joinRequest,
          },
        });
    
        if (!joinRequest) throw new Error("Join request not found");
    
        await tx.channel.update({
          where: {
            id: input.channelId,
          },
          data: {
            users: {
              connect: {
                id: joinRequest.userId,
              },
            },
          },
        });
    
        await tx.joinRequest.delete({
          where: {
            id: input.joinRequest,
          },
        });

        return joinRequest
      })

      ev.emit("acceptJoinRequest", {
        channelId: input.channelId,
        joinRequest: joinRequest.id,
      })

      ev.emit("memberJoin", {
        channelId: input.channelId,
        userId: joinRequest.userId,
      });

      return undefined;
    } catch (error) {
      console.log(error);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }
  });
