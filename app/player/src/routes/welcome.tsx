import { WelcomeLayout } from '@/components/layout/welcome-layout';
import EventsPage from '@/components/pages/events-page';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/welcome')({
  component: WelcomePageLayout,
});

function WelcomePageLayout() {
  return (
    <WelcomeLayout breadcrumbs={[{ title: 'Welcome' }]}>
      <EventsPage breadcrumbs={[{ label: 'Welcome' }]} showCallToAction={true} />
    </WelcomeLayout>
  );
}
