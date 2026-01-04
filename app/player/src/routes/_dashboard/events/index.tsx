import EventsPage from '@/components/pages/events-page';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_dashboard/events/')({
  component: RouteComponent,
});

function RouteComponent() {
  return <EventsPage breadcrumbs={[{ label: 'Upcoming Events' }]} showCallToAction={false} />;
}
