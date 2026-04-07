import { fetchWithAuthRetry } from './fetchWithAuthRetry';
import { parseApiError } from '../../utils/api/parseApiError';
import type { ChangePasswordPayload, ChangePasswordResponse } from '../../types/authTypes/authTypes';

export async function changePassword(payload: ChangePasswordPayload): Promise<ChangePasswordResponse> {
  const response = await fetchWithAuthRetry('/api/v1/password/change', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response, 'Произошла ошибка при смене пароля'));
  }

  return (await response.json()) as ChangePasswordResponse;
}
