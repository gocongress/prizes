import { env } from '@/env';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export interface Player {
  agaId: string;
  id: string;
  name: string;
  rank: number;
  userId: User['id']
}

export interface User {
  id: string;
  kind: 'user';
  email: string;
  token?: string;
  isAdmin: boolean;
  players?: Player[]
}

interface CreateUserInput {
  email: string;
  verificationToken?: string;
}

interface LoginUserInput {
  email: string;
  oneTimePass: string;
  verificationToken?: string;
}

interface ApiResponse<T> {
  data: T;
  api: {
    version: string;
  };
}

const API_URL = env.VITE_API_URL;

/**
 * React hook that provides authentication methods and state
 *
 * @returns Authentication state and methods
 *
 * @example
 * ```tsx
 * const { user, isAuthenticated, isLoading, createUser, login, logout } = useAuth();
 *
 * // Create a new user
 * await createUser({ email: 'user@example.com' });
 *
 * // Login with one-time password
 * await login({ email: 'user@example.com', oneTimePass: '123456' });
 *
 * // Logout
 * await logout();
 * ```
 */
export const useAuth = () => {
  const toast = useToast();
  const queryClient = useQueryClient();

  // Profile query
  const profileQuery = useQuery({
    queryKey: ['profile'],
    queryFn: async (): Promise<User> => {
      const response = await fetch(`${API_URL}/api/v1/auth/profile`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Not authenticated');
      }

      const result: ApiResponse<User> = await response.json();
      return result.data;
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!localStorage.getItem('token'),
    // throwOnError: true,
  });

  // Attempt to create a user by email address if they don't already exist, this
  // causes the API server to send a new OTP to the user in all cases.
  const createUserMutation = useMutation({
    mutationFn: async (input: CreateUserInput): Promise<User> => {
      const response = await fetch(`${API_URL}/api/v1/users`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'cf-turnstile-response': input.verificationToken || '',
        },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to create user');
      }

      const result: ApiResponse<User> = await response.json();
      return result.data;
    },
    onSuccess: (data) => {
      toast.success('', {
        description: `A one-time password has been sent to ${data.email}`,
        duration: 7000
      });
    },
    onError: (error) => {
      toast.error('', {
        description: error.message || 'Please try again later',
      });
    },
  });

  // Log the user in with provided email address and OTP, enable the profile query
  // and invalidate its cache so that fresh user profile data will be fetched.
  const loginMutation = useMutation({
    mutationFn: async (input: LoginUserInput): Promise<User> => {
      const response = await fetch(`${API_URL}/api/v1/auth/login`, {
        method: 'POST',
        credentials: 'include', // Important: include cookies
        headers: {
          'Content-Type': 'application/json',
          'cf-turnstile-response': input.verificationToken || '',
        },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to login');
      }

      const result: ApiResponse<User> = await response.json();
      return result.data;
    },
    onSuccess: (data) => {
      localStorage.setItem('token', data.token || 'logged-in');
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Welcome back!', {
        description: `Logged in as ${data.email}`,
      });
      window.location.replace('/dashboard');
    },
    onError: (error) => {
      toast.error('Login failed', {
        description: error.message || 'Invalid email or one-time password',
      });
    },
  });


  // Log the user out, disabling the profile query and clearing the query client cache
  // entirely.
  const logoutMutation = useMutation({
    mutationFn: async (): Promise<void> => {
      const response = await fetch(`${API_URL}/api/v1/auth/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to logout');
      }
    },
    onSuccess: () => {
      localStorage.removeItem('token');
      queryClient.clear();
      toast.success('Logged out successfully', {
        description: 'See you next time!',
      });
      window.location.replace('/login');
    },
    onError: (error) => {
      toast.error('Logout failed', {
        description: error.message || 'Please try again',
      });
    },
  });

  // Auth state
  const auth = {
    user: profileQuery.data,
    isAuthenticated: !!profileQuery.data,
    isLoading: profileQuery.isLoading,
    isError: profileQuery.isError,
    error: profileQuery.error,
  };

  return {
    // Auth state
    auth,
    user: auth.user,
    isAuthenticated: auth.isAuthenticated,

    // State derived from React Query cache
    isLoading:
      profileQuery.isLoading ||
      createUserMutation.isPending ||
      loginMutation.isPending ||
      logoutMutation.isPending,

    // Methods
    createUser: createUserMutation.mutateAsync,
    login: loginMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    refetchProfile: profileQuery.refetch,

    // Mutation states for granular loading/error handling
    createUserState: {
      isLoading: createUserMutation.isPending,
      isError: createUserMutation.isError,
      error: createUserMutation.error,
      isSuccess: createUserMutation.isSuccess,
    },
    loginState: {
      isLoading: loginMutation.isPending,
      isError: loginMutation.isError,
      error: loginMutation.error,
      isSuccess: loginMutation.isSuccess,
    },
    logoutState: {
      isLoading: logoutMutation.isPending,
      isError: logoutMutation.isError,
      error: logoutMutation.error,
      isSuccess: logoutMutation.isSuccess,
    },
  };
};
