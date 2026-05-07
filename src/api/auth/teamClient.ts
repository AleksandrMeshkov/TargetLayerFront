import { fetchWithAuthRetry } from './fetchWithAuthRetry';
import { parseApiError } from '../../utils/api/parseApiError';
import { requestWithAuth } from './requestWithAuth';
import type { ApiStatusResponse, CreateTeamPayload, MyTeamsResponse, RenameTeamPayload, TeamInviteEmailResponse, TeamItem, TeamMembersResponse, TeamMemberItem } from '../../types/authTypes/authTypes';

export async function getMyTeams(): Promise<MyTeamsResponse> {
  return requestWithAuth<MyTeamsResponse>('/api/v1/teams/my-teams');
}

export async function inviteUserByEmail(teamId: number, userId: number): Promise<TeamInviteEmailResponse> {
  const response = await fetchWithAuthRetry(`/api/v1/teams/${teamId}/invite-email`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ user_id: userId }),
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response, 'Не удалось отправить приглашение'));
  }

  return (await response.json()) as TeamInviteEmailResponse;
}

export async function createTeam(payload: CreateTeamPayload): Promise<TeamItem> {
  const response = await fetchWithAuthRetry('/api/v1/teams', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response, 'Не удалось создать команду'));
  }

  return (await response.json()) as TeamItem;
}

export async function getTeamMembers(teamId: number): Promise<TeamMembersResponse> {
  return requestWithAuth<TeamMembersResponse>(`/api/v1/teams/${teamId}/users`);
}

export async function renameTeam(teamId: number, payload: RenameTeamPayload): Promise<TeamItem> {
  const response = await fetchWithAuthRetry(`/api/v1/teams/${teamId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response, 'Не удалось переименовать команду'));
  }

  return (await response.json()) as TeamItem;
}

export async function deleteTeam(teamId: number): Promise<ApiStatusResponse> {
  const response = await fetchWithAuthRetry(`/api/v1/teams/${teamId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response, 'Не удалось удалить команду'));
  }

  return (await response.json()) as ApiStatusResponse;
}

export async function leaveTeam(teamId: number): Promise<ApiStatusResponse> {
  const response = await fetchWithAuthRetry(`/api/v1/teams/${teamId}/leave`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response, 'Не удалось выйти из команды'));
  }

  return (await response.json()) as ApiStatusResponse;
}

export async function updateMemberRole(teamId: number, userId: number, roleId: number): Promise<TeamMemberItem> {
  const response = await fetchWithAuthRetry(`/api/v1/teams/${teamId}/users/${userId}/role`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ role_id: roleId }),
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response, 'Не удалось обновить роль участника'));
  }

  return (await response.json()) as TeamMemberItem;
}
