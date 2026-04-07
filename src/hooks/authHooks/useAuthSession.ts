import { useCallback } from 'react';
import { clearAuthSession, isAuthenticatedSession } from '../../api/auth/session';

export function useAuthSession() {
  const logoutLocal = useCallback(() => {
    clearAuthSession();
  }, []);

  const isLoggedIn = useCallback(() => isAuthenticatedSession(), []);

  return { logoutLocal, isLoggedIn };
}
