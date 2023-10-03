import { protectedProcedure, router } from "../trpc";
import z from "zod";

const createChannelInput = z.number()
  .or(
    z.array(z.number())
  )

function isPrivateOrGroup(input: z.infer<typeof createChannelInput>): input is number {
  return typeof input === "number" ? true : false;
}

const userSchema = z.object({
  id: z.number(),
  name: z.string(),
  surname: z.string(),
  email: z.string(),
});

const createChannelOutput = z.object({
  type: z.literal("private"),
  id: z.number(),
  users: z.array(userSchema),
}).or(z.object({
  type: z.literal("group"),
  id: z.number(),
  users: z.array(userSchema)
}))

export const channelRouter = router({
  create: protectedProcedure
    .input(createChannelInput)
    .output(createChannelOutput)
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
            users: {
              select: {
                id: true,
                name: true,
                surname: true,
                email: true,
              }
            },
            private: true,
          }
        });

        return {
          type: "private",
          id: channel.id,
          users: channel.users,
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
          group: {
            select: {
              title: true,
              description: true,
              authorId: true,
            }
          },
          users: {
            select: {
              id: true,
              name: true,
              surname: true,
              email: true,
            }
          },
          id: true,
        }
      });

      return {
        type: "group",
        id: channel.id,
        users: channel.users
      }
    }),
})
