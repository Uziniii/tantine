import { acceptJoinRequest } from './function/acceptJoinRequest';
import { sendJoinRequest } from './function/sendJoinRequest';
import { putAdmin } from './function/putAdmin';
import { getInfo } from './function/getInfo';
import { quit } from './function/quit';
import { turnTheWheel } from './function/turnTheWheel';
import { join } from './function/join';
import { changeVisibility } from './function/changeVisibility';
import { editDayTurn } from './function/editDayTurn';
import { search } from './function/search';
import { removeMember } from './function/removeMember';
import { editTitle } from './function/editTitle';
import { deleteGroup } from './function/delete';
import { router } from "@/trpc";
import { findNearestGroup } from './function/findNearestGroup';

export const groupRouter = router({
  editTitle,
  removeMember,
  editDayTurn,
  // addMembers: userIsAuthorOrSuperAdmin
  //   .input(z.object({
  //     channelId: z.number(),
  //     membersIds: z.array(z.number())
  //   }))
  //   .mutation(async ({ ctx, input }) => {
  //     const group = await ctx.prisma.channel.findUnique({
  //       where: {
  //         id: input.channelId,
  //       },
  //       select: {
  //         id: true,
  //         group: {
  //           select: {
  //             id: true,
  //             authorId: true,
  //           },
  //         },
  //       },
  //     });

  //     if (!group?.group) throw new TRPCError({ code: "NOT_FOUND" });

  //     await ctx.prisma.channel.update({
  //       where: {
  //         id: group.id,
  //       },
  //       data: {
  //         users: {
  //           connect: input.membersIds.map((id) => ({ id })),
  //         },
  //       },
  //     });

  //     ev.emit("addMembers", {
  //       channelId: input.channelId,
  //       membersIds: input.membersIds
  //     })

  //     return undefined
  //   }),
  delete: deleteGroup,
  search,
  changeVisibility,
  join,
  turnTheWheel,
  quit,
  getInfo,
  putAdmin,
  sendJoinRequest,
  acceptJoinRequest,
  findNearestGroup,
})
