import { API_BASE_URL } from '../apiBase/apiBase';
import { clearAuthSession, getStoredAccessToken, setAuthSession } from './session';
import { requestAuth } from './requestAuth';
import type { AuthTokens } from '../../types/authTypes/authTypes';


let refreshAccessTokenPromise: Promise<string> | null = null;

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
  let token = getStoredAccessToken();

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
