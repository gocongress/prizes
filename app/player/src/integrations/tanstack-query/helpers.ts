import { QueryClient } from '@tanstack/react-query';

// Singleton QueryClient shared between the router (beforeLoad) and the React app.
// This ensures that profile data fetched in beforeLoad is immediately available
// to useQuery hooks in components, preventing a redundant network request and
// an unnecessary isLoading → false transition on every dashboard render.
const queryClient = new QueryClient();

export function getContext() {
  return {
    queryClient,
  };
}
