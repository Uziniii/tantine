import { randomInt } from 'crypto';
import { TRPCError } from "@trpc/server";
import { userIsAuthorOrSuperAdmin } from '@/trpc';
import { ev } from "@/ws";

export const turnTheWheel = userIsAuthorOrSuperAdmin
  .mutation(
    async ({ ctx, input }) => {
      // const group = await ctx.prisma.channel.findUnique({
      //   where: {
      //     id: +input.channelId,
      //   },
      //   select: {
      //     id: true,
      //     users: {
      //       select: {
      //         id: true,
      //       },
      //     },
      //   },
      // });

      // if (!group) throw new TRPCError({ code: "NOT_FOUND" });

      // const users = group.users.map(({ id }) => id);
      // const winnerId = users[randomInt(0, users.length - 1)];

      // const message = await ctx.prisma.message.create({
      //   data: {
      //     content: "",
      //     system: true,
      //     channel: {
      //       connect: {
      //         id: +input.channelId,
      //       },
      //     },
      //     carousel: {
      //       create: {
      //         users: {
      //           connect: users.map((id) => ({ id })),
      //         },
      //         winnerId: winnerId,
      //       }
      //     }
      //   },
      //   select: {
      //     carousel: {
      //       select: {
      //         id: true,
      //         winnerId: true,
      //         users: {
      //           select: {
      //             id: true,
      //           }
      //         }
      //       }
      //     }
      //   }
      // })

      // ev.emit("createMessage", message)
      
      // return winnerId;
    }
  );
