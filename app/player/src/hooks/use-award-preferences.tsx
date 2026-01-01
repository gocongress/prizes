import { env } from '@/env';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// Stable empty array reference to prevent unnecessary re-renders
const EMPTY_ARRAY: AwardPreference[] = [];

export interface AwardPreference {
  id: string;
  kind: 'awardPreference';
  playerId: string;
  awardId: string;
  awardValue: number;
  prizeId: string;
  preferenceOrder: number;
  createdAt: string;
  updatedAt?: string | null;
}

interface ApiResponse<T> {
  data: T;
  api: {
    version: string;
  };
}

interface AwardPreferencesResponse {
  items: AwardPreference[];
  total: number;
  page: number;
  pageSize: number;
}

const API_URL = env.VITE_API_URL;

/**
 * React hook that fetches award preferences for a specific player from the API
 *
 * @param playerId - The ID of the player to fetch award preferences for
 * @returns Award preferences query state and data
 *
 * @example
 * ```tsx
 * const { awardPreferences, isLoading, isError, error } = useAwardPreferences(playerId);
 *
 * if (isLoading) return <div>Loading...</div>;
 * if (isError) return <div>Error: {error.message}</div>;
 * return <div>{awardPreferences?.map(p => <div key={p.id}>{p.preferenceOrder}</div>)}</div>;
 * ```
 */
export const useAwardPreferences = (playerId: string | null | undefined) => {
  const awardPreferencesQuery = useQuery({
    queryKey: ['awardPreferences', playerId],
    queryFn: async (): Promise<AwardPreferencesResponse> => {
      if (!playerId) {
        throw new Error('Player ID is required');
      }

      const response = await fetch(`${API_URL}/api/v1/awardPreferences/player/${playerId}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch award preferences');
      }

      const result: ApiResponse<AwardPreferencesResponse> = await response.json();
      return result.data;
    },
    enabled: !!playerId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    throwOnError: true,
  });

  return {
    awardPreferences: awardPreferencesQuery.data?.items || EMPTY_ARRAY,
    total: awardPreferencesQuery.data?.total || 0,
    page: awardPreferencesQuery.data?.page || 0,
    pageSize: awardPreferencesQuery.data?.pageSize || 10,
    isLoading: awardPreferencesQuery.isLoading,
    isError: awardPreferencesQuery.isError,
    error: awardPreferencesQuery.error,
    refetch: awardPreferencesQuery.refetch,
  };
};

export interface SaveAwardPreferenceItem {
  playerId: string;
  awardId: string;
  preferenceOrder: number;
}

export interface SaveAwardPreferencesRequest {
  eventId: string;
  items: SaveAwardPreferenceItem[];
}

/**
 * React hook that provides a mutation function to save award preferences for a player
 *
 * @returns Mutation object with saveAwardPreferences function
 *
 * @example
 * ```tsx
 * const { saveAwardPreferences, isPending, isError, error } = useSaveAwardPreferences();
 *
 * const handleSave = () => {
 *   saveAwardPreferences({
 *     items: [
 *       { playerId: '123', awardId: '456', preferenceOrder: 1 },
 *       { playerId: '123', awardId: '789', preferenceOrder: 2 }
 *     ]
 *   });
 * };
 * ```
 */
export const useSaveAwardPreferences = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (request: SaveAwardPreferencesRequest): Promise<AwardPreferencesResponse> => {
      const response = await fetch(`${API_URL}/api/v1/awardPreferences/player`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error('Failed to save award preferences');
      }

      const result: ApiResponse<AwardPreferencesResponse> = await response.json();
      return result.data;
    },
    onSuccess: (data) => {
      // Invalidate the award preferences query to trigger a refetch
      // Get the playerId from the first item in the response
      if (data.items.length > 0) {
        const playerId = data.items[0].playerId;
        queryClient.invalidateQueries({ queryKey: ['awardPreferences', playerId] });
      }
    },
    throwOnError: true,
  });

  return {
    saveAwardPreferences: mutation.mutate,
    saveAwardPreferencesAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
  };
};
