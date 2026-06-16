import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { deleteRoadmap, getMyRoadmaps } from '../../api/roadmaps/roadmapApi';
import type { RoadmapItem } from '../../types/roadmapsTypes/roadmapsTypes';

function sortRoadmaps(items: RoadmapItem[]): RoadmapItem[] {
  return [...items].sort((left, right) => (
    new Date(right.updated_at).getTime() - new Date(left.updated_at).getTime()
  ));
}

export function usePersonalRoadmaps() {
  const [roadmaps, setRoadmaps] = useState<RoadmapItem[]>([]);
  const [selectedRoadmapId, setSelectedRoadmapId] = useState<number | null>(null);
  const [isLoadingRoadmaps, setIsLoadingRoadmaps] = useState(true);
  const [isDeletingRoadmap, setIsDeletingRoadmap] = useState(false);

  const reloadRoadmaps = useCallback(async (preferredRoadmapId?: number) => {
    setIsLoadingRoadmaps(true);
    try {
      const response = await getMyRoadmaps();
      const items = sortRoadmaps(response.roadmaps);
      setRoadmaps(items);

      if (items.length === 0) {
        setSelectedRoadmapId(null);
        return;
      }

      const nextSelectedRoadmapId = preferredRoadmapId != null
        ? items.find((item) => item.roadmap_id === preferredRoadmapId)?.roadmap_id ?? items[0].roadmap_id
        : items[0].roadmap_id;

      setSelectedRoadmapId(nextSelectedRoadmapId);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Не удалось загрузить роудмапы';
      // Silently handle server errors for demo
    } finally {
      setIsLoadingRoadmaps(false);
    }
  }, []);

  useEffect(() => {
    void reloadRoadmaps();
  }, [reloadRoadmaps]);

  const selectedRoadmap = useMemo(
    () => roadmaps.find((roadmap) => roadmap.roadmap_id === selectedRoadmapId) ?? null,
    [roadmaps, selectedRoadmapId],
  );

  const updateRoadmapGoalInList = useCallback((roadmapId: number, goalsId: number, title: string, description: string | null) => {
    setRoadmaps((current) => current.map((item) => {
      if (item.roadmap_id !== roadmapId) {
        return item;
      }

      return {
        ...item,
        goal: item.goal ? {
          ...item.goal,
          title,
          description,
        } : {
          goals_id: goalsId,
          user_id: 0,
          title,
          description,
          created_at: new Date().toISOString(),
        },
      };
    }));
  }, []);

  const deleteSelectedRoadmap = useCallback(async () => {
    if (!selectedRoadmap) {
      return;
    }

    if (!window.confirm('Удалить роудмап?')) {
      return;
    }

    setIsDeletingRoadmap(true);
    try {
      await deleteRoadmap(selectedRoadmap.roadmap_id);

      const remaining = roadmaps.filter((item) => item.roadmap_id !== selectedRoadmap.roadmap_id);
      setRoadmaps(remaining);

      if (remaining.length > 0) {
        setSelectedRoadmapId(remaining[0].roadmap_id);
      } else {
        setSelectedRoadmapId(null);
      }

      toast.success('Роудмап удален');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Не удалось удалить роудмап';
      // Silently handle server errors for demo
    } finally {
      setIsDeletingRoadmap(false);
    }
  }, [selectedRoadmap, roadmaps]);

  const selectRoadmap = useCallback((roadmapId: number) => {
    setSelectedRoadmapId(roadmapId);
  }, []);

  return {
    roadmaps,
    selectedRoadmapId,
    selectedRoadmap,
    isLoadingRoadmaps,
    isDeletingRoadmap,
    reloadRoadmaps,
    selectRoadmap,
    setSelectedRoadmapId,
    deleteSelectedRoadmap,
    updateRoadmapGoalInList,
  } as const;
}
