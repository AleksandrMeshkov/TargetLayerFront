import { fetchWithAuthRetry } from './auth';

type ApiErrorResponse = {
  detail?: string;
};

export type RoadmapGoal = {
  goals_id: number;
  user_id: number;
  title: string;
  description?: string | null;
  created_at: string;
};

export type RoadmapTask = {
  task_id: number;
  title: string;
  description?: string | null;
  order_index: number;
  completed: boolean;
  completed_at?: string | null;
  created_at: string;
};

export type RoadmapItem = {
  roadmap_id: number;
  team_id?: number | null;
  goals_id: number;
  goal?: RoadmapGoal | null;
  tasks: RoadmapTask[];
  completed: boolean;
  created_at: string;
  updated_at: string;
};

export type TaskCreatePayload = {
  title: string;
  description?: string | null;
  order_index?: number;
};

export type TaskUpdatePayload = {
  title?: string | null;
  description?: string | null;
  order_index?: number | null;
  completed?: boolean | null;
};

export type GoalUpdatePayload = {
  title: string;
  description?: string | null;
};

export type GoalUpdateResponse = {
  status?: string;
  message?: string;
  detail?: string;
  goal?: {
    goals_id: number;
    title: string;
    description?: string | null;
  };
};

export type RoadmapsListResponse = {
  roadmaps: RoadmapItem[];
  total: number;
};

export type ShareRoadmapPayload = {
  team_id: number;
};

export type ShareRoadmapResponse = {
  status?: string;
  message?: string;
  detail?: string;
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

export async function getMyRoadmaps(): Promise<RoadmapsListResponse> {
  const response = await fetchWithAuthRetry('/api/v1/roadmaps/my-roadmaps', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(await parseError(response, 'Не удалось загрузить роудмапы'));
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
    throw new Error(await parseError(response, 'Не удалось загрузить задачи роудмапа'));
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
    throw new Error(await parseError(response, 'Не удалось загрузить роудмапы команды'));
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
    throw new Error(await parseError(response, 'Не удалось поделиться роудмапом с командой'));
  }

  return (await response.json()) as ShareRoadmapResponse;
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
    throw new Error(await parseError(response, 'Не удалось создать задачу'));
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
    throw new Error(await parseError(response, 'Не удалось обновить задачу'));
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
    throw new Error(await parseError(response, 'Не удалось удалить задачу'));
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
    throw new Error(await parseError(response, 'Не удалось обновить статус задачи'));
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
    throw new Error(await parseError(response, 'Не удалось обновить цель'));
  }

  return (await response.json()) as GoalUpdateResponse;
}
