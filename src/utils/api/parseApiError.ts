export type ApiErrorResponse = {
  detail?: string;
};

export async function parseApiError(response: Response, fallbackMessage: string): Promise<string> {
  let errorMessage = fallbackMessage;

  try {
    const payload = (await response.json()) as ApiErrorResponse;
    if (payload?.detail) {
      errorMessage = payload.detail;
    }
  } catch {
    errorMessage = `Ошибка ${response.status}`;
  }

  return errorMessage;
}
