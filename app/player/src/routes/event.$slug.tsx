import { WelcomeLayout } from '@/components/layout/welcome-layout';
import EventSponsorsPage from '@/components/pages/event-sponsors-page';
import { useEventBySlug } from '@/hooks/use-event-by-slug';
import { createFileRoute, useParams } from '@tanstack/react-router';
import { useMemo } from 'react';

export const Route = createFileRoute('/event/$slug')({
  component: EventPageLayout,
});

function EventPageLayout() {
  const { slug } = useParams({ from: '/event/$slug' });
  const { event } = useEventBySlug(slug);

  const breadcrumbs = useMemo(() => {
    const baseCrumbs: Array<{ title: string; href?: string }> = [
      { title: 'Welcome', href: '/welcome' },
    ];
    if (event) {
      baseCrumbs.push({ title: event.title });
    } else {
      baseCrumbs.push({ title: 'Event' });
    }
    return baseCrumbs;
  }, [event]);

  return (
    <WelcomeLayout breadcrumbs={breadcrumbs}>
      <EventSponsorsPage />
    </WelcomeLayout>
  );
}
