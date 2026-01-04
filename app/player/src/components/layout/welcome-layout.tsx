import { WelcomeSidebar } from '@/components/layout/welcome-sidebar';
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
import { Separator } from '@radix-ui/react-separator';
import { Outlet } from '@tanstack/react-router';
import { Fragment, type ReactNode } from 'react';

export interface WelcomeLayoutProps {
  breadcrumbs?: Array<{ title: string; href?: string }>;
  children?: ReactNode;
}

export function WelcomeLayout({ breadcrumbs = [], children }: WelcomeLayoutProps) {
  return (
    <SidebarProvider>
      <BreadcrumbProvider>
        <WelcomeSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
              <Breadcrumb>
                <BreadcrumbList>
                  {breadcrumbs.length > 0 ? (
                    breadcrumbs.map((item, index) => (
                      <Fragment key={item.href || item.title}>
                        <BreadcrumbItem className="hidden md:block">
                          {index === breadcrumbs.length - 1 ? (
                            <BreadcrumbPage>{item.title}</BreadcrumbPage>
                          ) : item.href ? (
                            <BreadcrumbLink href={item.href}>{item.title}</BreadcrumbLink>
                          ) : (
                            <BreadcrumbPage>{item.title}</BreadcrumbPage>
                          )}
                        </BreadcrumbItem>
                        {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
                      </Fragment>
                    ))
                  ) : (
                    <BreadcrumbItem className="hidden md:block">
                      <BreadcrumbLink href="/welcome">Welcome</BreadcrumbLink>
                    </BreadcrumbItem>
                  )}
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">{children || <Outlet />}</div>
        </SidebarInset>
      </BreadcrumbProvider>
    </SidebarProvider>
  );
}
