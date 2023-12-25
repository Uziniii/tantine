import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { TRPCError } from "@trpc/server";
import { generateAccessToken } from "../../../jwt";
import { hashPassword } from "../../../password";
import { z } from "zod";
import { countryType, genderType, trimMin } from "../schema";
import { publicProcedure } from "../../../trpc";

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
      const userId = await ctx.prisma.$executeRaw`
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
          ${input.email},
          ${input.name},
          ${input.surname},
          ${input.gender},
          ${salt},
          ${hashedPassword},
          ST_GeomFromText('POINT(1 1)'),
          ${input.location.displayName},
          ST_GeomFromText('POINT(1 1)'),
          ${input.originLocation.displayName}
        );
      `;

      return generateAccessToken(
        {
          id: userId,
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
