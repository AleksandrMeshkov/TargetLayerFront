import { useRoadmapGoal } from './useRoadmapGoal';
import { useRoadmapModals } from './useRoadmapModals';
import { useRoadmapTasks } from './useRoadmapTasks';
import { usePersonalRoadmaps } from './usePersonalRoadmaps';

export function useRoadmaps() {
  const personal = usePersonalRoadmaps();
  const tasks = useRoadmapTasks({
    selectedRoadmapId: personal.selectedRoadmapId,
    selectedRoadmap: personal.selectedRoadmap,
  });
  const goal = useRoadmapGoal({
    selectedRoadmap: personal.selectedRoadmap,
    updateRoadmapGoalInList: personal.updateRoadmapGoalInList,
  });
  const modals = useRoadmapModals({
    onRoadmapCreated: personal.reloadRoadmaps,
  });

  return {
    personal,
    tasks,
    goal,
    modals,
  } as const;
}
