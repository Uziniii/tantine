import { TRPCError } from "@trpc/server";
import { router, userIsAuthorOrAdmin } from "../../trpc";
import z from "zod";
import { ev } from "../../ws";

export const groupRouter = router({
  editTitle: userIsAuthorOrAdmin
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

  removeMember: userIsAuthorOrAdmin
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
    })
})
