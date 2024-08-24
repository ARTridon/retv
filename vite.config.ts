import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";

export default defineConfig({
  plugins: [tsconfigPaths(), TanStackRouterVite({
    routesDirectory: "src/client/routes",
   generatedRouteTree: "src/client/routeTree.gen.ts",
  }), react()],
});
