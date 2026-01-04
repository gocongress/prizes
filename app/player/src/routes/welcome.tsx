import { WelcomeLayout } from '@/components/layout/welcome-layout';
import WelcomePage from '@/components/pages/welcome-page';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/welcome')({
  component: WelcomePageLayout,
});

function WelcomePageLayout() {
  return (
    <WelcomeLayout breadcrumbs={[{ title: 'Welcome' }]}>
      <WelcomePage />
    </WelcomeLayout>
  );
}
