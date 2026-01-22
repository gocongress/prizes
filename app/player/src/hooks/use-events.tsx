import { env } from '@/env';
import { useQuery } from '@tanstack/react-query';

export interface Event {
  id: string;
  kind: 'event';
  title: string;
  slug: string;
  description?: string | null;
  registrationUrl?: string | null;
  selfRegistrationEnabled: boolean;
  startAt: string;
  endAt: string;
  createdAt: string;
  updatedAt?: string | null;
}

interface ApiResponse<T> {
  data: T;
  api: {
    version: string;
  };
}

interface EventsResponse {
  items: Event[];
  totalItems: number;
  totalPages: number;
  page: number;
  pageSize: number;
}

const API_URL = env.VITE_API_URL;

/**
 * React hook that fetches upcoming events from the API
 *
 * @returns Events query state and data
 *
 * @example
 * ```tsx
 * const { events, isLoading, isError, error } = useEvents();
 *
 * if (isLoading) return <div>Loading...</div>;
 * if (isError) return <div>Error: {error.message}</div>;
 * return <div>{events?.map(e => <div key={e.id}>{e.title}</div>)}</div>;
 * ```
 */
export const useEvents = () => {
  const eventsQuery = useQuery({
    queryKey: ['events'],
    queryFn: async (): Promise<EventsResponse> => {
      const response = await fetch(`${API_URL}/api/v1/events`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }

      const result: ApiResponse<EventsResponse> = await response.json();
      return result.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    throwOnError: true,
  });

  return {
    events: eventsQuery.data?.items || [],
    totalItems: eventsQuery.data?.totalItems || 0,
    totalPages: eventsQuery.data?.totalPages || 0,
    page: eventsQuery.data?.page || 0,
    pageSize: eventsQuery.data?.pageSize || 10,
    isLoading: eventsQuery.isLoading,
    isError: eventsQuery.isError,
    error: eventsQuery.error,
    refetch: eventsQuery.refetch,
  };
};
