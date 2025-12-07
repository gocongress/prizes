import { AppSidebar } from '@/components/layout/app-sidebar';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { BreadcrumbProvider } from '@/contexts/breadcrumb';
import { PlayerProvider } from '@/contexts/player';
import { useBreadcrumb } from '@/hooks/use-breadcrumb';
import { Separator } from '@radix-ui/react-separator';
import { createFileRoute, Outlet } from '@tanstack/react-router';
import { Fragment, useEffect } from 'react';

export const Route = createFileRoute('/_dashboard')({
  component: DashboardLayout,
});

function DashboardContent() {
  const { queryClient } = Route.useRouteContext();
  const { breadcrumbs } = useBreadcrumb();

  // Prevent stale cached data when navigating back via browser history
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        queryClient.invalidateQueries({ refetchType: 'active' });
      }
    };

    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        queryClient.invalidateQueries({ refetchType: 'active' });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pageshow', handlePageShow, { capture: true });

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pageshow', handlePageShow, { capture: true });
    };
  }, [queryClient]);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                {breadcrumbs.length > 0 ? (
                  breadcrumbs.map((item, index) => (
                    <Fragment key={item.href + index}>
                      <BreadcrumbItem className="hidden md:block">
                        {index === breadcrumbs.length - 1 ? (
                          <BreadcrumbPage>{item.title}</BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink href={item.href}>{item.title}</BreadcrumbLink>
                        )}
                      </BreadcrumbItem>
                      {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
                    </Fragment>
                  ))
                ) : (
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                  </BreadcrumbItem>
                )}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export function DashboardLayout() {
  return (
    <BreadcrumbProvider>
      <PlayerProvider>
        <DashboardContent />
      </PlayerProvider>
    </BreadcrumbProvider>
  );
}
