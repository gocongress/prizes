import { fetchUtils, HttpError } from 'react-admin';

export const httpClient = async (url: string, options?: fetchUtils.Options) => {
  const token = localStorage.getItem('token');
  const headers = new Headers(options?.headers as HeadersInit);
  headers.set('Accept', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  try {
    const response = await fetchUtils.fetchJson(url, { ...(options || {}), headers });
    return response;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const error: { status: number; body: any } = err;
    const message = error?.body?.error?.message;
    if (message) {
      throw new HttpError(message, error.status);
    }
    throw new HttpError('Server error, please contact support.', error.status);
  }
};
