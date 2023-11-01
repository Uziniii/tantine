import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '../trpc';
import { generateAccessToken } from '../jwt';
import { hashPassword, verifyPassword } from '../password';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { TRPCError } from '@trpc/server';
import { ev } from '../ws';
import country from "../data/country.json"

type Required = [
  z.ZodLiteral<string>,
  z.ZodLiteral<string>,
  ...z.ZodLiteral<string>[]
];

const countryType = z.union(
  country.map((c) => z.literal(c)) as any as Required
);

const trimMin = z.string().trim().min(2);
const genderType = z.union([z.literal(1), z.literal(2), z.literal(3)])

export const userRouter = router({
  create: publicProcedure
    .input(
      z.object({
        name: trimMin.max(18),
        surname: trimMin.max(32),
        gender: genderType,
        countryOfResidence: countryType,
        state: trimMin.max(48),
        city: trimMin.max(48),
        originCountry: countryType,
        email: z.string().trim().max(200).toLowerCase().email(),
        password: z.string().min(8).max(64),
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
            gender: input.gender,
            salt,
            hashedPassword,
            country: input.countryOfResidence,
            state: input.state,
            city: input.city,
            origin: input.originCountry,
          },
          select: {
            id: true,
            email: true,
            name: true,
            surname: true,
          },
        });

        return generateAccessToken(
          {
            id: user.id,
            email: user.email,
            name: user.name,
            surname: user.surname,
          },
          hashedPassword
        );
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

      return generateAccessToken(
        {
          id: user.id,
          email: user.email,
          name: user.name,
          surname: user.surname,
        },
        user.hashedPassword
      );
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
      ev.emit("message", "Hello");

      const users = await ctx.prisma.user.findMany({
        where: {
          OR: [
            {
              name: {
                contains: input,
              },
            },
            {
              surname: {
                contains: input,
              },
            },
            {
              email: {
                contains: input,
              },
            },
          ],
          NOT: {
            id: ctx.user.id,
          },
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

  retrieve: protectedProcedure
    .input(z.array(z.number()))
    .output(
      z.array(
        z.object({
          id: z.number(),
          email: z.string().email(),
          name: z.string(),
          surname: z.string(),
          gender: z.number(),
          country: countryType,
          state: z.string(),
          city: z.string(),
          origin: countryType,
        })
      )
    )
    .mutation(async ({ ctx, input }) => {
      const users = await ctx.prisma.user.findMany({
        where: {
          id: {
            in: input,
          },
        },
        select: {
          id: true,
          email: true,
          name: true,
          surname: true,
          gender: true,
          country: true,
          state: true,
          city: true,
          origin: true,
        },
      });

      return users;
    }),
});
