import { env } from '@/env';
import { useQuery } from '@tanstack/react-query';
import type { Prize } from './use-prizes';

interface ApiResponse<T> {
  data: T;
  api: {
    version: string;
  };
}

interface PrizesByEventResponse {
  items: Prize[];
  total: number;
  page: number;
  pageSize: number;
}

const API_URL = env.VITE_API_URL;

/**
 * React hook that fetches prizes for a specific event from the API
 *
 * @param eventId - The ID of the event to fetch prizes for
 * @returns Prizes query state and data
 *
 * @example
 * ```tsx
 * const { prizes, isLoading, isError, error } = usePrizesByEvent('event-123');
 *
 * if (isLoading) return <div>Loading...</div>;
 * if (isError) return <div>Error: {error.message}</div>;
 * return <div>{prizes?.map(p => <div key={p.id}>{p.title}</div>)}</div>;
 * ```
 */
export const usePrizesByEvent = (eventId: string | undefined) => {
  const prizesQuery = useQuery({
    queryKey: ['prizes', 'event', eventId],
    queryFn: async (): Promise<PrizesByEventResponse> => {
      if (!eventId) {
        throw new Error('Event ID is required');
      }

      const response = await fetch(`${API_URL}/api/v1/prizes?eventId=${eventId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch prizes');
      }

      const result: ApiResponse<PrizesByEventResponse> = await response.json();
      return result.data;
    },
    enabled: !!eventId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    throwOnError: true,
  });

  return {
    prizes: prizesQuery.data?.items || [],
    total: prizesQuery.data?.total || 0,
    page: prizesQuery.data?.page || 0,
    pageSize: prizesQuery.data?.pageSize || 10,
    isLoading: prizesQuery.isLoading,
    isError: prizesQuery.isError,
    error: prizesQuery.error,
    refetch: prizesQuery.refetch,
  };
};
