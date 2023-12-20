import { protectedProcedure } from "@/trpc";
import { ev } from "@/ws";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const sendJoinRequest = protectedProcedure
  .input(z.number())
  .mutation(async ({ ctx, input }) => {
    try {
      const joinRequest = await ctx.prisma.joinRequest.create({
        data: {
          group: {
            connect: {
              id: input,
            },
          },
          user: {
            connect: {
              id: ctx.user.id,
            },
          },
        },
      });

      ev.emit("createJoinRequest", joinRequest);

      return joinRequest;
    } catch (e) {
      throw new TRPCError({ code: "BAD_REQUEST" });
    }
  });
