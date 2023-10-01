import { protectedProcedure, router } from "../trpc";
import z from "zod";

export const channelRouter = router({
  create: protectedProcedure
    .input(
      z.number()
      .or(
        z.array(z.number())
      )
    )
    .mutation(async ({ ctx, input }) => {
      // create the channel depending on the input type number = private and array = group
      // channel id is the input

      const type = typeof input === "number" ? "private" : "group";

      const channel = await ctx.prisma.channel.create({
        data: {
          id: input,
          type,
        },
      });
    }),
})
