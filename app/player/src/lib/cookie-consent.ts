/**
 * Cookie Consent Management
 *
 * Manages user consent for cookies in compliance with GDPR/CCPA regulations.
 * This utility provides functions to get, set, and check cookie consent preferences.
 */

export type CookieCategory = 'necessary' | 'functional' | 'analytics' | 'marketing';

export interface CookieConsent {
  necessary: boolean;      // Always true - required for app functionality
  functional: boolean;     // UI preferences like sidebar state
  analytics: boolean;      // Analytics and performance tracking
  marketing: boolean;      // Marketing and advertising cookies
  timestamp: number;       // When consent was given
}

const CONSENT_COOKIE_NAME = 'cookie_consent';
const CONSENT_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

/**
 * Default consent state - only necessary cookies enabled
 */
const DEFAULT_CONSENT: CookieConsent = {
  necessary: true,
  functional: false,
  analytics: false,
  marketing: false,
  timestamp: Date.now(),
};

/**
 * Parse a cookie string and return its value
 */
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;

  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);

  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }

  return null;
}

/**
 * Set a cookie with the given name, value, and max age
 */
function setCookie(name: string, value: string, maxAge: number): void {
  if (typeof document === 'undefined') return;

  document.cookie = `${name}=${value}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

/**
 * Delete a cookie by name
 */
function deleteCookie(name: string): void {
  if (typeof document === 'undefined') return;

  document.cookie = `${name}=; path=/; max-age=0`;
}

/**
 * Get the current cookie consent preferences
 */
export function getCookieConsent(): CookieConsent | null {
  const consentString = getCookie(CONSENT_COOKIE_NAME);

  if (!consentString) {
    return null;
  }

  try {
    const consent = JSON.parse(decodeURIComponent(consentString));
    return consent as CookieConsent;
  } catch {
    return null;
  }
}

/**
 * Save cookie consent preferences
 */
export function setCookieConsent(consent: Partial<CookieConsent>): void {
  const fullConsent: CookieConsent = {
    ...DEFAULT_CONSENT,
    ...consent,
    necessary: true, // Always true
    timestamp: Date.now(),
  };

  const consentString = encodeURIComponent(JSON.stringify(fullConsent));
  setCookie(CONSENT_COOKIE_NAME, consentString, CONSENT_COOKIE_MAX_AGE);
}

/**
 * Check if user has given consent (any response, accept or reject)
 */
export function hasConsentResponse(): boolean {
  return getCookieConsent() !== null;
}

/**
 * Check if a specific cookie category has been consented to
 */
export function hasCategoryConsent(category: CookieCategory): boolean {
  const consent = getCookieConsent();

  if (!consent) {
    // No consent given yet - only allow necessary cookies
    return category === 'necessary';
  }

  return consent[category] === true;
}

/**
 * Accept all cookies
 */
export function acceptAllCookies(): void {
  setCookieConsent({
    necessary: true,
    functional: true,
    analytics: true,
    marketing: true,
  });
}

/**
 * Reject all non-necessary cookies
 */
export function rejectAllCookies(): void {
  setCookieConsent({
    necessary: true,
    functional: false,
    analytics: false,
    marketing: false,
  });

  // Clean up any existing non-necessary cookies
  cleanupNonConsentedCookies();
}

/**
 * Reset consent (for testing or user-initiated reset)
 */
export function resetConsent(): void {
  deleteCookie(CONSENT_COOKIE_NAME);
}

/**
 * Clean up cookies that are no longer consented to
 */
function cleanupNonConsentedCookies(): void {
  const consent = getCookieConsent();

  if (!consent) return;

  // Remove sidebar state cookie if functional cookies not consented
  if (!consent.functional) {
    deleteCookie('sidebar_state');
  }

  // Add cleanup for other cookie categories as needed
}

/**
 * Check if we should show the cookie banner
 */
export function shouldShowCookieBanner(): boolean {
  return !hasConsentResponse();
}
