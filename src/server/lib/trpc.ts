import { initTRPC, TRPCError } from "@trpc/server";
import { Context } from "@/api/main.js";
import { generateToken, verifyToken } from "@/api/utils/jwt.utils.js";
import { db } from "@/api/lib/database/db.js";
import { User } from "kysely-codegen";

export const t = initTRPC.context<Context>().create();

export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  // Check if access token is present
  if (!ctx.access_token) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Access token is required",
    });
  }

  const payload = await verifyToken(ctx.access_token);

  // Check if access token is valid
  if (payload.code === "ERR_JWT_EXPIRED") {
    const user_id = payload.payload.id;
    const session = await db
      .selectFrom("session")
      .where("user_id", "=", user_id)
      .select("refresh_token")
      .executeTakeFirst();

    // Check if refresh token is present
    if (!session) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Token already expired",
      });
    }

    // Check if refresh token is valid
    const payload_refresh_token = await verifyToken(session.refresh_token);

    if (payload_refresh_token.code === "ERR_JWT_EXPIRED") {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Token already expired",
      });
    }

    // Check if refresh token is expired by 1 day or less
    if ("exp" in payload_refresh_token) {
      const refreshTokenDate = payload_refresh_token.exp! * 1000;
      const currentDateMinusOneDay = Date.now() - 24 * 60 * 60 * 1000;

      if (refreshTokenDate < currentDateMinusOneDay) {
        // Clear sensitive data
        if ("iat" in payload_refresh_token) {
          delete payload_refresh_token.iat;
          delete payload_refresh_token.iss;
          delete payload_refresh_token.aud;
          delete payload_refresh_token.exp;
          delete payload_refresh_token.password;
        }

        // Generate new refresh token
        const refresh_token = await generateToken(
          payload_refresh_token as unknown as Omit<User, "password">,
          process.env.JWT_REFRESH_TOKEN_EXPIRATION!
        );

        // Update refresh token in database
        await db
          .updateTable("session")
          .where("user_id", "=", user_id)
          .set("refresh_token", refresh_token)
          .executeTakeFirst();
      }
    }

    // Generate new access token
    const access_token = await generateToken(
      payload_refresh_token as unknown as Omit<User, "password">,
      process.env.JWT_ACCESS_TOKEN_EXPIRATION!
    );

    // Set new access token in cookie
    ctx.res.cookie("access_token", access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 1000 * 60 * 60 * 24 * Number(process.env.COOKIE_EXPIRATION_DAY!),
    });

    return next({
      ctx: {
        ...ctx,
        access_token,
      },
    });
  }


  return next({
    ctx,
  });
});
export const router = t.router;
