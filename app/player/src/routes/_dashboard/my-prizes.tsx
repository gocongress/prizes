import MyPrizesPage from '@/components/pages/my-prizes-page';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_dashboard/my-prizes')({
  component: MyPrizesPage,
});
