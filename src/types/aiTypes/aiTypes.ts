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
