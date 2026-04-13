import { useCallback, useState } from 'react';
import { getMyChats } from '../../api/chat/chatClient';
import type { ChatListResponse } from '../../types/chatTypes/chatTypes';

export function useMyChats() {
  const [data, setData] = useState<ChatListResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMyChats = useCallback(async (): Promise<ChatListResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getMyChats();
      setData(response);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Не удалось загрузить чаты';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { data, isLoading, error, loadMyChats };
}
