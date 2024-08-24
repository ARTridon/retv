import { authRouter } from "@/api/router/auth.route.js";

import { router } from "@/api/lib/trpc.js";

export const appRouter = router({
  auth: authRouter,
});

export type AppRouter = typeof appRouter;
