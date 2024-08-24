import { protectedProcedure, publicProcedure, router } from "@/api/lib/trpc.js";
import { z } from "zod";
import { db } from "@/api/lib/database/db.js";

import { TRPCError } from "@trpc/server";
import { generateToken, verifyToken } from "@/api/utils/jwt.utils.js";
import { User } from "kysely-codegen";
import { hashPassword } from "@/api/utils/bcrypt.utils.js";

const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const authRouter = router({
  sign_up: publicProcedure
    .input(signUpSchema)
    .mutation(async ({ input, ctx }) => {
      const { email, password } = input;

      const findUser = await db
        .selectFrom("user")
        .where("email", "=", email)
        .executeTakeFirst();

      if (findUser) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "User already exists",
        });
      }

      const passwordHash = hashPassword(password);

      try {
        const createdUser = await db
          .insertInto("user")
          .values({
            email,
            password: passwordHash,
          })
          .returning(["id", "email"])
          .executeTakeFirst();
        const access_token = await generateToken(
          createdUser as unknown as Omit<User, "password">,
          "1 sec"
        );

        const refresh_token = await generateToken(
          createdUser as unknown as Omit<User, "password">,
          "30 day"
        );

        await db
          .insertInto("session")
          .values({
            user_id: createdUser!.id,
            refresh_token,
          })
          .execute();

        ctx.res.cookie("access_token", access_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge:
            1000 * 60 * 60 * 24 * Number(process.env.COOKIE_EXPIRATION_DAY!),
        });
      } catch (error) {

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create user",
          cause: error,
        });
      }

      return {
        message: "User created",
      };
    }),
  refresh: protectedProcedure.query(async ({ ctx }) => {
    const user = await verifyToken(ctx.access_token);
    if ("iat" in user) {
      delete user.iat;
      delete user.iss;
      delete user.aud;
      delete user.exp;
      delete user.password;
    }
    return { user };
  }),
});
