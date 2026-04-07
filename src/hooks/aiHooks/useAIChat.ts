import { useCallback, useState } from 'react';
import { aiChat } from '../../api/ai/aiChatClient';
import type { AIChatPayload, AIRoadmapResponse } from '../../types/aiTypes/aiTypes';

export function useAIChat() {
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(async (payload: AIChatPayload): Promise<AIRoadmapResponse> => {
    setIsSending(true);
    setError(null);

    try {
      return await aiChat(payload);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Не удалось получить ответ AI';
      setError(message);
      throw err;
    } finally {
      setIsSending(false);
    }
  }, []);

  const resetError = useCallback(() => setError(null), []);

  return { sendMessage, isSending, error, resetError };
}
