import "dotenv/config";
import express from "express";
import ViteExpress from "vite-express";
import {
  createExpressMiddleware,
  CreateExpressContextOptions,
} from "@trpc/server/adapters/express";
import { appRouter } from "@/api/router/index.js";
import cookieParser from "cookie-parser";

const app = express();
app.use(cookieParser());

export const createContext = ({ req, res }: CreateExpressContextOptions) => {
  const access_token = req.cookies.access_token ?? null;
  return {
    req,
    res,
    access_token,
  };
};
export type Context = Awaited<ReturnType<typeof createContext>>;

app.use(
  "/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

ViteExpress.listen(app, 3000, () =>
  console.log("Server is listening on port 3000...")
);
