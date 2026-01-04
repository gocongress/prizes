import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/_dashboard/events')({
  component: RouteComponent,
});

function RouteComponent() {
  return <Outlet />;
}
