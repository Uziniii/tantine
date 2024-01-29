import { protectedProcedure } from "@/trpc";

export const findNearestGroup = protectedProcedure
  .query(async ({ ctx }) => {
    const user =  await ctx.prisma.$queryRaw<[{ point: string }]>`SELECT AsText(IF(originLocation is null, \`location\`, originLocation)) as point FROM User WHERE id = ${ctx.user.id}`;

    const groups = await ctx.prisma.$queryRawUnsafe(
`SELECT 
  g.*,
  count(users.B) as users
FROM
  \`GroupChannel\` as g
  LEFT JOIN \`User\` as u on g.authorId = u.id
  LEFT JOIN Channel as c on c.groupId = g.id
  LEFT JOIN _ChannelToUser as users on users.A = c.id
WHERE
  g.authorId != ${ctx.user.id} AND
  ST_Distance_Sphere(${user[0].point.replace(" ", ",")}, IF(u.originLocation is null, u.\`location\`, u.originLocation)) < 1000000
LIMIT 100`
    );

    return groups;
  })
