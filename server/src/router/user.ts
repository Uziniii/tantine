import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import { generateAccessToken } from '../jwt';
import { hashPassword } from '../password';

export const userRouter = router({
  create: publicProcedure
    .input(
      z.object({
        name: z.string(),
        surname: z.string(),
        email: z.string().email(),
        password: z.string()
      })
    )
    .output(z.string())
    .mutation(async ({ ctx, input }) => {
      const [salt, hashedPassword] = hashPassword(input.password)

      const user = await ctx.prisma.user.create({
        data: {
          email: input.email,
          name: input.name,
          surname: input.surname,
          salt,
          hashedPassword
        },
        select: {
          id: true
        }
      })
      console.log("azaeaz");
      
      return generateAccessToken(user.id.toString())
    }),
  login: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string()
      })
    )
    .mutation(() => {})
})
