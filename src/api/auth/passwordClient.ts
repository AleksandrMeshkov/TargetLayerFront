import { fetchWithAuthRetry } from './fetchWithAuthRetry';
import { parseApiError } from '../../utils/api/parseApiError';
import { requestAuth } from './requestAuth';
import type { ApiStatusResponse, ChangePasswordPayload, ChangePasswordResponse } from '../../types/authTypes/authTypes';

export type PasswordForgotPayload = {
  email: string;
};

export type PasswordForgotResponse = {
  status: string;
  message: string;
  email: string;
};

export type PasswordRecoverPayload = {
  old_password: string;
  new_password: string;
  confirm_password: string;
};

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

export async function requestPasswordRecovery(payload: PasswordForgotPayload): Promise<PasswordForgotResponse> {
  return requestAuth<PasswordForgotResponse, PasswordForgotPayload>('/api/v1/password/forgot', payload, 'POST');
}

export async function recoverPassword(token: string, payload: PasswordRecoverPayload): Promise<ApiStatusResponse> {
  const normalizedToken = token.trim();
  if (!normalizedToken) {
    throw new Error('Отсутствует токен восстановления пароля');
  }

  return requestAuth<ApiStatusResponse, PasswordRecoverPayload>(
    `/api/v1/password/recover?token=${encodeURIComponent(normalizedToken)}`,
    payload,
    'POST',
  );
}
