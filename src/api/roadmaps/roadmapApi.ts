import { fetchWithAuthRetry } from '../auth/fetchWithAuthRetry';
import { parseApiError } from '../../utils/api/parseApiError';
import type { GoalUpdatePayload, GoalUpdateResponse, RoadmapItem, RoadmapTask, RoadmapsListResponse, ShareRoadmapPayload, ShareRoadmapResponse, TaskCreatePayload, TaskUpdatePayload,
} from '../../types/roadmapsTypes/roadmapsTypes';

export async function getMyRoadmaps(): Promise<RoadmapsListResponse> {
  const response = await fetchWithAuthRetry('/api/v1/roadmaps/my-roadmaps', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response, 'Не удалось загрузить роудмапы'));
  }

  return (await response.json()) as RoadmapsListResponse;
}

export async function getRoadmapTasks(roadmapId: number): Promise<RoadmapTask[]> {
  const response = await fetchWithAuthRetry(`/api/v1/roadmaps/${roadmapId}/tasks`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response, 'Не удалось загрузить задачи роудмапа'));
  }

  return (await response.json()) as RoadmapTask[];
}

export async function getRoadmapsByTeam(teamId: number): Promise<RoadmapsListResponse> {
  const response = await fetchWithAuthRetry(`/api/v1/roadmaps/team/${teamId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response, 'Не удалось загрузить роудмапы команды'));
  }

  return (await response.json()) as RoadmapsListResponse;
}

export async function shareRoadmapToTeam(
  roadmapId: number,
  payload: ShareRoadmapPayload,
): Promise<ShareRoadmapResponse> {
  const response = await fetchWithAuthRetry(`/api/v1/roadmaps/${roadmapId}/share-to-team`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response, 'Не удалось поделиться роудмапом с командой'));
  }

  return (await response.json()) as ShareRoadmapResponse;
}

export async function copyRoadmap(roadmapId: number): Promise<RoadmapItem> {
  const response = await fetchWithAuthRetry(`/api/v1/roadmaps/${roadmapId}/copy`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response, 'Не удалось скопировать роудмап'));
  }

  return (await response.json()) as RoadmapItem;
}

export async function createRoadmapTask(
  roadmapId: number,
  payload: TaskCreatePayload,
): Promise<RoadmapTask> {
  const response = await fetchWithAuthRetry(`/api/v1/roadmaps/${roadmapId}/tasks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response, 'Не удалось создать задачу'));
  }

  return (await response.json()) as RoadmapTask;
}

export async function updateRoadmapTask(
  roadmapId: number,
  taskId: number,
  payload: TaskUpdatePayload,
): Promise<RoadmapTask> {
  const response = await fetchWithAuthRetry(`/api/v1/roadmaps/${roadmapId}/tasks/${taskId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response, 'Не удалось обновить задачу'));
  }

  return (await response.json()) as RoadmapTask;
}

export async function deleteRoadmapTask(roadmapId: number, taskId: number): Promise<void> {
  const response = await fetchWithAuthRetry(`/api/v1/roadmaps/${roadmapId}/tasks/${taskId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response, 'Не удалось удалить задачу'));
  }
}

export async function setRoadmapTaskComplete(
  roadmapId: number,
  taskId: number,
  completed: boolean,
): Promise<RoadmapTask> {
  const response = await fetchWithAuthRetry(
    `/api/v1/roadmaps/${roadmapId}/tasks/${taskId}/complete?completed=${encodeURIComponent(String(completed))}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );

  if (!response.ok) {
    throw new Error(await parseApiError(response, 'Не удалось обновить статус задачи'));
  }

  return (await response.json()) as RoadmapTask;
}

export async function updateRoadmapGoal(
  roadmapId: number,
  payload: GoalUpdatePayload,
): Promise<GoalUpdateResponse> {
  const response = await fetchWithAuthRetry(`/api/v1/roadmaps/${roadmapId}/goal`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response, 'Не удалось обновить цель'));
  }

  return (await response.json()) as GoalUpdateResponse;
}

export async function deleteRoadmap(roadmapId: number): Promise<void> {
  const response = await fetchWithAuthRetry(`/api/v1/roadmaps/${roadmapId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response, 'Не удалось удалить роудмап'));
  }
}
