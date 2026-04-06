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
