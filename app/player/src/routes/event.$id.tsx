import EventPage from '@/components/pages/event-page';
import { WelcomeLayout } from '@/components/layout/welcome-layout';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/event/$id')({
  component: EventPageLayout,
});

function EventPageLayout() {
  return (
    <WelcomeLayout breadcrumbs={[{ title: 'Welcome', href: '/welcome' }, { title: 'Event' }]}>
      <EventPage />
    </WelcomeLayout>
  );
}
