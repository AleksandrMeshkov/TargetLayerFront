import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import {
  createRoadmapTask,
  deleteRoadmapTask,
  getRoadmapTasks,
  setRoadmapTaskComplete,
  updateRoadmapTask,
} from '../../api/roadmaps/roadmapApi';
import type { RoadmapItem, RoadmapTask } from '../../types/roadmapsTypes/roadmapsTypes';

type UseRoadmapTasksArgs = {
  selectedRoadmapId: number | null;
  selectedRoadmap: RoadmapItem | null;
};

function sortTasks(tasks: RoadmapTask[]): RoadmapTask[] {
  return [...tasks].sort((left, right) => left.order_index - right.order_index);
}

export function useRoadmapTasks({ selectedRoadmapId, selectedRoadmap }: UseRoadmapTasksArgs) {
  const [tasksCache, setTasksCache] = useState<Record<number, RoadmapTask[]>>({});
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [taskBusyIds, setTaskBusyIds] = useState<Record<number, boolean>>({});
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [editTaskTitle, setEditTaskTitle] = useState('');
  const [editTaskDescription, setEditTaskDescription] = useState('');

  const visibleTasks = useMemo(() => {
    if (selectedRoadmapId == null) {
      return [];
    }

    return sortTasks(tasksCache[selectedRoadmapId] ?? selectedRoadmap?.tasks ?? []);
  }, [selectedRoadmapId, tasksCache, selectedRoadmap?.tasks]);

  useEffect(() => {
    if (selectedRoadmapId == null) {
      setEditingTaskId(null);
      setEditTaskTitle('');
      setEditTaskDescription('');
      setIsLoadingTasks(false);
      return;
    }

    setEditingTaskId(null);
    setEditTaskTitle('');
    setEditTaskDescription('');

    const cachedTasks = tasksCache[selectedRoadmapId];
    if (cachedTasks) {
      return;
    }

    if (selectedRoadmap && selectedRoadmap.tasks.length > 0) {
      setTasksCache((current) => ({ ...current, [selectedRoadmapId]: sortTasks(selectedRoadmap.tasks) }));
      return;
    }

    let isCancelled = false;
    setIsLoadingTasks(true);

    void getRoadmapTasks(selectedRoadmapId)
      .then((tasks) => {
        if (isCancelled) {
          return;
        }
        setTasksCache((current) => ({ ...current, [selectedRoadmapId]: sortTasks(tasks) }));
      })
      .catch((error) => {
        if (isCancelled) {
          return;
        }
      })
      .finally(() => {
        if (!isCancelled) {
          setIsLoadingTasks(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [selectedRoadmapId, selectedRoadmap, tasksCache]);

  const setTaskBusy = useCallback((taskId: number, busy: boolean) => {
    setTaskBusyIds((current) => ({ ...current, [taskId]: busy }));
  }, []);

  const createTask = useCallback(async (title: string, description: string): Promise<boolean> => {
    if (selectedRoadmapId == null) {
      return false;
    }

    const normalizedTitle = title.trim();
    const normalizedDescription = description.trim();

    if (!normalizedTitle) {
      toast.error('Введите название задачи');
      return false;
    }

    const nextOrderIndex = visibleTasks.reduce((max, task) => Math.max(max, task.order_index), -1) + 1;

    setIsCreatingTask(true);
    try {
      const created = await createRoadmapTask(selectedRoadmapId, {
        title: normalizedTitle,
        description: normalizedDescription.length > 0 ? normalizedDescription : null,
        order_index: nextOrderIndex,
      });

      setTasksCache((current) => {
        const existing = current[selectedRoadmapId] ?? [];
        return { ...current, [selectedRoadmapId]: sortTasks([...existing, created]) };
      });

      toast.success('Задача создана');
      return true;
    } catch (error) {
      return false;
    } finally {
      setIsCreatingTask(false);
    }
  }, [selectedRoadmapId, visibleTasks]);

  const startEditTask = useCallback((task: RoadmapTask) => {
    setEditingTaskId(task.task_id);
    setEditTaskTitle(task.title);
    setEditTaskDescription(task.description ?? '');
  }, []);

  const cancelEditTask = useCallback(() => {
    setEditingTaskId(null);
    setEditTaskTitle('');
    setEditTaskDescription('');
  }, []);

  const saveTask = useCallback(async (task: RoadmapTask) => {
    if (selectedRoadmapId == null) {
      return;
    }

    const title = editTaskTitle.trim();
    const description = editTaskDescription.trim();

    if (!title) {
      toast.error('Название задачи не может быть пустым');
      return;
    }

    setTaskBusy(task.task_id, true);
    try {
      const updated = await updateRoadmapTask(selectedRoadmapId, task.task_id, {
        title,
        description: description.length > 0 ? description : null,
      });

      setTasksCache((current) => ({
        ...current,
        [selectedRoadmapId]: sortTasks((current[selectedRoadmapId] ?? visibleTasks).map((item) => (
          item.task_id === updated.task_id ? updated : item
        ))),
      }));

      toast.success('Задача обновлена');
      cancelEditTask();
    } catch (error) {
    } finally {
      setTaskBusy(task.task_id, false);
    }
  }, [selectedRoadmapId, editTaskTitle, editTaskDescription, visibleTasks, cancelEditTask, setTaskBusy]);

  const deleteTask = useCallback(async (task: RoadmapTask) => {
    if (selectedRoadmapId == null) {
      return;
    }

    if (!window.confirm('Удалить задачу?')) {
      return;
    }

    setTaskBusy(task.task_id, true);
    try {
      await deleteRoadmapTask(selectedRoadmapId, task.task_id);
      setTasksCache((current) => ({
        ...current,
        [selectedRoadmapId]: (current[selectedRoadmapId] ?? visibleTasks).filter((item) => item.task_id !== task.task_id),
      }));

      if (editingTaskId === task.task_id) {
        cancelEditTask();
      }

      toast.success('Задача удалена');
    } catch (error) {
    } finally {
      setTaskBusy(task.task_id, false);
    }
  }, [selectedRoadmapId, visibleTasks, editingTaskId, cancelEditTask, setTaskBusy]);

  const toggleTaskComplete = useCallback(async (task: RoadmapTask) => {
    if (selectedRoadmapId == null) {
      return;
    }

    setTaskBusy(task.task_id, true);
    try {
      const updated = await setRoadmapTaskComplete(selectedRoadmapId, task.task_id, !task.completed);
      setTasksCache((current) => ({
        ...current,
        [selectedRoadmapId]: sortTasks((current[selectedRoadmapId] ?? visibleTasks).map((item) => (
          item.task_id === updated.task_id ? updated : item
        ))),
      }));
    } catch (error) {
    } finally {
      setTaskBusy(task.task_id, false);
    }
  }, [selectedRoadmapId, visibleTasks, setTaskBusy]);

  return {
    tasksCache,
    visibleTasks,
    isLoadingTasks,
    isCreatingTask,
    taskBusyIds,
    editingTaskId,
    editTaskTitle,
    setEditTaskTitle,
    editTaskDescription,
    setEditTaskDescription,
    createTask,
    startEditTask,
    cancelEditTask,
    saveTask,
    deleteTask,
    toggleTaskComplete,
    getRoadmapTaskCount: (roadmapId: number) => tasksCache[roadmapId]?.length ?? 0,
  } as const;
}
