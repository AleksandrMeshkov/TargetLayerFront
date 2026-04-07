import { parseApiError } from '../../utils/api/parseApiError';
import { fetchWithAuthRetry } from './fetchWithAuthRetry';

export async function requestWithAuth<TResponse>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' = 'GET',
  body?: unknown,
): Promise<TResponse> {
  const response = await fetchWithAuthRetry(endpoint, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response, 'Произошла ошибка при запросе к API'));
  }

  if (response.status === 204) {
    return undefined as TResponse;
  }

  return (await response.json()) as TResponse;
}
