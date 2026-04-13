export type ChatCreatePayload = {
  team_id: number;
  participant_user_ids: number[];
  name?: string | null;
};

export type ChatResponse = {
  chat_id: number;
  team_id: number;
  type: string;
  name?: string | null;
  created_at: string;
};

export type ChatListResponse = {
  chats: ChatResponse[];
  total: number;
};

export type MessageCreatePayload = {
  content: string;
  type?: string;
};

export type MessageResponse = {
  message_id: number;
  chat_id: number;
  user_id: number;
  type: string;
  content: string;
  created_at: string;
};

export type MessagesListResponse = {
  messages: MessageResponse[];
  total: number;
};

export type ChatParticipantResponse = {
  id: number;
  chat_id: number;
  user_id: number;
  joined_at: string;
};

export type ChatParticipantsListResponse = {
  participants: ChatParticipantResponse[];
  total: number;
};
