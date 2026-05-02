import type { AuthTokens } from '../../types/authTypes/authTypes';

const ACCESS_TOKEN_KEY = 'tl_access_token';
const REFRESH_TOKEN_KEY = 'tl_refresh_token';
const AUTH_FLAG_KEY = 'tl_auth';

export function setAuthSession(tokens: AuthTokens): void {
  localStorage.setItem(AUTH_FLAG_KEY, '1');
  localStorage.setItem(ACCESS_TOKEN_KEY, tokens.access_token);

  if (tokens.refresh_token) {
    localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh_token);
  }
}

export function clearAuthSession(): void {
  localStorage.removeItem(AUTH_FLAG_KEY);
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export function isAuthenticatedSession(): boolean {
  return localStorage.getItem(AUTH_FLAG_KEY) === '1';
}

export function getStoredAccessToken(): string | null {
  const raw = localStorage.getItem(ACCESS_TOKEN_KEY);
  const normalized = raw?.trim();

  if (!normalized || normalized === 'null' || normalized === 'undefined') {
    return null;
  }

  return normalized;
}
