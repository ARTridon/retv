import {
  createRootRouteWithContext,
  useNavigate,
  useLocation,
  Outlet,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { trpc, trpcQueryUtils } from "@/web/utils/trpc";
import { useEffect } from "react";

export type RouterAppContextType = {
  trpcQueryUtils: typeof trpcQueryUtils;
};

export const Route = createRootRouteWithContext<RouterAppContextType>()({
  component: Root,
});

function Root() {
  const navigate = useNavigate();
  const pathname = useLocation({
    select: (location) => location.pathname,
  });
  const { error, isError } = trpc.auth.refresh.useQuery();

  useEffect(() => {
    if (isError) {
      if (error?.data?.httpStatus === 401 && pathname !== "/sign-in"&& pathname !== "/sign-up") {
        navigate({ to: "/sign-in" });
      }
    }
    console.log(pathname);
  }, [isError, error, pathname]);

  return (
    <>
      <Outlet />
      <TanStackRouterDevtools />
      {/* <ReactQueryDevtools position="bottom" buttonPosition="bottom-right" /> */}
    </>
  );
}
