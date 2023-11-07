import { protectedProcedure, router, userIsInChannel } from "../trpc";
import z from "zod";
import { messageRouter } from "./channel/message";
import { TRPCError } from "@trpc/server";
import { groupRouter } from "./channel/group";

const createChannelInput = z.number()
  .or(
    z.array(z.number())
  )

function isPrivateOrGroup(input: z.infer<typeof createChannelInput>): input is number {
  return typeof input === "number" ? true : false;
}

const privateChannel = z.object({
  type: z.literal("private"),
  id: z.number(),
  users: z.array(z.number()),
});

const groupChannel = z.object({
  type: z.literal("group"),
  id: z.number(),
  users: z.array(z.number()),
  title: z.string(),
  description: z.string(),
  authorId: z.number(),
});

const createChannelOutput = privateChannel.or(groupChannel)

const diffChannels = z.union([
  privateChannel,
  groupChannel
])

const channelsList = z.array(diffChannels)

export const channelRouter = router({
  create: protectedProcedure
    .input(createChannelInput)
    .output(createChannelOutput)
    .mutation(async ({ ctx, input }) => {
      if (input === ctx.user.id)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You can't create a channel with yourself"
        });

      if (isPrivateOrGroup(input)) {
        let channel = await ctx.prisma.channel.findFirst({
          where: {
            users: {
              every: {
                id: {
                  in: [ctx.user.id, input],
                },
              },
            },
          },
          select: {
            id: true,
            private: true,
          },
        });

        if (channel)
          return {
            type: "private",
            id: channel.id,
            users: [ctx.user.id, input],
          };

        channel = await ctx.prisma.channel.create({
          data: {
            users: {
              connect: [{ id: ctx.user.id }, { id: input }],
            },
            private: {
              create: {},
            },
          },
          select: {
            id: true,
            private: true,
          },
        });

        return {
          type: "private",
          id: channel.id,
          users: [ctx.user.id, input],
        };
      }

      const channel = await ctx.prisma.channel.create({
        data: {
          users: {
            connect: [{ id: ctx.user.id }, ...input.map((id) => ({ id }))],
          },
          group: {
            create: {
              title: `Groupe de ${ctx.user.name}`,
              description: "",
              author: {
                connect: {
                  id: ctx.user.id,
                },
              },
            },
          },
        },
        select: {
          group: {
            select: {
              title: true,
              description: true,
              authorId: true,
            },
          },
          id: true,
        },
      });

      if (!channel.group) throw new Error("Group not created");

      await ctx.prisma.message.create({
        data: {
          content: `Le groupe ${channel.group.title} a été créé`,
          system: true,
          channelId: channel.id,
        },
      });

      return {
        type: "group",
        id: channel.id,
        users: [ctx.user.id, ...input],
        title: channel.group.title,
        description: channel.group.description,
        authorId: channel.group.authorId,
      };
    }),

  retrieveRecentChannel: protectedProcedure
    .output(channelsList)
    .query(async ({ ctx }) => {
      const channels = await ctx.prisma.channel.findMany({
        where: {
          users: {
            some: {
              id: ctx.user.id,
            },
          },
        },
        include: {
          messages: {
            select: {
              createdAt: true,
            },
            orderBy: {
              createdAt: "desc",
            },
            take: 1,
          },
          users: {
            select: {
              id: true,
            }
          },
          group: {
            select: {
              title: true,
              description: true,
              authorId: true,
            }
          },
          private: {
            select: {
              id: true,
            }
          }
        },
      });
      
      console.log(channels);
      

      if (!channels) return []

      return channels.map((channel) => {
        const { group, private: channelPrivate } = channel;

        if (group === null && channelPrivate === null)
          throw new TRPCError({
            message: "Channel not found",
            code: "BAD_REQUEST",
          });

        if (group === null) {
          return {
            type: "private",
            id: channel.id,
            users: channel.users.map((user) => user.id),
          };
        }

        return {
          type: "group",
          id: channel.id,
          users: channel.users.map((user) => user.id),
          title: group.title,
          description: group.description,
          authorId: group.authorId,
        };
      });
    }),

  retrieve: userIsInChannel
    .output(diffChannels)
    .mutation(async ({ ctx, input }) => {
      const channel = await ctx.prisma.channel.findFirst({
        where: {
          id: +input.channelId,
        },
        select: {
          id: true,
          private: true,
          group: {
            select: {
              title: true,
              description: true,
              authorId: true,
            },
          },
          users: {
            select: {
              id: true,
            },
          },
        },
      });

      if (channel === null)
        throw new TRPCError({
          message: "Channel not found",
          code: "BAD_REQUEST",
        });

      if (!channel.group) {
        return {
          type: "private",
          id: channel.id,
          users: channel.users.map((user) => user.id),
        };
      }

      return {
        type: "group",
        id: channel.id,
        users: channel.users.map((user) => user.id),
        title: channel.group.title,
        description: channel.group.description,
        authorId: channel.group.authorId,
      };
    }),

  message: messageRouter,
  group: groupRouter,
});
