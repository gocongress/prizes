import { env } from '@/env';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface SelfRegistrationInput {
  eventId: string;
  playerId: string;
}

interface Registrant {
  id: string;
  kind: 'registrant';
  playerId: string;
  eventId: string;
  registrationDate: string;
  status?: string;
  createdAt: string;
}

interface ApiResponse<T> {
  data: T;
  api: {
    version: string;
  };
}

const API_URL = env.VITE_API_URL;

/**
 * React hook that provides self-registration methods for events
 *
 * @returns Self-registration mutation methods and state
 *
 * @example
 * ```tsx
 * const { register, unregister, isLoading } = useSelfRegistration();
 *
 * // Register for an event
 * await register({ eventId: 'event-id', playerId: 'player-id' });
 *
 * // Unregister from an event
 * await unregister({ eventId: 'event-id', playerId: 'player-id' });
 * ```
 */
export const useSelfRegistration = () => {
  const toast = useToast();
  const queryClient = useQueryClient();

  const registerMutation = useMutation({
    mutationFn: async (input: SelfRegistrationInput): Promise<Registrant> => {
      const response = await fetch(
        `${API_URL}/api/v1/events/${input.eventId}/register/${input.playerId}`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to register for event');
      }

      const result: ApiResponse<Registrant> = await response.json();
      return result.data;
    },
    onSuccess: async () => {
      await queryClient.refetchQueries({ queryKey: ['profile'] });
      toast.success('Registered!', {
        description: 'You have been registered for the event.',
      });
    },
    onError: (error) => {
      toast.error('Registration failed', {
        description: error.message || 'Please try again later',
      });
    },
  });

  const unregisterMutation = useMutation({
    mutationFn: async (input: SelfRegistrationInput): Promise<Registrant> => {
      const response = await fetch(
        `${API_URL}/api/v1/events/${input.eventId}/register/${input.playerId}`,
        {
          method: 'DELETE',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to unregister from event');
      }

      const result: ApiResponse<Registrant> = await response.json();
      return result.data;
    },
    onSuccess: async () => {
      await queryClient.refetchQueries({ queryKey: ['profile'] });
      toast.success('Unregistered', {
        description: 'You have been unregistered from the event.',
      });
    },
    onError: (error) => {
      toast.error('Unregistration failed', {
        description: error.message || 'Please try again later',
      });
    },
  });

  return {
    register: registerMutation.mutateAsync,
    unregister: unregisterMutation.mutateAsync,
    isLoading: registerMutation.isPending || unregisterMutation.isPending,
    registerState: {
      isLoading: registerMutation.isPending,
      isError: registerMutation.isError,
      error: registerMutation.error,
      isSuccess: registerMutation.isSuccess,
    },
    unregisterState: {
      isLoading: unregisterMutation.isPending,
      isError: unregisterMutation.isError,
      error: unregisterMutation.error,
      isSuccess: unregisterMutation.isSuccess,
    },
  };
};
