import EventPage from '@/components/pages/event-page';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_dashboard/events/$slug')({
  component: RouteComponent,
});

function RouteComponent() {
  return <EventPage breadcrumbs={[{ label: 'Upcoming Events', href: '/events' }]} />;
}
