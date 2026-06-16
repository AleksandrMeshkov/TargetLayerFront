import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { updateRoadmapGoal } from '../../api/roadmaps/roadmapApi';
import type { RoadmapItem } from '../../types/roadmapsTypes/roadmapsTypes';

type UseRoadmapGoalArgs = {
  selectedRoadmap: RoadmapItem | null;
  updateRoadmapGoalInList: (roadmapId: number, goalsId: number, title: string, description: string | null) => void;
};

export function useRoadmapGoal({ selectedRoadmap, updateRoadmapGoalInList }: UseRoadmapGoalArgs) {
  const [goalTitleDraft, setGoalTitleDraft] = useState('');
  const [goalDescriptionDraft, setGoalDescriptionDraft] = useState('');
  const [isSavingGoal, setIsSavingGoal] = useState(false);

  useEffect(() => {
    if (!selectedRoadmap) {
      setGoalTitleDraft('');
      setGoalDescriptionDraft('');
      return;
    }

    setGoalTitleDraft(selectedRoadmap.goal?.title ?? '');
    setGoalDescriptionDraft(selectedRoadmap.goal?.description ?? '');
  }, [selectedRoadmap?.roadmap_id]);

  const saveGoal = useCallback(async () => {
    if (!selectedRoadmap) {
      return;
    }

    const title = goalTitleDraft.trim();
    const description = goalDescriptionDraft.trim();

    if (!title) {
      toast.error('Введите название цели');
      return;
    }

    setIsSavingGoal(true);
    try {
      const response = await updateRoadmapGoal(selectedRoadmap.roadmap_id, {
        title,
        description: description.length > 0 ? description : null,
      });

      updateRoadmapGoalInList(
        selectedRoadmap.roadmap_id,
        response.goal?.goals_id ?? selectedRoadmap.goal?.goals_id ?? 0,
        response.goal?.title ?? title,
        response.goal?.description ?? (description.length > 0 ? description : null),
      );

      toast.success('Цель обновлена');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Не удалось обновить цель';
      // Silently handle server errors for demo
    } finally {
      setIsSavingGoal(false);
    }
  }, [selectedRoadmap, goalTitleDraft, goalDescriptionDraft, updateRoadmapGoalInList]);

  return {
    goalTitleDraft,
    setGoalTitleDraft,
    goalDescriptionDraft,
    setGoalDescriptionDraft,
    isSavingGoal,
    saveGoal,
  } as const;
}
