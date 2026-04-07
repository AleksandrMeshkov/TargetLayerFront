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
