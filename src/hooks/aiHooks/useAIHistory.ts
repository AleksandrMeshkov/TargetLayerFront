import { useCallback, useState } from 'react';
import { getAIHistory } from '../../api/ai/aiChatClient';
import type { AIHistoryConversation } from '../../types/aiTypes/aiTypes';

export function useAIHistory() {
  const [history, setHistory] = useState<AIHistoryConversation[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadHistory = useCallback(async (): Promise<AIHistoryConversation[]> => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await getAIHistory();
      setHistory(data);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Не удалось загрузить историю чатов';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { history, isLoading, error, loadHistory };
}
