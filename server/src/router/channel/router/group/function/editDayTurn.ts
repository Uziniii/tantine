import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { userIsAuthorOrSuperAdminOrAdmin } from "@/trpc";
import { ev } from "@/ws";

export const editDayTurn = userIsAuthorOrSuperAdminOrAdmin
  .input(
    z.object({
      dayTurn: z
      .number()
      .int()
      .min(1, { message: 'Le nombre doit être supérieur ou égal à 1' })
      .max(31, { message: 'Le nombre doit être inférieur ou égal à 31' }),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const dayTurn = await ctx.prisma.$transaction(async (tx) => {
      const channel = await tx.channel.findUnique({
        where: {
          id: +input.channelId,
        },
        select: {
          group: {
            select: {
              dayTurn: true,
              updatedDayTurn: true,
            }
          }
        }
      });

      if (!channel?.group) throw new TRPCError({ code: "NOT_FOUND" });

      const today = new Date(Date.now());

      if (channel.group.updatedDayTurn === null) {
        await tx.channel.update({
          where: {
            id: +input.channelId,
          },
          data: {
            group: {
              update: {
                dayTurn: input.dayTurn,
                updatedDayTurn: new Date(Date.now()),
              }
            }
          },
        });

        return input.dayTurn;
      }

      // if updatedDayTurn elapsed 1 month or more from now update dayTurn
      const updatedDayTurn = channel.group.updatedDayTurn;
      const diffMonth = today.getMonth() - updatedDayTurn.getMonth() + (12 * (today.getFullYear() - updatedDayTurn.getFullYear()));
      
      if (diffMonth >= 1) {
        await tx.channel.update({
          where: {
            id: +input.channelId,
          },
          data: {
            group: {
              update: {
                dayTurn: input.dayTurn,
                updatedDayTurn: new Date(Date.now()),
              }
            }
          },
        });

        return input.dayTurn;
      }

      return undefined;
    })

    if (dayTurn === undefined) throw new TRPCError({ code: "BAD_REQUEST" });

    ev.emit("newGroupDayTurn", {
      dayTurn,
      channelId: input.channelId,
    });

    return undefined;
  });
