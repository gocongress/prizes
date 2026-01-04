import { env } from '@/env';
import { useQuery } from '@tanstack/react-query';
import type { Event } from './use-events';

interface ApiResponse<T> {
  data: T;
  api: {
    version: string;
  };
}

const API_URL = env.VITE_API_URL;

/**
 * React hook that fetches a single event by ID from the API
 *
 * @param eventSlug - The slug of the event to fetch
 * @returns Event query state and data
 *
 * @example
 * ```tsx
 * const { event, isLoading, isError, error } = useEventById('event-123');
 *
 * if (isLoading) return <div>Loading...</div>;
 * if (isError) return <div>Error: {error.message}</div>;
 * return <div>{event?.title}</div>;
 * ```
 */
export const useEventBySlug = (eventSlug: string | undefined) => {
  const eventQuery = useQuery({
    queryKey: ['event', eventSlug],
    queryFn: async (): Promise<Event> => {
      if (!eventSlug) {
        throw new Error('Event ID is required');
      }

      const response = await fetch(`${API_URL}/api/v1/events/slug/${eventSlug}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch event');
      }

      const result: ApiResponse<Event> = await response.json();
      return result.data;
    },
    enabled: !!eventSlug,
    staleTime: 5 * 60 * 1000, // 5 minutes
    throwOnError: true,
  });

  return {
    event: eventQuery.data,
    isLoading: eventQuery.isLoading,
    isError: eventQuery.isError,
    error: eventQuery.error,
    refetch: eventQuery.refetch,
  };
};
