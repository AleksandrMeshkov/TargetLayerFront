import { useCallback, useState } from 'react';
import { toast } from 'react-toastify';
import { createRoadmap } from '../../api/roadmaps/roadmapApi';
import { useModal } from './useModal';

type RoadmapTaskDraft = {
  title: string;
  description: string;
};

type UseRoadmapModalsArgs = {
  onRoadmapCreated: (roadmapId: number) => Promise<void>;
};

export function useRoadmapModals({ onRoadmapCreated }: UseRoadmapModalsArgs) {
  const createRoadmapModal = useModal(false);
  const manageRoadmapModal = useModal(false);
  const addTaskModal = useModal(false);

  const [createRoadmapTitle, setCreateRoadmapTitle] = useState('');
  const [createRoadmapDescription, setCreateRoadmapDescription] = useState('');
  const [createRoadmapTeamId, setCreateRoadmapTeamId] = useState('');
  const [createRoadmapTasks, setCreateRoadmapTasks] = useState<RoadmapTaskDraft[]>([{ title: '', description: '' }]);
  const [isCreatingRoadmap, setIsCreatingRoadmap] = useState(false);

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');

  const resetCreateRoadmapForm = useCallback(() => {
    setCreateRoadmapTitle('');
    setCreateRoadmapDescription('');
    setCreateRoadmapTeamId('');
    setCreateRoadmapTasks([{ title: '', description: '' }]);
  }, []);

  const openCreateRoadmap = useCallback(() => {
    resetCreateRoadmapForm();
    createRoadmapModal.open();
  }, [resetCreateRoadmapForm, createRoadmapModal]);

  const closeCreateRoadmap = useCallback(() => {
    createRoadmapModal.close();
  }, [createRoadmapModal]);

  const openManageRoadmap = useCallback(() => {
    manageRoadmapModal.open();
  }, [manageRoadmapModal]);

  const closeManageRoadmap = useCallback(() => {
    manageRoadmapModal.close();
  }, [manageRoadmapModal]);

  const openAddTask = useCallback(() => {
    setNewTaskTitle('');
    setNewTaskDescription('');
    addTaskModal.open();
  }, [addTaskModal]);

  const closeAddTask = useCallback(() => {
    addTaskModal.close();
  }, [addTaskModal]);

  const handleCreateRoadmapTaskChange = useCallback((index: number, field: keyof RoadmapTaskDraft, value: string) => {
    setCreateRoadmapTasks((current) => current.map((task, taskIndex) => (
      taskIndex === index ? { ...task, [field]: value } : task
    )));
  }, []);

  const addCreateRoadmapTask = useCallback(() => {
    setCreateRoadmapTasks((current) => [...current, { title: '', description: '' }]);
  }, []);

  const removeCreateRoadmapTask = useCallback((index: number) => {
    setCreateRoadmapTasks((current) => {
      if (current.length === 1) {
        return [{ title: '', description: '' }];
      }

      return current.filter((_, taskIndex) => taskIndex !== index);
    });
  }, []);

  const submitCreateRoadmap = useCallback(async () => {
    const title = createRoadmapTitle.trim();
    const description = createRoadmapDescription.trim();
    const teamIdValue = createRoadmapTeamId.trim();

    if (!title) {
      toast.error('Введите название роудмапа');
      return;
    }

    let teamId: number | null = null;
    if (teamIdValue) {
      teamId = Number(teamIdValue);
      if (!Number.isInteger(teamId) || teamId <= 0) {
        toast.error('ID команды должен быть положительным числом');
        return;
      }
    }

    const normalizedTasks = createRoadmapTasks.map((task) => ({
      title: task.title.trim(),
      description: task.description.trim(),
    }));

    if (normalizedTasks.some((task) => !task.title && task.description)) {
      toast.error('У задачи должно быть название или удалите пустую строку');
      return;
    }

    const tasks = normalizedTasks
      .filter((task) => task.title.length > 0)
      .map((task, index) => ({
        title: task.title,
        description: task.description.length > 0 ? task.description : null,
        order_index: index,
      }));

    setIsCreatingRoadmap(true);
    try {
      const created = await createRoadmap({
        title,
        description: description.length > 0 ? description : null,
        team_id: teamId,
        tasks: tasks.length > 0 ? tasks : undefined,
      });

      await onRoadmapCreated(created.roadmap_id);
      closeCreateRoadmap();
      resetCreateRoadmapForm();
      toast.success('Роудмап создан');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Не удалось создать роудмап';
      toast.error(message);
    } finally {
      setIsCreatingRoadmap(false);
    }
  }, [createRoadmapTitle, createRoadmapDescription, createRoadmapTeamId, createRoadmapTasks, onRoadmapCreated, closeCreateRoadmap, resetCreateRoadmapForm]);

  return {
    createRoadmapModal: {
      isOpen: createRoadmapModal.isOpen,
      open: openCreateRoadmap,
      close: closeCreateRoadmap,
      title: createRoadmapTitle,
      setTitle: setCreateRoadmapTitle,
      description: createRoadmapDescription,
      setDescription: setCreateRoadmapDescription,
      teamId: createRoadmapTeamId,
      setTeamId: setCreateRoadmapTeamId,
      tasks: createRoadmapTasks,
      onChangeTask: handleCreateRoadmapTaskChange,
      onAddTask: addCreateRoadmapTask,
      onRemoveTask: removeCreateRoadmapTask,
      onSubmit: submitCreateRoadmap,
      isSubmitting: isCreatingRoadmap,
    },
    manageRoadmapModal: {
      isOpen: manageRoadmapModal.isOpen,
      open: openManageRoadmap,
      close: closeManageRoadmap,
    },
    addTaskModal: {
      isOpen: addTaskModal.isOpen,
      open: openAddTask,
      close: closeAddTask,
      title: newTaskTitle,
      setTitle: setNewTaskTitle,
      description: newTaskDescription,
      setDescription: setNewTaskDescription,
    },
  } as const;
}
