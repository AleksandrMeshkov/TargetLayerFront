import { API_BASE_URL } from '../apiBase/apiBase';
import { parseApiError } from '../../utils/api/parseApiError';

export async function requestAuth<TResponse, TBody>(
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
    throw new Error(await parseApiError(response, 'Произошла ошибка при запросе к API'));
  }

  return (await response.json()) as TResponse;
}
