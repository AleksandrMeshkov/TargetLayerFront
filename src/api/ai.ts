import { fetchWithAuthRetry } from './auth';

type ApiErrorResponse = {
  detail?: string;
};

export type AITaskResponse = {
  title: string;
  description?: string | null;
  order_index: number;
  deadline_offset_days: number;
};

export type AIRoadmapResponse = {
  goal_title: string;
  goal_description?: string | null;
  tasks: AITaskResponse[];
};

export type AIChatPayload = {
  prompt: string;
  conversation_id?: number;
};

export type AIHistoryMessage = {
  message_id: number;
  role: 'user' | 'assistant' | string;
  content: string;
  created_at: string;
};

export type AIHistoryConversation = {
  conversation_id: number;
  created_at: string;
  updated_at: string;
  messages: AIHistoryMessage[];
};

export type AIConversationItem = {
  conversation_id: number;
  created_at: string;
  updated_at: string;
};

export type AIDeleteConversationResponse = {
  status: string;
  conversation_id: number;
};

async function parseError(response: Response, fallbackMessage: string): Promise<string> {
  let errorMessage = fallbackMessage;
  try {
    const errorPayload = (await response.json()) as ApiErrorResponse;
    if (errorPayload?.detail) {
      errorMessage = errorPayload.detail;
    }
  } catch {
    errorMessage = `Ошибка ${response.status}`;
  }
  return errorMessage;
}

export async function aiChat(payload: AIChatPayload): Promise<AIRoadmapResponse> {
  const response = await fetchWithAuthRetry('/api/v1/ai/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const message = await parseError(response, 'Не удалось получить ответ AI');
    throw new Error(message);
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
    const message = await parseError(response, 'Не удалось загрузить историю чатов');
    throw new Error(message);
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
    const message = await parseError(response, 'Не удалось получить список чатов');
    throw new Error(message);
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
    const message = await parseError(response, 'Не удалось создать новый чат');
    throw new Error(message);
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
    const message = await parseError(response, 'Не удалось удалить чат');
    throw new Error(message);
  }

  return (await response.json()) as AIDeleteConversationResponse;
}
