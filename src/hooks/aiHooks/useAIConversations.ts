import { useCallback, useState } from 'react';
import { getAIConversations } from '../../api/ai/aiChatClient';
import type { AIConversationItem } from '../../types/aiTypes/aiTypes';

export function useAIConversations() {
  const [conversations, setConversations] = useState<AIConversationItem[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadConversations = useCallback(async (): Promise<AIConversationItem[]> => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await getAIConversations();
      setConversations(data);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Не удалось получить список чатов';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { conversations, isLoading, error, loadConversations };
}
