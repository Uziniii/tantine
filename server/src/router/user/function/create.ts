import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { TRPCError } from "@trpc/server";
import { generateAccessToken } from "../../../jwt";
import { hashPassword } from "../../../password";
import { z } from "zod";
import { countryType, genderType, trimMin } from "../schema";
import { publicProcedure } from "../../../trpc";
import SqlString from "sqlstring";

const location = z.object({
  displayName: z.string().max(400),
  lat: z.string(),
  lon: z.string(),
});

export const create = publicProcedure
  .input(
    z.object({
      name: trimMin.max(18),
      surname: trimMin.max(32),
      gender: genderType,
      email: z.string().trim().max(200).toLowerCase().email(),
      password: z.string().min(8).max(64),
      location: location,
      originLocation: location,
    })
  )
  .output(z.string())
  .mutation(async ({ ctx, input }) => {
    const [salt, hashedPassword] = hashPassword(input.password);

    try {
      const users = await ctx.prisma.$queryRawUnsafe<[{ f0: number }]>(`
        INSERT INTO User (
          email,
          \`name\`,
          surname,
          gender,
          salt,
          hashedPassword,
          \`location\`,
          locationDisplayName,
          originLocation,
          originLocationDisplayName
        ) VALUES (
          ${SqlString.escape(input.email)},
          ${SqlString.escape(input.name)},
          ${SqlString.escape(input.surname)},
          ${SqlString.escape(input.gender)},
          ${SqlString.escape(salt)},
          ${SqlString.escape(hashedPassword)},
          ST_GeomFromText(${SqlString.escape(`POINT(${input.location.lon} ${input.location.lat})`)}),
          ${SqlString.escape(input.location.displayName)},
          ST_GeomFromText(${SqlString.escape(`POINT(${input.originLocation.lon} ${input.originLocation.lat})`)}),
          ${SqlString.escape(input.originLocation.displayName)}
        )
        RETURNING id;
      `);

      return generateAccessToken(
        {
          id: users[0].f0,
          email: input.email,
          name: input.name,
          surname: input.surname,
        },
        hashedPassword
      );
    } catch (error) {
      console.log(error);
      
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
  });
