import type { Context } from '@/types';

export const parseSqlError = (context: Context, error: unknown) => {
  const err = error as any;
  if (err.code) {
    context.logger.error({
      error: { code: err.code, routine: err.routine, detail: err.detail, message: err.message },
    });
    if (err.detail?.includes('already exists')) {
      return 'Database error, duplicate found.';
    } else {
      return 'Database error, please try again or contact support.';
    }
  }
  return err.message;
};
