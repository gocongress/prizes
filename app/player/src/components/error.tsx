import { Button } from '@/components/ui/button';
import { Link, useRouter, type ErrorComponentProps } from '@tanstack/react-router';
import { ClipboardX, Home, RefreshCw } from 'lucide-react';

export default function ErrorOops({ error, reset }: ErrorComponentProps) {
  const router = useRouter();

  const handleReset = () => {
    if (reset) {
      reset();
    } else {
      router.invalidate();
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md text-center">
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-red-50 p-4 dark:bg-red-950/20">
            <ClipboardX className="h-16 w-16 text-red-600 dark:text-red-500" strokeWidth={1.5} />
          </div>
        </div>

        <h1 className="mb-2 text-4xl font-bold tracking-tight text-red-900 dark:text-red-100">
          Oops!
        </h1>

        <p className="mb-4 text-lg text-red-700 dark:text-red-300">
          Something went wrong. We're sorry for the inconvenience.
        </p>

        {error && (
          <div className="mb-8 rounded-lg bg-red-50 p-4 dark:bg-red-950/20">
            <p className="text-sm text-red-800 dark:text-red-200 font-mono break-words">
              {error.message || 'An unexpected error occurred'}
            </p>
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button onClick={handleReset} size="lg" variant="default">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/">
              <Home className="mr-2 h-4 w-4" />
              Go to Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
