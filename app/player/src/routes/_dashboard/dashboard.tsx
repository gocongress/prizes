import DashboardPage from '@/components/pages/dashboard-page';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_dashboard/dashboard')({
  component: DashboardPage,
});
