import { protectedProcedure, router, userIsInChannel } from "../trpc";
import z from "zod";
import { messageRouter } from "./channel/message";

const createChannelInput = z.number()
  .or(
    z.array(z.number())
  )

function isPrivateOrGroup(input: z.infer<typeof createChannelInput>): input is number {
  return typeof input === "number" ? true : false;
}

const createChannelOutput = z.object({
  type: z.literal("private"),
  id: z.number(),
  users: z.array(z.number()),
}).or(z.object({
  type: z.literal("group"),
  id: z.number(),
  users: z.array(z.number()),
  title: z.string(),
  description: z.string(),
  authorId: z.number(),
}))

export const channelRouter = router({
  create: protectedProcedure
    .input(createChannelInput)
    .output(createChannelOutput)
    .mutation(async ({ ctx, input }) => {
      if (input === ctx.user.id) throw new Error("You can't create a channel with yourself");
      
      if (isPrivateOrGroup(input)) {
        let channel = await ctx.prisma.channel.findFirst({
          where: {
            users: {
              every: {
                id: {
                  in: [ctx.user.id, input]
                }
              }
            }
          },
          select: {
            id: true,
            users: {
              select: {
                id: true
              }
            },
            private: true,
          }
        });

        if (channel) return {
          type: "private",
          id: channel.id,
          users: channel.users.map(user => user.id),
        };

        channel = await ctx.prisma.channel.create({
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
          users: channel.users.map(user => user.id),
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
            }
          },
          id: true,
        }
      });

      if (!channel.group) throw new Error("Group not created");

      return {
        type: "group",
        id: channel.id,
        users: channel.users.map(user => user.id),
        title: channel.group.title,
        description: channel.group.description,
        authorId: channel.group.authorId,
      }
    }),

  retrieveMessages: userIsInChannel
    .input(z.object({
      channelId: z.number(),
    }))
    .query(async ({ ctx, input }) => {
      const messages = await ctx.prisma.message.findMany({
        where: {
          channelId: input.channelId,
        },
        select: {
          id: true,
          content: true,
          createdAt: true,
          updatedAt: true,
          authorId: true,
          channelId: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      });

      return messages;
    }),
  
  message: messageRouter,
})
