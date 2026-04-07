import { fetchWithAuthRetry } from '../auth/fetchWithAuthRetry';
import { parseApiError } from '../../utils/api/parseApiError';
import type { AIDeleteConversationResponse, AIChatPayload, AIConversationItem, AIHistoryConversation, AIRoadmapResponse,
} from '../../types/aiTypes/aiTypes';

export async function aiChat(payload: AIChatPayload): Promise<AIRoadmapResponse> {
  const response = await fetchWithAuthRetry('/api/v1/ai/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response, 'Не удалось получить ответ AI'));
  }

  return (await response.json()) as AIRoadmapResponse;
}

export async function getAIHistory(): Promise<AIHistoryConversation[]> {
  const response = await fetchWithAuthRetry('/api/v1/ai/history', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response, 'Не удалось загрузить историю чатов'));
  }

  return (await response.json()) as AIHistoryConversation[];
}

export async function getAIConversations(): Promise<AIConversationItem[]> {
  const response = await fetchWithAuthRetry('/api/v1/ai/conversations', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response, 'Не удалось получить список чатов'));
  }

  return (await response.json()) as AIConversationItem[];
}

export async function createAIConversation(): Promise<number> {
  const response = await fetchWithAuthRetry('/api/v1/ai/conversations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response, 'Не удалось создать новый чат'));
  }

  const data = (await response.json()) as { conversation_id: number };
  return data.conversation_id;
}

export async function deleteAIConversation(conversationId: number): Promise<AIDeleteConversationResponse> {
  const response = await fetchWithAuthRetry(`/api/v1/ai/conversations/${conversationId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response, 'Не удалось удалить чат'));
  }

  return (await response.json()) as AIDeleteConversationResponse;
}
