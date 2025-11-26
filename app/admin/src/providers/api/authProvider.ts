import { API_URL } from '@/config';
import { HttpError } from 'react-admin';

export const authProvider = {
  async login({ email, password }: { email: string; password: string }) {
    try {
      localStorage.removeItem('token');
      const response = await fetch(`${API_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, oneTimePass: password }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (errorData.error?.message && errorData.error?.code) {
          throw new HttpError(errorData.error.message, errorData.error.code);
        }

        if (response.status === 500) {
          throw new HttpError(
            'Server error during login, please try again later.',
            response.status,
          );
        }
        throw new HttpError('Invalid email or code.', response.status);
      }

      const json = await response.json();
      const {
        data: { token, isAdmin },
      } = json;

      if (!isAdmin) {
        throw new HttpError('Unauthorized', 401);
      }

      const profileResponse = await fetch(`${API_URL}/api/v1/auth/profile`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      });

      if (!profileResponse.ok) {
        const errorData = await profileResponse.json().catch(() => ({}));
        if (errorData.error?.message && errorData.error?.code) {
          throw new HttpError(errorData.error.message, errorData.error.code);
        }

        if (profileResponse.status === 500) {
          throw new HttpError(
            'Server error during login, please try again later.',
            profileResponse.status,
          );
        }
        throw new HttpError('Invalid user.', profileResponse.status);
      }

      localStorage.setItem('token', token);
    } catch (error) {
      if (error instanceof HttpError) {
        throw error;
      }
      throw new HttpError('Server error during login, please try again later.', 500);
    }
  },
  async logout() {},
  async checkError(error: unknown) {
    const status = (error as HttpError).status;
    if (status === 401 || status === 403) {
      localStorage.removeItem('token');
      throw new HttpError('Unauthorized.', status);
    }
  },
  async checkAuth() {
    const token = localStorage.getItem('token');

    if (!token) {
      throw new HttpError('Unauthorized', 401);
    }
  },
  async getOtp({ email }: { email: string }): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/api/v1/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (errorData.error?.message && errorData.error?.code) {
          throw new HttpError(errorData.error.message, errorData.error.code);
        }

        throw new HttpError(
          'Server error during one-time pass, please try again later.',
          response.status,
        );
      }
      return true;
    } catch (error) {
      if (error instanceof HttpError) {
        throw error;
      }
      throw new HttpError('Server error during one-time pass, please try again later.', 500);
    }
  },
};
