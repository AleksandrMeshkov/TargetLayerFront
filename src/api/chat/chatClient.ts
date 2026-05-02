import { requestWithAuth } from '../auth/requestWithAuth';
import type {
  ChatCreatePayload,
  ChatListResponse,
  ChatParticipantsListResponse,
  ChatResponse,
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

export async function getChatParticipants(chatId: number): Promise<ChatParticipantsListResponse> {
  return requestWithAuth<ChatParticipantsListResponse>(`/api/v1/chats/${chatId}/participants`);
}
