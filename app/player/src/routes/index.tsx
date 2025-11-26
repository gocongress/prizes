import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  beforeLoad: ({ context }) => {
    const { auth } = context;
    if (auth.user) {
      throw redirect({ to: '/dashboard', replace: true });
    } else {
      throw redirect({ to: '/login', replace: true });
    }
  }
});

