import LoginPage from '@/components/pages/login-page';
import { createFileRoute } from '@tanstack/react-router';
import * as z from 'zod';

export const Route = createFileRoute('/login')({
  validateSearch: z.object({
    token: z.string().optional(),
  }),
  component: LoginPage,
});
