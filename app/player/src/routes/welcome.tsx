import WelcomePage from '@/components/pages/welcome-page';
import { WelcomeSidebar } from '@/components/layout/welcome-sidebar';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@radix-ui/react-separator';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/welcome')({
  component: WelcomePageLayout,
});

function WelcomePageLayout() {
  return (
    <SidebarProvider>
      <WelcomeSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbPage>Welcome</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <WelcomePage />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
