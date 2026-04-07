import { useCallback, useState } from 'react';
import { createRoadmapTask, deleteRoadmapTask, setRoadmapTaskComplete, shareRoadmapToTeam, updateRoadmapGoal, updateRoadmapTask } from '../../api/roadmaps/roadmapApi';
import type { GoalUpdatePayload, GoalUpdateResponse, RoadmapTask, ShareRoadmapPayload, ShareRoadmapResponse, TaskCreatePayload, TaskUpdatePayload,
} from '../../types/roadmapsTypes/roadmapsTypes';

export function useRoadmapActions() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async <T,>(fn: () => Promise<T>): Promise<T> => {
    setIsLoading(true);
    setError(null);

    try {
      return await fn();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Не удалось выполнить действие';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createTask = useCallback((roadmapId: number, payload: TaskCreatePayload) => (
    run(() => createRoadmapTask(roadmapId, payload))
  ), [run]);

  const updateTask = useCallback((roadmapId: number, taskId: number, payload: TaskUpdatePayload) => (
    run(() => updateRoadmapTask(roadmapId, taskId, payload))
  ), [run]);

  const removeTask = useCallback((roadmapId: number, taskId: number) => (
    run(() => deleteRoadmapTask(roadmapId, taskId))
  ), [run]);

  const setComplete = useCallback((roadmapId: number, taskId: number, completed: boolean) => (
    run(() => setRoadmapTaskComplete(roadmapId, taskId, completed))
  ), [run]);

  const updateGoal = useCallback((roadmapId: number, payload: GoalUpdatePayload): Promise<GoalUpdateResponse> => (
    run(() => updateRoadmapGoal(roadmapId, payload))
  ), [run]);

  const shareToTeam = useCallback((roadmapId: number, payload: ShareRoadmapPayload): Promise<ShareRoadmapResponse> => (
    run(() => shareRoadmapToTeam(roadmapId, payload))
  ), [run]);

  return {
    isLoading,
    error,
    createTask,
    updateTask,
    removeTask,
    setComplete,
    updateGoal,
    shareToTeam,
  };
}
