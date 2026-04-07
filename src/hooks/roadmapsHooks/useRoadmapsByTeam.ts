import { useCallback, useState } from 'react';
import { getRoadmapsByTeam } from '../../api/roadmaps/roadmapApi';
import type { RoadmapsListResponse } from '../../types/roadmapsTypes/roadmapsTypes';

export function useRoadmapsByTeam() {
  const [data, setData] = useState<RoadmapsListResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRoadmapsByTeam = useCallback(async (teamId: number): Promise<RoadmapsListResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getRoadmapsByTeam(teamId);
      setData(response);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Не удалось загрузить роудмапы команды';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { data, isLoading, error, loadRoadmapsByTeam };
}
