const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ?? (import.meta.env.DEV ? '' : 'https://targetl.site')
).replace(/\/$/, '');

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

export type ChangePasswordPayload = {
  old_password: string;
  new_password: string;
  confirm_password: string;
};

export type ChangePasswordResponse = {
  message: string;
  detail?: string;
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

export type SearchUser = {
  user_id: number;
  username: string;
  name: string;
  surname: string;
  patronymic?: string | null;
  avatar_url?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type UserSearchResponse = {
  users: SearchUser[];
  total: number;
};

export type TeamItem = {
  team_id: number;
  name: string;
  created_at: string;
};

export type MyTeamsResponse = {
  teams: TeamItem[];
  total: number;
};

export type CreateTeamPayload = {
  name: string;
};

export type RenameTeamPayload = {
  name: string;
};

export type ApiStatusResponse = {
  status?: string;
  message?: string;
  detail?: string;
};

export type TeamInviteEmailResponse = {
  status: string;
  email: string;
  team_id: number;
  expires_at: string;
};

export type TeamMemberItem = {
  id: number;
  team_id: number;
  user_id: number;
  team_role_id: number;
  joined_at: string;
};

export type TeamMembersResponse = {
  users: TeamMemberItem[];
  total: number;
};

const ACCESS_TOKEN_KEY = 'tl_access_token';
const REFRESH_TOKEN_KEY = 'tl_refresh_token';
const AUTH_FLAG_KEY = 'tl_auth';
let refreshAccessTokenPromise: Promise<string> | null = null;

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

async function getRefreshedAccessToken(): Promise<string> {
  if (!refreshAccessTokenPromise) {
    refreshAccessTokenPromise = (async () => {
      const tokens = await requestAuth<AuthTokens, undefined>('/api/v1/auth/refresh', undefined, 'POST');
      setAuthSession(tokens);
      return tokens.access_token;
    })().finally(() => {
      refreshAccessTokenPromise = null;
    });
  }

  return refreshAccessTokenPromise;
}

export async function fetchWithAuthRetry(endpoint: string, init: RequestInit): Promise<Response> {
  let token = localStorage.getItem(ACCESS_TOKEN_KEY);
  if (!token) {
    try {
      token = await getRefreshedAccessToken();
    } catch {
      clearAuthSession();
      throw new Error('Сессия истекла. Выполните вход снова.');
    }
  }

  const makeRequest = async (accessToken: string): Promise<Response> => {
    const headers = {
      ...(init.headers as Record<string, string> | undefined),
      'Authorization': `Bearer ${accessToken}`,
    };

    return fetch(`${API_BASE_URL}${endpoint}`, {
      ...init,
      headers,
      credentials: 'include',
    });
  };

  let response = await makeRequest(token);

  if (response.status === 401) {
    try {
      const refreshedAccessToken = await getRefreshedAccessToken();
      response = await makeRequest(refreshedAccessToken);
      if (response.status === 401) {
        clearAuthSession();
        throw new Error('Сессия истекла. Выполните вход снова.');
      }
    } catch {
      clearAuthSession();
      throw new Error('Сессия истекла. Выполните вход снова.');
    }
  }

  return response;
}

async function requestWithAuth<TResponse>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
): Promise<TResponse> {
  const response = await fetchWithAuthRetry(endpoint, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
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
  const formData = new FormData();
  // Пробуем разные имена поля - "avatar" более вероятнее чем "file"
  formData.append('avatar', file);

  const response = await fetchWithAuthRetry('/api/v1/user/profile', {
    method: 'PUT',
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
  const response = await fetchWithAuthRetry('/api/v1/user/name', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
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

export async function searchUsers(username: string, limit = 20): Promise<UserSearchResponse> {
  const normalizedUsername = username.trim();
  if (!normalizedUsername) {
    return { users: [], total: 0 };
  }

  const normalizedLimit = Math.max(1, Math.min(limit, 100));
  const query = new URLSearchParams({
    username: normalizedUsername,
    limit: String(normalizedLimit),
  });

  return requestWithAuth<UserSearchResponse>(`/api/v1/user/search?${query.toString()}`);
}

export async function changePassword(payload: ChangePasswordPayload): Promise<ChangePasswordResponse> {
  const response = await fetchWithAuthRetry('/api/v1/password/change', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let errorMessage = 'Произошла ошибка при смене пароля';
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

  return (await response.json()) as ChangePasswordResponse;
}

export async function getMyTeams(): Promise<MyTeamsResponse> {
  return requestWithAuth<MyTeamsResponse>('/api/v1/teams/my-teams');
}

export async function inviteUserByEmail(teamId: number, userId: number): Promise<TeamInviteEmailResponse> {
  const response = await fetchWithAuthRetry(`/api/v1/teams/${teamId}/invite-email`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ user_id: userId }),
  });

  if (!response.ok) {
    let errorMessage = 'Не удалось отправить приглашение';
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

  return (await response.json()) as TeamInviteEmailResponse;
}

export async function createTeam(payload: CreateTeamPayload): Promise<TeamItem> {
  const response = await fetchWithAuthRetry('/api/v1/teams', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let errorMessage = 'Не удалось создать команду';
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

  return (await response.json()) as TeamItem;
}

export async function getTeamMembers(teamId: number): Promise<TeamMembersResponse> {
  return requestWithAuth<TeamMembersResponse>(`/api/v1/teams/${teamId}/users`);
}

export async function getUserById(userId: number): Promise<UserProfile> {
  return requestWithAuth<UserProfile>(`/api/v1/user/${userId}`);
}

export async function renameTeam(teamId: number, payload: RenameTeamPayload): Promise<TeamItem> {
  const response = await fetchWithAuthRetry(`/api/v1/teams/${teamId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let errorMessage = 'Не удалось переименовать команду';
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

  return (await response.json()) as TeamItem;
}

export async function deleteTeam(teamId: number): Promise<ApiStatusResponse> {
  const response = await fetchWithAuthRetry(`/api/v1/teams/${teamId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    let errorMessage = 'Не удалось удалить команду';
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

  return (await response.json()) as ApiStatusResponse;
}
