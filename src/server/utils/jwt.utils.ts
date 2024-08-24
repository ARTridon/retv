import * as jose from "jose";
import { createSecretKey } from "crypto";

import { type User } from "kysely-codegen";

const secretKey = createSecretKey(process.env.JWT_SECRET!, "utf-8");

export const generateToken = async (
  payload: Omit<User, "password">,
  expirationTime: string
) => {
  const token = await new jose.SignJWT({
    ...payload,
  })
    .setProtectedHeader({
      alg: "HS256",
    })
    .setIssuedAt()
    .setIssuer(process.env.JWT_ISSUER!)
    .setAudience(process.env.JWT_AUDIENCE!)
    .setExpirationTime(expirationTime)
    .sign(secretKey);
  return token;
};

export const verifyToken = async (token: string) => {
  try {
    const result = await jose.jwtVerify(token, secretKey, {
      issuer: process.env.JWT_ISSUER!,
      audience: process.env.JWT_AUDIENCE!,
      algorithms: ["HS256"],
    });
    return result.payload;
  } catch (error: any) {
    if (error.code === "ERR_JWT_EXPIRED") {
      return {
        code: "ERR_JWT_EXPIRED",
        payload: error.payload,
      };
    }
    throw error;
  }
};
