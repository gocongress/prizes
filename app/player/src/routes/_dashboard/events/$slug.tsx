import EventSponsorsPage from '@/components/pages/event-sponsors-page';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_dashboard/events/$slug')({
  component: RouteComponent,
});

function RouteComponent() {
  return <EventSponsorsPage breadcrumbs={[{ label: 'Upcoming Events', href: '/events' }]} />;
}
