import { useCallback, useState } from 'react';
import { getRoadmapTasks } from '../../api/roadmaps/roadmapApi';
import type { RoadmapTask } from '../../types/roadmapsTypes/roadmapsTypes';

export function useRoadmapTasks() {
  const [tasks, setTasks] = useState<RoadmapTask[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTasks = useCallback(async (roadmapId: number): Promise<RoadmapTask[]> => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await getRoadmapTasks(roadmapId);
      setTasks(data);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Не удалось загрузить задачи роудмапа';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { tasks, isLoading, error, loadTasks };
}
