import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '../trpc';
import { generateAccessToken } from '../jwt';
import { hashPassword, verifyPassword } from '../password';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { TRPCError } from '@trpc/server';

export const userRouter = router({
  create: publicProcedure
    .input(
      z.object({
        name: z.string().trim(),
        surname: z.string().trim(),
        email: z.string().trim().toLowerCase().email(),
        password: z.string(),
      })
    )
    .output(z.string())
    .mutation(async ({ ctx, input }) => {
      const [salt, hashedPassword] = hashPassword(input.password);

      try {
        const user = await ctx.prisma.user.create({
          data: {
            email: input.email,
            name: input.name,
            surname: input.surname,
            salt,
            hashedPassword,
          },
          select: {
            id: true,
            email: true,
            name: true,
            surname: true,
          },
        });

        return generateAccessToken({
          id: user.id,
          email: user.email,
          name: user.name,
          surname: user.surname,
        }, hashedPassword);
      } catch (error) {
        if (
          error instanceof PrismaClientKnownRequestError &&
          error.code === "P2002"
        ) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "EMAIL_ALREADY_USED",
          });
        }

        throw error;
      }
    }),

  login: publicProcedure
    .input(
      z.object({
        email: z.string().trim().toLowerCase().email(),
        password: z.string(),
      })
    )
    .output(z.string())
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findUnique({
        where: {
          email: input.email,
        },
        select: {
          id: true,
          hashedPassword: true,
          email: true,
          name: true,
          surname: true,
        },
      });

      if (!user || !verifyPassword(input.password, user.hashedPassword)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "INVALID_CREDENTIALS",
        });
      }

      return generateAccessToken({
        id: user.id,
        email: user.email,
        name: user.name,
        surname: user.surname,
      }, user.hashedPassword);
    }),

    search: protectedProcedure
      .input(z.string().min(2))
      .output(
        z.array(
          z.object({
            id: z.number(),
            email: z.string().email(),
            name: z.string(),
            surname: z.string(),
          })
        )
      )
      .query(async ({ ctx, input }) => {
        const users = await ctx.prisma.user.findMany({
          where: {
            OR: [{
                name: {
                  contains: input,
                },
              },{
                surname: {
                  contains: input,
                },
              },{
                email: {
                  contains: input,
                },
            }],
          },
          select: {
            id: true,
            email: true,
            name: true,
            surname: true,
          },
        });

        return users;
      }),
});
