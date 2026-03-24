const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? 'https://targetl.site').replace(/\/$/, '');

type ApiErrorResponse = {
  detail?: string;
};

export type AuthTokens = {
  access_token: string;
  refresh_token?: string | null;
  token_type: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  username: string;
  name: string;
  surname: string;
  patronymic?: string;
  email: string;
  password: string;
};

const ACCESS_TOKEN_KEY = 'tl_access_token';
const AUTH_FLAG_KEY = 'tl_auth';

async function requestAuth<TResponse, TBody>(
  endpoint: string,
  body?: TBody,
  method: 'POST' | 'GET' = 'POST',
): Promise<TResponse> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    let errorMessage = 'Произошла ошибка при запросе к API';
    try {
      const errorPayload = (await response.json()) as ApiErrorResponse;
      if (errorPayload?.detail) {
        errorMessage = errorPayload.detail;
      }
    } catch {
      errorMessage = `Ошибка ${response.status}`;
    }
    throw new Error(errorMessage);
  }

  return (await response.json()) as TResponse;
}

export async function loginUser(payload: LoginPayload): Promise<AuthTokens> {
  return requestAuth<AuthTokens, LoginPayload>('/api/v1/auth/login', payload);
}

export async function registerUser(payload: RegisterPayload): Promise<AuthTokens> {
  return requestAuth<AuthTokens, RegisterPayload>('/api/v1/auth/register', payload);
}

export async function logoutUser(): Promise<void> {
  await requestAuth<{ message: string }, undefined>('/api/v1/auth/logout');
}

export function setAuthSession(tokens: AuthTokens): void {
  localStorage.setItem(AUTH_FLAG_KEY, '1');
  localStorage.setItem(ACCESS_TOKEN_KEY, tokens.access_token);
}

export function clearAuthSession(): void {
  localStorage.removeItem(AUTH_FLAG_KEY);
  localStorage.removeItem(ACCESS_TOKEN_KEY);
}

export function isAuthenticatedSession(): boolean {
  return localStorage.getItem(AUTH_FLAG_KEY) === '1' && Boolean(localStorage.getItem(ACCESS_TOKEN_KEY));
}
