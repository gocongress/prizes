import { env } from '@/env';
import { useQuery } from '@tanstack/react-query';

export interface PlayerAward {
  id: string;
  kind: 'award';
  value?: number | null;
  redeemCode?: string | null;
  updatedAt?: string | null;
  prize?: {
    id: string;
    kind: 'prize';
    title: string;
    description?: string | null;
    url?: string | null;
    recommendedRank?: string;
    eventId?: string | null;
    eventTitle?: string | null;
    imageType?: string | null;
    imageThumbnailEncoded?: string | null;
  } | null;
}

interface ApiResponse<T> {
  data: T;
  api: {
    version: string;
  };
}

interface PlayerAwardsResponse {
  items: PlayerAward[];
}

const API_URL = env.VITE_API_URL;

/**
 * React hook that fetches awards for a specific player from the API
 *
 * @param playerId - The ID of the player to fetch awards for
 * @returns Player awards query state and data
 *
 * @example
 * ```tsx
 * const { awards, isLoading, isError, error } = usePlayerAwards(playerId);
 *
 * if (isLoading) return <div>Loading...</div>;
 * if (isError) return <div>Error: {error.message}</div>;
 * return <div>{awards?.map(a => <div key={a.id}>{a.prize?.title}</div>)}</div>;
 * ```
 */
export const usePlayerAwards = (playerId?: string) => {
  const awardsQuery = useQuery({
    queryKey: ['playerAwards', playerId],
    queryFn: async (): Promise<PlayerAwardsResponse> => {
      if (!playerId) {
        throw new Error('Player ID is required');
      }

      const response = await fetch(`${API_URL}/api/v1/users/awards/player/${playerId}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch player awards');
      }

      const result: ApiResponse<PlayerAwardsResponse> = await response.json();
      return result.data;
    },
    enabled: !!playerId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    throwOnError: true,
  });

  return {
    awards: awardsQuery.data?.items || [],
    isLoading: awardsQuery.isLoading,
    isError: awardsQuery.isError,
    error: awardsQuery.error,
    refetch: awardsQuery.refetch,
  };
};
