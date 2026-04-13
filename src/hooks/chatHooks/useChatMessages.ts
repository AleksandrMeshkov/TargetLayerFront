import { useCallback, useState } from 'react';
import { getChatMessages } from '../../api/chat/chatClient';
import type { MessagesListResponse } from '../../types/chatTypes/chatTypes';

export function useChatMessages() {
  const [data, setData] = useState<MessagesListResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMessages = useCallback(async (chatId: number): Promise<MessagesListResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getChatMessages(chatId);
      setData(response);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Не удалось загрузить сообщения';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { data, isLoading, error, loadMessages, setData };
}
