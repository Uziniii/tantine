import { TRPCError } from "@trpc/server";
import { groupIsPrivate, groupIsPublic, protectedProcedure, router, userIsAuthorOrSuperAdmin, userIsInChannel } from "../../trpc";
import z from "zod";
import { ev } from "../../.";
import { randomInt } from "crypto"

export const groupRouter = router({
  editTitle: userIsAuthorOrSuperAdmin
    .input(z.object({
      title: z.string().trim().min(2).max(50)
    }))
    .mutation(async ({ ctx, input }) => {
      const group = await ctx.prisma.channel.findUnique({
        where: {
          id: +input.channelId
        },
        select: {
          group: {
            select: {
              id: true
            }
          }
        }
      })

      if (!group) throw new TRPCError({ code: "NOT_FOUND" });
      
      const { title } = await ctx.prisma.groupChannel.update({
        where: {
          id: group.group?.id
        },
        data: {
          title: input.title
        }
      })

      ev.emit("newGroupTitle", {
        title,
        channelId: input.channelId
      })

      return undefined
    }),

  removeMember: userIsAuthorOrSuperAdmin
    .input(z.object({
      channelId: z.number(),
      memberId: z.number()
    }))
    .mutation(async ({ ctx, input }) => {
      const group = await ctx.prisma.channel.findUnique({
        where: {
          id: input.channelId
        },
        select: {
          id: true,
          group: {
            select: {
              id: true,
              authorId: true
            }
          }
        }
      })

      if (!group?.group) throw new TRPCError({ code: "NOT_FOUND" });
      if (group.group.authorId === input.memberId) throw new TRPCError({ code: "BAD_REQUEST" });

      await ctx.prisma.channel.update({
        where: {
          id: group.id
        },
        data: {
          users: {
            disconnect: {
              id: input.memberId
            }
          }
        }
      })

      ev.emit("removeMember", {
        channelId: input.channelId,
        memberId: input.memberId
      })

      return true
    }),

  addMembers: userIsAuthorOrSuperAdmin
    .input(z.object({
      channelId: z.number(),
      membersIds: z.array(z.number())
    }))
    .mutation(async ({ ctx, input }) => {
      const group = await ctx.prisma.channel.findUnique({
        where: {
          id: input.channelId,
        },
        select: {
          id: true,
          group: {
            select: {
              id: true,
              authorId: true,
            },
          },
        },
      });

      if (!group?.group) throw new TRPCError({ code: "NOT_FOUND" });

      await ctx.prisma.channel.update({
        where: {
          id: group.id,
        },
        data: {
          users: {
            connect: input.membersIds.map((id) => ({ id })),
          },
        },
      });

      ev.emit("addMembers", {
        channelId: input.channelId,
        membersIds: input.membersIds
      })

      return undefined
    }),
  
  delete: userIsAuthorOrSuperAdmin
    .mutation(async ({ ctx, input }) => {
      const group = await ctx.prisma.channel.findUnique({
        where: {
          id: +input.channelId
        },
        select: {
          id: true,
          group: {
            select: {
              id: true
            }
          },
          users: {
            select: {
              id: true
            }
          }
        }
      })

      if (!group?.group) throw new TRPCError({ code: "NOT_FOUND" });

      await ctx.prisma.groupChannel.delete({
        where: {
          id: group.group.id
        }
      })

      ev.emit("deleteGroup", {
        channelId: input.channelId,
        users: group.users.map(({ id }) => id)
      })

      return undefined
    }),

  search: protectedProcedure
    .input(z.object({
      query: z.string().trim().min(2).max(50)
    }))
    .output(z.array(z.object({
      id: z.number(),
      title: z.string().optional(),
      users: z.array(z.number())
    })))
    .query(async ({ ctx, input }) => {
      const groups = await ctx.prisma.channel.findMany({
        where: {
          group: {
            title: {
              contains: input.query
            },
            visibility: 0
          }
        },
        select: {
          id: true,
          users: {
            select: {
              id: true
            }
          },
          group: true
        }
      })

      console.log(groups)

      return groups.filter(channel => channel.group !== null).map(({ id, group, users }) => ({
        id,
        title: group?.title,
        users: users.map(({ id }) => id)
      }))
    }),

  changeVisibility: userIsAuthorOrSuperAdmin
    .input(z.object({
      channelId: z.number(),
      visibility: z.number()
    }))
    .mutation(async ({ ctx, input }) => {
      const channel = await ctx.prisma.channel.findUnique({
        where: {
          id: input.channelId
        },
        select: {
          id: true,
          group: {
            select: {
              visibility: true,
            }
          }
        }
      })

      if (!channel || channel?.group === null) throw new TRPCError({ code: "NOT_FOUND" });
      if (channel.group.visibility === input.visibility) return undefined;

      await ctx.prisma.channel.update({
        where: {
          id: channel.id
        },
        data: {
          group: {
            update: {
              visibility: input.visibility
            }
          }
        }
      })

      ev.emit("changeVisibility", {
        channelId: input.channelId,
        visibility: input.visibility
      })

      return undefined
    }),

  join: groupIsPublic
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.channel.update({
        where: {
          id: input.channelId
        },
        data: {
          users: {
            connect: {
              id: ctx.user.id
            }
          }
        }
      })

      ev.emit("memberJoin", {
        channelId: input.channelId,
        userId: ctx.user.id,
      })
    }),
  
  createJoinRequest: groupIsPrivate
    .mutation(async ({ ctx, input }) => {
      const joinRequest = await ctx.prisma.joinRequest.create({
        data: {
          userId: ctx.user.id,
          groupId: input.channelId,
        },
      })

      ev.emit("")
    }),

  turnTheWheel: userIsAuthorOrSuperAdmin
    .mutation(async ({ ctx, input }) => {
      const group = await ctx.prisma.channel.findUnique({
        where: {
          id: +input.channelId
        },
        select: {
          id: true,
          users: {
            select: {
              id: true
            }
          }
        }
      })

      if (!group) throw new TRPCError({ code: "NOT_FOUND" });

      const users = group.users.map(({ id }) => id);
      const winnerId = users[randomInt(0, users.length - 1)];

      return winnerId;
    }),

  quit: userIsInChannel
    .mutation(async ({ ctx, input }) => {
      const channel = await ctx.prisma.channel.findUnique({
        where: {
          id: +input.channelId
        },
        select: {
          id: true,
          group: {
            select: {
              id: true,
              authorId: true,
            }
          }
        }
      })

      if (!channel?.group) throw new TRPCError({ code: "NOT_FOUND" });
      if (channel.group.authorId === ctx.user.id) throw new TRPCError({ code: "BAD_REQUEST" });

      await ctx.prisma.channel.update({
        where: {
          id: channel.id
        },
        data: {
          users: {
            disconnect: {
              id: ctx.user.id
            }
          }
        }
      })

      ev.emit("removeMember", {
        channelId: input.channelId,
        memberId: ctx.user.id,
      });
    }),
  
  getInfo: protectedProcedure
    .input(z.number())
    .query(async ({ ctx, input }) => {
      const group = await ctx.prisma.channel.findUnique({
        where: {
          id: input
        },
        select: {
          id: true,
          group: {
            select: {
              title: true,
              visibility: true,
            }
          },
        }
      })

      if (!group?.group) throw new TRPCError({ code: "NOT_FOUND" });

      return {
        id: group.id,
        title: group.group.title,
        visibility: group.group.visibility,
      }
    })
})
