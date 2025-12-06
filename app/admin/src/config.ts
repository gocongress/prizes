// Constants included in the build
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
export const OTP_CODE_LENGTH = Number.parseInt(import.meta.env.VITE_OTP_CODE_LENGTH || '8');
export const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY;

// Constants NOT included in the build
export const APP_BASENAME = import.meta.env.APP_BASENAME || '/';
