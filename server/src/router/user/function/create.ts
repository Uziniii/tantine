import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { TRPCError } from "@trpc/server";
import { generateAccessToken } from "../../../jwt";
import { hashPassword } from "../../../password";
import { z } from "zod";
import { countryType, genderType, trimMin } from "../schema";
import { publicProcedure } from "../../../trpc";

const location = z.object({
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
      locationDislayName: z.string().max(400),
      location: location,
      originLocationDisplayName: z.string().max(400),
      originLocation: location,
    })
  )
  .output(z.string())
  .mutation(async ({ ctx, input }) => {
    const [salt, hashedPassword] = hashPassword(input.password);

    try {
      const user = await ctx.prisma.$queryRaw`
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
          ST_GeomFromText('POINT(${input.location.lon} ${input.location.lat})'),
          ${input.locationDislayName},
          ST_GeomFromText('POINT(${input.originLocation.lon} ${input.originLocation.lat})'),
          ${input.originLocationDisplayName}
        )
      `;
      console.log(user);
      

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
  });
