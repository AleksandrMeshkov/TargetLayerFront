import { useCallback, useState } from 'react';
import { getCurrentProfile } from '../../api/auth/userClient';
import type { UserProfile } from '../../types/authTypes/authTypes';

export function useProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = useCallback(async (): Promise<UserProfile> => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await getCurrentProfile();
      setProfile(data);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Не удалось загрузить профиль';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { profile, isLoading, error, loadProfile };
}
