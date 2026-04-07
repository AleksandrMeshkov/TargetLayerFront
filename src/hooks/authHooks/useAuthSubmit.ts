import { useCallback, useState } from 'react';
import { loginUser, registerUser } from '../../api/auth/client';
import { setAuthSession } from '../../api/auth/session';
import type { AuthTokens, LoginPayload, RegisterPayload } from '../../types/authTypes/authTypes';

export function useAuthSubmit() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async (fn: () => Promise<AuthTokens>): Promise<AuthTokens> => {
    setIsLoading(true);
    setError(null);

    try {
      const tokens = await fn();
      setAuthSession(tokens);
      return tokens;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Не удалось выполнить вход';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback((payload: LoginPayload) => run(() => loginUser(payload)), [run]);
  const register = useCallback((payload: RegisterPayload) => run(() => registerUser(payload)), [run]);

  return { login, register, isLoading, error };
}
