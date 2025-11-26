import type { User } from '@/hooks/use-auth';
import { getContext } from '@/integrations/tanstack-query/helpers';
import { routeTree } from '@/routeTree.gen';
import type { QueryClient } from '@tanstack/react-query';
import { createRouter } from '@tanstack/react-router';

const TanStackQueryProviderContext = getContext();

const initialContext: MyRouterContext = {
  ...TanStackQueryProviderContext,
  auth: { user: undefined },
};

export type AuthState = {
  user?: User;
};

export interface MyRouterContext {
  queryClient: QueryClient;
  auth: AuthState;
}

export const getRouterContext = () => initialContext;

export const router = createRouter({
  routeTree,
  context: initialContext,
  defaultPreload: 'intent',
  scrollRestoration: true,
  defaultStructuralSharing: true,
  defaultPreloadStaleTime: 0,
});

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
