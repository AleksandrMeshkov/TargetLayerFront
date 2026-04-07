import { fetchWithAuthRetry } from './fetchWithAuthRetry';
import { parseApiError } from '../../utils/api/parseApiError';
import { requestWithAuth } from './requestWithAuth';
import type { UpdateNamePayload, UserProfile, UserSearchResponse } from '../../types/authTypes/authTypes';

export async function getCurrentProfile(): Promise<UserProfile> {
  return requestWithAuth<UserProfile>('/api/v1/user/me');
}

export async function updateUserProfile(file: File): Promise<UserProfile> {
  const formData = new FormData();
  formData.append('avatar', file);

  const response = await fetchWithAuthRetry('/api/v1/user/profile', {
    method: 'PUT',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response, 'Произошла ошибка при загрузке фото'));
  }

  return (await response.json()) as UserProfile;
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
    throw new Error(await parseApiError(response, 'Произошла ошибка при обновлении ФИО'));
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

export async function getUserById(userId: number): Promise<UserProfile> {
  return requestWithAuth<UserProfile>(`/api/v1/user/${userId}`);
}
