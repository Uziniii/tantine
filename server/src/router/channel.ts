import { protectedProcedure, router } from "../trpc";
import z from "zod";

const createChannelInput = z.number()
  .or(
    z.array(z.number())
  )

function isPrivateOrGroup(input: z.infer<typeof createChannelInput>): input is number {
  return typeof input === "number" ? true : false;
}

export const channelRouter = router({
  create: protectedProcedure
    .input(createChannelInput)
    .mutation(async ({ ctx, input }) => {
      if (isPrivateOrGroup(input)) {
        const channel = await ctx.prisma.channel.create({
          data: {
            users: {
              connect: [
                { id: ctx.user.id },
                { id: input }
              ]
            },
            private: {
              create: {}
            },
          },
          select: {
            id: true,
            users: true,
            private: true,
          }
        });

        return {
          
        }
      }
      
      const channel = await ctx.prisma.channel.create({
        data: {
          users: {
            connect: [
              { id: ctx.user.id },
              ...input.map((id) => ({ id }))
            ]
          },
          group: {
            create: {
              title: `Groupe de ${ctx.user.name}`,
              description: "",
              author: {
                connect: {
                  id: ctx.user.id
                }
              }
            }
          },
        },
        select: {
          group: true,
          users: true,
          id: true,
        }
      });

      return channel
    }),
})
