import ErrorOops from '@/components/error';
import CookieConsent from '@/components/ui/cookie-consent';
import Footer from '@/components/ui/footer';
import { env } from '@/env';
import type { User } from '@/hooks/use-auth';
import TanStackDevtoolsPlugins from '@/integrations/tanstack-query/devtools';
import { type MyRouterContext } from '@/router';
import { TanStackDevtools } from '@tanstack/react-devtools';
import { Outlet, createRootRouteWithContext, redirect } from '@tanstack/react-router';

export const Route = createRootRouteWithContext<MyRouterContext>()({
  beforeLoad: async ({ location, context }) => {
    // Do not check auth for the login, welcome, privacy, terms, or event pages
    if (
      ['/login', '/welcome', '/privacy', '/terms'].includes(location.pathname) ||
      location.pathname.startsWith('/event/')
    ) {
      return;
    }

    try {
      // Before every route change or application load, use cached profile data or fetch
      // profile file data from the server. This validates that the user is logged in
      // and has a valid/active user account.
      //
      // Cache this "auth check" for 5 minutes so that the client isn't repeatedly checking
      // the endpoint during regular usage. While a user is interacting with the APIs, every
      // endpoint on the server is already validating the JWT and access control.
      const profileQuery = {
        queryKey: ['profile'] as const,
        queryFn: async (): Promise<User> => {
          const response = await fetch(`${env.VITE_API_URL}/api/v1/auth/profile`, {
            method: 'GET',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (!response.ok) {
            throw new Error('Not authenticated');
          }

          const result = await response.json();
          return result.data;
        },
        staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
        retry: false,
      };

      const user = await context.queryClient.fetchQuery(profileQuery);
      return { auth: { user } } satisfies Partial<MyRouterContext>;
    } catch {
      throw redirect({
        to: '/welcome',
      });
    }
  },
  component: RootComponent,
  errorComponent: ErrorOops,
});

function RootComponent() {
  return (
    <>
      <div className="flex min-h-screen flex-col">
        <div className="flex-1">
          <Outlet />
        </div>
        <Footer />
      </div>
      <CookieConsent />
      {import.meta.env.DEV && <TanStackDevtools plugins={TanStackDevtoolsPlugins} />}
    </>
  );
}
