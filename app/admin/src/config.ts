// Constants included in the build
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
export const OTP_CODE_LENGTH = Number.parseInt(import.meta.env.VITE_OTP_CODE_LENGTH || '8');

// Constants NOT included in the build
export const FEATURE_EMAIL_NEW_CODE_ENABLED = !!import.meta.env.FEATURE_EMAIL_NEW_CODE_ENABLED;
