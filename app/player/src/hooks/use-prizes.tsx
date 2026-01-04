import { env } from '@/env';
import { useQuery } from '@tanstack/react-query';

export interface Award {
  id: string;
  kind: 'award';
  value: number;
  available: boolean;
}

export interface Prize {
  id: string;
  kind: 'prize';
  title: string;
  eventTitle?: string | null;
  description?: string | null;
  url?: string | null;
  sponsor?: string | null;
  recommendedRank: 'ALL' | 'DAN' | 'SDK' | 'DDK';
  eventId?: string | null;
  awards?: Award[];
  awardsCount?: number;
  awardsSum?: number;
  imageType?: string | null;
  imageThumbnailEncoded?: string | null;
}

export interface PrizeAwardCombination {
  id: string;
  prizeId: string;
  awardValue: number;
  awardId?: string;
  prize: Prize;
}

interface ApiResponse<T> {
  data: T;
  api: {
    version: string;
  };
}

interface PrizesResponse {
  items: Prize[];
  total: number;
  page: number;
  pageSize: number;
}

const API_URL = env.VITE_API_URL;

/**
 * React hook that fetches prizes from the API
 *
 * @returns Prizes query state and data
 *
 * @example
 * ```tsx
 * const { prizes, isLoading, isError, error } = usePrizes();
 *
 * if (isLoading) return <div>Loading...</div>;
 * if (isError) return <div>Error: {error.message}</div>;
 * return <div>{prizes?.map(p => <div key={p.id}>{p.title}</div>)}</div>;
 * ```
 */
export const usePrizes = () => {
  const prizesQuery = useQuery({
    queryKey: ['prizes'],
    queryFn: async (): Promise<PrizesResponse> => {
      const response = await fetch(`${API_URL}/api/v1/prizes`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch prizes');
      }

      const result: ApiResponse<PrizesResponse> = await response.json();
      return result.data;
    },
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
