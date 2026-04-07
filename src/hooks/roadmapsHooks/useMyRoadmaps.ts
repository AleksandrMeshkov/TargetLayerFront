import { useCallback, useState } from 'react';
import { getMyRoadmaps } from '../../api/roadmaps/roadmapApi';
import type { RoadmapsListResponse } from '../../types/roadmapsTypes/roadmapsTypes';

export function useMyRoadmaps() {
  const [data, setData] = useState<RoadmapsListResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMyRoadmaps = useCallback(async (): Promise<RoadmapsListResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getMyRoadmaps();
      setData(response);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Не удалось загрузить роудмапы';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { data, isLoading, error, loadMyRoadmaps };
}
