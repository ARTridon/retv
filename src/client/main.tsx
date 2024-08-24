import ReactDOM from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";

import { routeTree } from "@/web/routeTree.gen";
import { trpcQueryUtils, TRPCProvider } from "@/web/utils/trpc";
import { Toaster } from "@/web/components/ui/sonner";
import "@/web/index.css";

const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  context: {
    trpcQueryUtils,
  },
  defaultPendingComponent: () => <></>,
  Wrap: ({ children }) => (
    <TRPCProvider>
      {children}
      <Toaster richColors   position="top-right" expand={true} closeButton/>
    </TRPCProvider>
  ),
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const rootElement = document.getElementById("root")!;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<RouterProvider router={router} />);
}
