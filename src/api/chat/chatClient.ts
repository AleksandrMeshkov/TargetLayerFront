import { requestWithAuth } from '../auth/requestWithAuth';
import type {
  ChatCreatePayload,
  ChatListResponse,
  ChatParticipantsListResponse,
  ChatResponse,
  MessageCreatePayload,
  MessageResponse,
  MessagesListResponse,
} from '../../types/chatTypes/chatTypes';

export async function createChat(payload: ChatCreatePayload): Promise<ChatResponse> {
  return requestWithAuth<ChatResponse>('/api/v1/chats', 'POST', payload);
}

export async function getMyChats(): Promise<ChatListResponse> {
  return requestWithAuth<ChatListResponse>('/api/v1/chats/my');
}

export async function getOrCreateTeamChat(teamId: number): Promise<ChatResponse> {
  return requestWithAuth<ChatResponse>(`/api/v1/chats/team/${teamId}`, 'POST');
}

export async function getChatMessages(chatId: number): Promise<MessagesListResponse> {
  return requestWithAuth<MessagesListResponse>(`/api/v1/chats/${chatId}/messages`);
}

export async function getChatParticipants(chatId: number): Promise<ChatParticipantsListResponse> {
  return requestWithAuth<ChatParticipantsListResponse>(`/api/v1/chats/${chatId}/participants`);
}

export async function postChatMessage(chatId: number, payload: MessageCreatePayload): Promise<MessageResponse> {
  return requestWithAuth<MessageResponse>(`/api/v1/chats/${chatId}/messages`, 'POST', payload);
}

export async function deleteChatMessage(chatId: number, messageId: number): Promise<{ status: string; message: string }> {
  return requestWithAuth<{ status: string; message: string }>(`/api/v1/chats/${chatId}/messages/${messageId}`, 'DELETE');
}

export async function leaveChat(chatId: number): Promise<{ status: string; message: string }> {
  return requestWithAuth<{ status: string; message: string }>(`/api/v1/chats/${chatId}/leave`, 'DELETE');
}
