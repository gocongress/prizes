import { toast } from 'sonner';

export interface ToastOptions {
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * React hook that provides toast notification methods
 *
 * @returns Toast methods for displaying different types of notifications
 *
 * @example
 * ```tsx
 * const toast = useToast();
 *
 * // Simple success message
 * toast.success('User created successfully');
 *
 * // Message with description
 * toast.error('Login failed', {
 *   description: 'Invalid email or password'
 * });
 *
 * // Message with action button
 * toast.info('New update available', {
 *   action: {
 *     label: 'Update',
 *     onClick: () => window.location.reload()
 *   }
 * });
 *
 * // Custom duration (in milliseconds)
 * toast.warning('Session expiring soon', {
 *   duration: 5000
 * });
 *
 * // Loading state
 * const toastId = toast.loading('Processing...');
 * // Later update it:
 * toast.success('Complete!', { id: toastId });
 * ```
 */
export const useToast = () => {
  return {
    /**
     * Display a success toast message
     */
    success: (message: string, options?: ToastOptions) => {
      return toast.success(message, {
        description: options?.description,
        duration: options?.duration,
        action: options?.action,
      });
    },

    /**
     * Display an error toast message
     */
    error: (message: string, options?: ToastOptions) => {
      return toast.error(message, {
        description: options?.description,
        duration: options?.duration,
        action: options?.action,
      });
    },

    /**
     * Display an info toast message
     */
    info: (message: string, options?: ToastOptions) => {
      return toast.info(message, {
        description: options?.description,
        duration: options?.duration,
        action: options?.action,
      });
    },

    /**
     * Display a warning toast message
     */
    warning: (message: string, options?: ToastOptions) => {
      return toast.warning(message, {
        description: options?.description,
        duration: options?.duration,
        action: options?.action,
      });
    },

    /**
     * Display a loading toast message
     * Returns a toast ID that can be used to update or dismiss the toast
     */
    loading: (message: string, options?: Omit<ToastOptions, 'action'>) => {
      return toast.loading(message, {
        description: options?.description,
        duration: options?.duration,
      });
    },

    /**
     * Display a promise toast that automatically updates based on promise state
     */
    promise: <T,>(
      promise: Promise<T>,
      messages: {
        loading: string;
        success: string | ((data: T) => string);
        error: string | ((error: Error) => string);
      }
    ) => {
      return toast.promise(promise, messages);
    },

    /**
     * Display a custom toast message
     */
    custom: (message: string, options?: ToastOptions) => {
      return toast(message, {
        description: options?.description,
        duration: options?.duration,
        action: options?.action,
      });
    },

    /**
     * Dismiss a specific toast by ID, or all toasts if no ID provided
     */
    dismiss: (toastId?: string | number) => {
      return toast.dismiss(toastId);
    },
  };
};
