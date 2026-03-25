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

export type UpdateNamePayload = {
  name: string;
  surname: string;
  patronymic?: string;
};

export type UserProfile = {
  id?: string;
  user_id?: number;
  name: string;
  surname: string;
  patronymic?: string | null;
  email?: string;
  avatar_url?: string | null;
  username?: string;
  created_at?: string;
  updated_at?: string;
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

async function requestWithAuth<TResponse>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
): Promise<TResponse> {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  if (!token) {
    throw new Error('Токен авторизации не найден');
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    credentials: 'include',
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

export async function getCurrentProfile(): Promise<UserProfile> {
  return requestWithAuth<UserProfile>('/api/v1/user/me');
}

export async function updateUserProfile(file: File): Promise<UserProfile> {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  if (!token) {
    throw new Error('Токен авторизации не найден');
  }

  const formData = new FormData();
  // Пробуем разные имена поля - "avatar" более вероятнее чем "file"
  formData.append('avatar', file);

  const response = await fetch(`${API_BASE_URL}/api/v1/user/profile`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    credentials: 'include',
    body: formData,
  });

  if (!response.ok) {
    let errorMessage = 'Произошла ошибка при загрузке фото';
    let details = '';
    try {
      const errorPayload = (await response.json()) as ApiErrorResponse;
      if (errorPayload?.detail) {
        errorMessage = errorPayload.detail;
      }
      details = JSON.stringify(errorPayload);
    } catch {
      errorMessage = `Ошибка ${response.status}`;
    }
    console.error('Ошибка загрузки фото:', { status: response.status, details });
    throw new Error(errorMessage);
  }

  const data = (await response.json()) as UserProfile;
  console.log('Ответ от сервера при загрузке фото:', JSON.stringify(data, null, 2));
  return data;
}

export async function updateUserName(payload: UpdateNamePayload): Promise<UserProfile> {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  if (!token) {
    throw new Error('Токен авторизации не найден');
  }

  const response = await fetch(`${API_BASE_URL}/api/v1/user/name`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let errorMessage = 'Произошла ошибка при обновлении ФИО';
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

  return (await response.json()) as UserProfile;
}
