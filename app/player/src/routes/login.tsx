import LoginPage from '@/components/pages/login-page';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/login')({
  component: LoginPage,
});
