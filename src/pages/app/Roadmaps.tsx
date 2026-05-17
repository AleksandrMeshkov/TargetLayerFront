import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Circle, LoaderCircle, Map, Pencil, Plus, Save, Trash2, X } from 'lucide-react';
import { toast } from 'react-toastify';
import {
  createRoadmap,
  createRoadmapTask,
  deleteRoadmap,
  deleteRoadmapTask,
  getMyRoadmaps,
  getRoadmapTasks,
  setRoadmapTaskComplete,
  updateRoadmapGoal,
  updateRoadmapTask,
} from '../../api/roadmaps/roadmapApi';
import type { RoadmapItem, RoadmapTask } from '../../types/roadmapsTypes/roadmapsTypes';

type RoadmapTaskDraft = {
  title: string;
  description: string;
};

function formatDate(dateValue: string): string {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) {
    return 'Неизвестно';
  }

  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

function sortTasks(tasks: RoadmapTask[]): RoadmapTask[] {
  return [...tasks].sort((left, right) => left.order_index - right.order_index);
}

const Roadmaps: React.FC = () => {
  const [roadmaps, setRoadmaps] = useState<RoadmapItem[]>([]);
  const [selectedRoadmapId, setSelectedRoadmapId] = useState<number | null>(null);
  const [tasksCache, setTasksCache] = useState<Record<number, RoadmapTask[]>>({});
  const [isLoadingRoadmaps, setIsLoadingRoadmaps] = useState(true);
  const [isCreateRoadmapOpen, setIsCreateRoadmapOpen] = useState(false);
  const [isCreatingRoadmap, setIsCreatingRoadmap] = useState(false);
  const [newRoadmapTitle, setNewRoadmapTitle] = useState('');
  const [newRoadmapDescription, setNewRoadmapDescription] = useState('');
  const [newRoadmapTeamId, setNewRoadmapTeamId] = useState('');
  const [newRoadmapTasks, setNewRoadmapTasks] = useState<RoadmapTaskDraft[]>([{ title: '', description: '' }]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [taskBusyIds, setTaskBusyIds] = useState<Record<number, boolean>>({});
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [editTaskTitle, setEditTaskTitle] = useState('');
  const [editTaskDescription, setEditTaskDescription] = useState('');
  const [goalTitleDraft, setGoalTitleDraft] = useState('');
  const [goalDescriptionDraft, setGoalDescriptionDraft] = useState('');
  const [isSavingGoal, setIsSavingGoal] = useState(false);
  const [isDeletingRoadmap, setIsDeletingRoadmap] = useState(false);
  const [isManageOpen, setIsManageOpen] = useState(false);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);

  const reloadRoadmaps = async (preferredRoadmapId?: number): Promise<void> => {
    setIsLoadingRoadmaps(true);
    try {
      const response = await getMyRoadmaps();
      const items = [...response.roadmaps].sort((left, right) => (
        new Date(right.updated_at).getTime() - new Date(left.updated_at).getTime()
      ));

      setRoadmaps(items);

      if (items.length === 0) {
        setSelectedRoadmapId(null);
        return;
      }

      const selectedId = preferredRoadmapId != null
        ? items.find((item) => item.roadmap_id === preferredRoadmapId)?.roadmap_id ?? items[0].roadmap_id
        : items[0].roadmap_id;

      setSelectedRoadmapId(selectedId);

      const selectedItem = items.find((item) => item.roadmap_id === selectedId);
      if (selectedItem && selectedItem.tasks.length > 0) {
        setTasksCache((prev) => ({ ...prev, [selectedId]: sortTasks(selectedItem.tasks) }));
      } else {
        setIsLoadingTasks(true);
        try {
          const tasks = await getRoadmapTasks(selectedId);
          setTasksCache((prev) => ({ ...prev, [selectedId]: sortTasks(tasks) }));
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Не удалось загрузить задачи роудмапа';
          toast.error(message);
        } finally {
          setIsLoadingTasks(false);
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Не удалось загрузить роудмапы';
      toast.error(message);
    } finally {
      setIsLoadingRoadmaps(false);
    }
  };

  useEffect(() => {
    void reloadRoadmaps();
  }, []);

  const selectedRoadmap = useMemo(
    () => roadmaps.find((roadmap) => roadmap.roadmap_id === selectedRoadmapId) ?? null,
    [roadmaps, selectedRoadmapId],
  );

  const selectedTasks = selectedRoadmapId != null ? tasksCache[selectedRoadmapId] : undefined;
  const visibleTasks = useMemo(
    () => sortTasks(selectedTasks ?? selectedRoadmap?.tasks ?? []),
    [selectedRoadmap?.tasks, selectedTasks],
  );

  useEffect(() => {
    if (!selectedRoadmap) {
      setEditingTaskId(null);
      setIsManageOpen(false);
      setIsAddTaskOpen(false);
      return;
    }

    setGoalTitleDraft(selectedRoadmap.goal?.title ?? '');
    setGoalDescriptionDraft(selectedRoadmap.goal?.description ?? '');
    setEditingTaskId(null);
  }, [selectedRoadmapId]);

  const setTaskBusy = (taskId: number, busy: boolean) => {
    setTaskBusyIds((prev) => ({ ...prev, [taskId]: busy }));
  };

  const updateRoadmapTasksState = (roadmapId: number, updater: (tasks: RoadmapTask[]) => RoadmapTask[]) => {
    setRoadmaps((prev) => prev.map((item) => {
      if (item.roadmap_id !== roadmapId) {
        return item;
      }
      return {
        ...item,
        tasks: updater(item.tasks),
      };
    }));
  };

  const updateCachedTask = (roadmapId: number, updatedTask: RoadmapTask) => {
    setTasksCache((prev) => {
      const current = prev[roadmapId];
      if (!current) {
        return prev;
      }
      const next = current.map((task) => (task.task_id === updatedTask.task_id ? updatedTask : task));
      return { ...prev, [roadmapId]: next };
    });

    updateRoadmapTasksState(roadmapId, (tasks) => tasks.map((task) => (
      task.task_id === updatedTask.task_id ? updatedTask : task
    )));
  };

  const appendCachedTask = (roadmapId: number, createdTask: RoadmapTask) => {
    setTasksCache((prev) => {
      const current = prev[roadmapId] ?? [];
      return { ...prev, [roadmapId]: [...current, createdTask] };
    });

    updateRoadmapTasksState(roadmapId, (tasks) => [...tasks, createdTask]);
  };

  const removeCachedTask = (roadmapId: number, taskId: number) => {
    setTasksCache((prev) => {
      const current = prev[roadmapId];
      if (!current) {
        return prev;
      }
      return { ...prev, [roadmapId]: current.filter((task) => task.task_id !== taskId) };
    });

    updateRoadmapTasksState(roadmapId, (tasks) => tasks.filter((task) => task.task_id !== taskId));
  };

  const handleCreateTask = async (): Promise<void> => {
    if (selectedRoadmapId == null) {
      return;
    }

    const title = newTaskTitle.trim();
    const description = newTaskDescription.trim();

    if (!title) {
      toast.error('Введите название задачи');
      return;
    }

    const nextOrderIndex = visibleTasks.reduce((max, task) => Math.max(max, task.order_index), -1) + 1;

    setIsCreatingTask(true);
    try {
      const created = await createRoadmapTask(selectedRoadmapId, {
        title,
        description: description.length > 0 ? description : null,
        order_index: nextOrderIndex,
      });

      appendCachedTask(selectedRoadmapId, created);
      setNewTaskTitle('');
      setNewTaskDescription('');
      setIsAddTaskOpen(false);
      toast.success('Задача создана');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Не удалось создать задачу';
      toast.error(message);
    } finally {
      setIsCreatingTask(false);
    }
  };

  const startEditTask = (task: RoadmapTask) => {
    setEditingTaskId(task.task_id);
    setEditTaskTitle(task.title);
    setEditTaskDescription(task.description ?? '');
  };

  const cancelEditTask = () => {
    setEditingTaskId(null);
    setEditTaskTitle('');
    setEditTaskDescription('');
  };

  const handleSaveTask = async (task: RoadmapTask): Promise<void> => {
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
      updateCachedTask(selectedRoadmapId, updated);
      toast.success('Задача обновлена');
      cancelEditTask();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Не удалось обновить задачу';
      toast.error(message);
    } finally {
      setTaskBusy(task.task_id, false);
    }
  };

  const handleDeleteTask = async (task: RoadmapTask): Promise<void> => {
    if (selectedRoadmapId == null) {
      return;
    }

    if (!window.confirm('Удалить задачу?')) {
      return;
    }

    setTaskBusy(task.task_id, true);
    try {
      await deleteRoadmapTask(selectedRoadmapId, task.task_id);
      removeCachedTask(selectedRoadmapId, task.task_id);
      if (editingTaskId === task.task_id) {
        cancelEditTask();
      }
      toast.success('Задача удалена');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Не удалось удалить задачу';
      toast.error(message);
    } finally {
      setTaskBusy(task.task_id, false);
    }
  };

  const handleToggleTaskComplete = async (task: RoadmapTask): Promise<void> => {
    if (selectedRoadmapId == null) {
      return;
    }

    const nextCompleted = !task.completed;
    setTaskBusy(task.task_id, true);
    try {
      const updated = await setRoadmapTaskComplete(selectedRoadmapId, task.task_id, nextCompleted);
      updateCachedTask(selectedRoadmapId, updated);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Не удалось обновить статус задачи';
      toast.error(message);
    } finally {
      setTaskBusy(task.task_id, false);
    }
  };

  const handleSaveGoal = async (): Promise<void> => {
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

      setRoadmaps((prev) => prev.map((item) => {
        if (item.roadmap_id !== selectedRoadmap.roadmap_id) {
          return item;
        }

        if (!response.goal || !item.goal) {
          return item;
        }

        return {
          ...item,
          goal: {
            ...item.goal,
            title: response.goal.title,
            description: response.goal.description ?? null,
          },
        };
      }));

      toast.success('Цель обновлена');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Не удалось обновить цель';
      toast.error(message);
    } finally {
      setIsSavingGoal(false);
    }
  };

  const handleSelectRoadmap = async (roadmapId: number): Promise<void> => {
    setSelectedRoadmapId(roadmapId);

    if (tasksCache[roadmapId]) {
      return;
    }

    setIsLoadingTasks(true);
    try {
      const tasks = await getRoadmapTasks(roadmapId);
      setTasksCache((prev) => ({ ...prev, [roadmapId]: sortTasks(tasks) }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Не удалось загрузить задачи роудмапа';
      toast.error(message);
    } finally {
      setIsLoadingTasks(false);
    }
  };

  const handleDeleteRoadmap = async (): Promise<void> => {
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

      setTasksCache((prev) => {
        const { [selectedRoadmap.roadmap_id]: _removed, ...rest } = prev;
        return rest;
      });

      if (remaining.length > 0) {
        await handleSelectRoadmap(remaining[0].roadmap_id);
      } else {
        setSelectedRoadmapId(null);
      }
      setEditingTaskId(null);
      setIsManageOpen(false);
      setIsAddTaskOpen(false);
      toast.success('Роудмап удален');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Не удалось удалить роудмап';
      toast.error(message);
    } finally {
      setIsDeletingRoadmap(false);
    }
  };

  const openManage = () => {
    if (!selectedRoadmap) {
      return;
    }
    setGoalTitleDraft(selectedRoadmap.goal?.title ?? '');
    setGoalDescriptionDraft(selectedRoadmap.goal?.description ?? '');
    setIsManageOpen(true);
  };

  const openAddTask = () => {
    if (!selectedRoadmap) {
      return;
    }
    setNewTaskTitle('');
    setNewTaskDescription('');
    setIsAddTaskOpen(true);
  };

  const resetCreateRoadmapForm = () => {
    setNewRoadmapTitle('');
    setNewRoadmapDescription('');
    setNewRoadmapTeamId('');
    setNewRoadmapTasks([{ title: '', description: '' }]);
  };

  const openCreateRoadmap = () => {
    resetCreateRoadmapForm();
    setIsCreateRoadmapOpen(true);
  };

  const handleCreateRoadmapTaskChange = (index: number, field: keyof RoadmapTaskDraft, value: string) => {
    setNewRoadmapTasks((prev) => prev.map((task, taskIndex) => (
      taskIndex === index ? { ...task, [field]: value } : task
    )));
  };

  const addCreateRoadmapTask = () => {
    setNewRoadmapTasks((prev) => [...prev, { title: '', description: '' }]);
  };

  const removeCreateRoadmapTask = (index: number) => {
    setNewRoadmapTasks((prev) => {
      if (prev.length === 1) {
        return [{ title: '', description: '' }];
      }

      return prev.filter((_, taskIndex) => taskIndex !== index);
    });
  };

  const handleCreateRoadmap = async (): Promise<void> => {
    const title = newRoadmapTitle.trim();
    const description = newRoadmapDescription.trim();
    const teamIdValue = newRoadmapTeamId.trim();

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

    const normalizedTasks = newRoadmapTasks.map((task) => ({
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

      await reloadRoadmaps(created.roadmap_id);
      resetCreateRoadmapForm();
      setIsCreateRoadmapOpen(false);
      toast.success('Роудмап создан');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Не удалось создать роудмап';
      toast.error(message);
    } finally {
      setIsCreatingRoadmap(false);
    }
  };

  return (
    <section className="flex min-h-0 flex-1 flex-col gap-6">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Map className="h-8 w-8 text-purple-400" />
            <div>
              <h1 className="text-3xl font-bold">Роудмапы</h1>
              <p className="mt-2 max-w-2xl text-sm text-purple-100/70">
                Выберите роудмап слева, чтобы посмотреть все его задачи.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={openCreateRoadmap}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-purple-500/20 px-4 py-2 text-sm text-purple-50 transition hover:bg-purple-500/30"
              disabled={isCreatingRoadmap}
            >
              <Plus className="h-4 w-4" />
              Создать роудмап
            </button>

            {selectedRoadmap ? (
              <button
                type="button"
                onClick={openManage}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-black/30 px-4 py-2 text-sm text-purple-100 transition hover:bg-white/10"
                disabled={isDeletingRoadmap || isSavingGoal}
              >
                <Pencil className="h-4 w-4" />
                Управление
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[360px_minmax(0,1fr)] xl:grid-cols-[420px_minmax(0,1fr)]">
        <aside className="flex min-h-0 flex-col rounded-2xl border border-white/10 bg-black/30 p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs uppercase tracking-wide text-purple-200/70">Мои роудмапы</p>
            <span className="rounded-lg border border-white/10 px-2 py-1 text-xs text-purple-100/70">
              {roadmaps.length}
            </span>
          </div>

          <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
            {isLoadingRoadmaps && (
              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-purple-100/70">
                <LoaderCircle className="h-4 w-4 animate-spin" />
                Загружаю роудмапы...
              </div>
            )}

            {!isLoadingRoadmaps && roadmaps.length === 0 && (
              <div className="rounded-xl border border-dashed border-white/15 bg-white/[0.02] px-4 py-6 text-sm text-purple-100/60">
                Роудмапы не найдены.
              </div>
            )}

            {roadmaps.map((roadmap) => {
              const isActive = roadmap.roadmap_id === selectedRoadmapId;
              const cachedTasks = tasksCache[roadmap.roadmap_id];

              return (
                <button
                  key={roadmap.roadmap_id}
                  type="button"
                  onClick={() => void handleSelectRoadmap(roadmap.roadmap_id)}
                  className={`w-full rounded-xl border px-4 py-3 text-left transition ${
                    isActive
                      ? 'border-purple-400/60 bg-purple-500/20'
                      : 'border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-purple-50">
                        {roadmap.goal?.title ?? `Роудмап #${roadmap.roadmap_id}`}
                      </p>
                      <p className="mt-1 text-xs text-purple-100/60">
                        Обновлен: {formatDate(roadmap.updated_at)}
                      </p>
                    </div>
                    <span className="rounded-lg border border-white/10 px-2 py-1 text-xs text-purple-100/70">
                      {cachedTasks ? cachedTasks.length : roadmap.tasks.length} задач
                    </span>
                  </div>

                  {roadmap.goal?.description && (
                    <p className="mt-2 line-clamp-2 text-sm text-purple-100/70">
                      {roadmap.goal.description}
                    </p>
                  )}
                </button>
              );
            })}
          </div>
        </aside>

        <div className="flex min-h-0 flex-col rounded-2xl border border-white/10 bg-white/[0.04] p-4 sm:p-6">
          {!selectedRoadmap && !isLoadingRoadmaps && (
            <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-white/15 bg-white/[0.02] px-4 py-10 text-center text-sm text-purple-100/60">
              Выберите роудмап, чтобы увидеть его задачи.
            </div>
          )}

          {selectedRoadmap && (
            <div className="flex min-h-0 flex-1 flex-col gap-5">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-purple-200/70">Активный роудмап</p>
                    <h2 className="mt-2 text-2xl font-bold text-purple-50">
                      {selectedRoadmap.goal?.title ?? `Роудмап #${selectedRoadmap.roadmap_id}`}
                    </h2>
                    {selectedRoadmap.goal?.description && (
                      <p className="mt-2 max-w-3xl text-sm leading-relaxed text-purple-100/75">
                        {selectedRoadmap.goal.description}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap items-start justify-end gap-3">
                    <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-purple-100/75">
                      <p>Статус: {selectedRoadmap.completed ? 'Завершен' : 'В процессе'}</p>
                      <p className="mt-1">Задач: {selectedTasks?.length ?? selectedRoadmap.tasks.length}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex min-h-0 flex-1 flex-col">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-medium text-purple-100/80">Задачи роудмапа</p>
                  <button
                    type="button"
                    onClick={openAddTask}
                    className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-purple-500/20 px-4 py-2 text-sm text-purple-50 transition hover:bg-purple-500/30"
                    disabled={isLoadingTasks || isDeletingRoadmap}
                  >
                    <Plus className="h-4 w-4" />
                    Добавить задачу
                  </button>
                  {isLoadingTasks && (
                    <span className="inline-flex items-center gap-2 text-xs text-purple-200/70">
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                      Загружаю задачи...
                    </span>
                  )}
                </div>

                <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
                  {visibleTasks.map((task) => (
                    <div
                      key={task.task_id}
                      className="rounded-2xl border border-white/10 bg-black/20 p-4"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <button
                            type="button"
                            onClick={() => void handleToggleTaskComplete(task)}
                            className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-purple-100/80 transition hover:bg-white/10"
                            disabled={Boolean(taskBusyIds[task.task_id])}
                            aria-label={task.completed ? 'Снять отметку выполнено' : 'Отметить выполнено'}
                          >
                            {task.completed ? (
                              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                            ) : (
                              <Circle className="h-5 w-5 text-purple-300" />
                            )}
                          </button>

                          <div className="min-w-0">
                            {editingTaskId !== task.task_id ? (
                              <>
                                <p className="font-medium text-purple-50">
                                  {task.order_index + 1}. {task.title}
                                </p>
                                {task.description && (
                                  <p className="mt-1 text-sm leading-relaxed text-purple-100/70">{task.description}</p>
                                )}
                              </>
                            ) : (
                              <div className="space-y-2">
                                <input
                                  value={editTaskTitle}
                                  onChange={(event) => setEditTaskTitle(event.target.value)}
                                  className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-purple-50 placeholder:text-purple-100/40 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                                  placeholder="Название"
                                  disabled={Boolean(taskBusyIds[task.task_id])}
                                />
                                <textarea
                                  value={editTaskDescription}
                                  onChange={(event) => setEditTaskDescription(event.target.value)}
                                  className="w-full resize-none rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-purple-50 placeholder:text-purple-100/40 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                                  placeholder="Описание (необязательно)"
                                  rows={3}
                                  disabled={Boolean(taskBusyIds[task.task_id])}
                                />
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-wrap items-start justify-end gap-2">
                          {editingTaskId !== task.task_id ? (
                            <>
                              <button
                                type="button"
                                onClick={() => startEditTask(task)}
                                className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-purple-100/70 transition hover:bg-white/10"
                                disabled={Boolean(taskBusyIds[task.task_id])}
                              >
                                <Pencil className="h-4 w-4" />
                                Изменить
                              </button>
                              <button
                                type="button"
                                onClick={() => void handleDeleteTask(task)}
                                className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-purple-100/70 transition hover:bg-white/10"
                                disabled={Boolean(taskBusyIds[task.task_id])}
                              >
                                <Trash2 className="h-4 w-4" />
                                Удалить
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => void handleSaveTask(task)}
                                className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-purple-500/20 px-3 py-2 text-xs text-purple-50 transition hover:bg-purple-500/30"
                                disabled={Boolean(taskBusyIds[task.task_id])}
                              >
                                <Save className="h-4 w-4" />
                                Сохранить
                              </button>
                              <button
                                type="button"
                                onClick={cancelEditTask}
                                className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-purple-100/70 transition hover:bg-white/10"
                                disabled={Boolean(taskBusyIds[task.task_id])}
                              >
                                <X className="h-4 w-4" />
                                Отмена
                              </button>
                            </>
                          )}

                          <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-purple-100/70">
                            <p>{task.completed ? 'Выполнено' : 'Не выполнено'}</p>
                            <p className="mt-1">Создано: {formatDate(task.created_at)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {!isLoadingTasks && visibleTasks.length === 0 && (
                    <div className="rounded-xl border border-dashed border-white/15 bg-white/[0.02] px-4 py-8 text-sm text-purple-100/60">
                      У этого роудмапа пока нет задач.
                    </div>
                  )}
                </div>
              </div>

              {isManageOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
                  <div
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    onClick={() => setIsManageOpen(false)}
                  />

                  <div className="relative w-full max-w-2xl rounded-3xl border border-white/10 bg-[#080512] p-5 shadow-none">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-purple-200/70">Управление роудмапом</p>
                        <h3 className="mt-2 text-xl font-bold text-purple-50">
                          {selectedRoadmap.goal?.title ?? `Роудмап #${selectedRoadmap.roadmap_id}`}
                        </h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsManageOpen(false)}
                        className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-black/30 p-2 text-purple-100 transition hover:bg-white/10"
                        aria-label="Закрыть"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    <div className="mt-5 space-y-4">
                      <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                        <p className="text-sm font-medium text-purple-50">Цель</p>
                        <div className="mt-3 grid gap-3">
                          <input
                            value={goalTitleDraft}
                            onChange={(event) => setGoalTitleDraft(event.target.value)}
                            className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-purple-50 placeholder:text-purple-100/40 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                            placeholder="Название цели"
                            disabled={isSavingGoal || isDeletingRoadmap}
                          />
                          <textarea
                            value={goalDescriptionDraft}
                            onChange={(event) => setGoalDescriptionDraft(event.target.value)}
                            className="w-full resize-none rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-purple-50 placeholder:text-purple-100/40 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                            placeholder="Описание цели (необязательно)"
                            rows={4}
                            disabled={isSavingGoal || isDeletingRoadmap}
                          />
                          <div className="flex flex-wrap items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => void handleSaveGoal()}
                              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-purple-500/20 px-4 py-3 text-sm text-purple-50 transition hover:bg-purple-500/30"
                              disabled={isSavingGoal || isDeletingRoadmap}
                            >
                              <Save className={`h-4 w-4 ${isSavingGoal ? 'animate-pulse' : ''}`} />
                              Сохранить цель
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <button
                          type="button"
                          onClick={() => void handleDeleteRoadmap()}
                          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-purple-100/80 transition hover:bg-white/10"
                          disabled={isSavingGoal || isDeletingRoadmap}
                        >
                          {isDeletingRoadmap ? (
                            <LoaderCircle className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                          Удалить роудмап
                        </button>

                        <button
                          type="button"
                          onClick={() => setIsManageOpen(false)}
                          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-purple-100 transition hover:bg-white/10"
                          disabled={isSavingGoal || isDeletingRoadmap}
                        >
                          <X className="h-4 w-4" />
                          Закрыть
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {isAddTaskOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
                  <div
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    onClick={() => setIsAddTaskOpen(false)}
                  />

                  <div className="relative w-full max-w-2xl rounded-3xl border border-white/10 bg-[#080512] p-5 shadow-none">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-purple-200/70">Новая задача</p>
                        <h3 className="mt-2 text-xl font-bold text-purple-50">
                          {selectedRoadmap.goal?.title ?? `Роудмап #${selectedRoadmap.roadmap_id}`}
                        </h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsAddTaskOpen(false)}
                        className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-black/30 p-2 text-purple-100 transition hover:bg-white/10"
                        aria-label="Закрыть"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    <div className="mt-5 space-y-4">
                      <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-purple-50">Данные задачи</p>
                            <p className="mt-1 text-xs text-purple-100/60">Заполните поля и нажмите создать.</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => void handleCreateTask()}
                            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-purple-500/20 px-4 py-2 text-sm text-purple-50 transition hover:bg-purple-500/30"
                            disabled={isCreatingTask || isLoadingTasks || isDeletingRoadmap}
                          >
                            <Plus className={`h-4 w-4 ${isCreatingTask ? 'animate-pulse' : ''}`} />
                            Создать
                          </button>
                        </div>

                        <div className="mt-3 grid gap-3">
                          <input
                            value={newTaskTitle}
                            onChange={(event) => setNewTaskTitle(event.target.value)}
                            className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-purple-50 placeholder:text-purple-100/40 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                            placeholder="Название задачи"
                            disabled={isCreatingTask || isLoadingTasks || isDeletingRoadmap}
                          />
                          <textarea
                            value={newTaskDescription}
                            onChange={(event) => setNewTaskDescription(event.target.value)}
                            className="w-full resize-none rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-purple-50 placeholder:text-purple-100/40 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                            placeholder="Описание (необязательно)"
                            rows={3}
                            disabled={isCreatingTask || isLoadingTasks || isDeletingRoadmap}
                          />
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setIsAddTaskOpen(false)}
                          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-purple-100 transition hover:bg-white/10"
                          disabled={isCreatingTask || isDeletingRoadmap}
                        >
                          <X className="h-4 w-4" />
                          Отмена
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {isCreateRoadmapOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsCreateRoadmapOpen(false)}
          />

          <div className="relative w-full max-w-3xl rounded-3xl border border-white/10 bg-[#080512] p-5 shadow-none">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-purple-200/70">Новый роудмап</p>
                <h3 className="mt-2 text-xl font-bold text-purple-50">Ручное создание роудмапа</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateRoadmapOpen(false)}
                className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-black/30 p-2 text-purple-100 transition hover:bg-white/10"
                aria-label="Закрыть"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-sm font-medium text-purple-50">Параметры роудмапа</p>
                <div className="mt-3 grid gap-3">
                  <input
                    value={newRoadmapTitle}
                    onChange={(event) => setNewRoadmapTitle(event.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-purple-50 placeholder:text-purple-100/40 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                    placeholder="Название роудмапа"
                    disabled={isCreatingRoadmap}
                  />
                  <textarea
                    value={newRoadmapDescription}
                    onChange={(event) => setNewRoadmapDescription(event.target.value)}
                    className="w-full resize-none rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-purple-50 placeholder:text-purple-100/40 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                    placeholder="Описание роудмапа (необязательно)"
                    rows={3}
                    disabled={isCreatingRoadmap}
                  />
                  <input
                    value={newRoadmapTeamId}
                    onChange={(event) => setNewRoadmapTeamId(event.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-purple-50 placeholder:text-purple-100/40 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                    placeholder="ID команды, если роудмап нужно сразу привязать к команде"
                    inputMode="numeric"
                    disabled={isCreatingRoadmap}
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-purple-50">Стартовые задачи</p>
                    <p className="mt-1 text-xs text-purple-100/60">Можно оставить пустыми и создать роудмап без задач.</p>
                  </div>
                  <button
                    type="button"
                    onClick={addCreateRoadmapTask}
                    className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-purple-100 transition hover:bg-white/10"
                    disabled={isCreatingRoadmap}
                  >
                    <Plus className="h-4 w-4" />
                    Добавить задачу
                  </button>
                </div>

                <div className="mt-4 space-y-3">
                  {newRoadmapTasks.map((task, index) => (
                    <div key={index} className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-xs uppercase tracking-wide text-purple-200/60">Задача #{index + 1}</p>
                        <button
                          type="button"
                          onClick={() => removeCreateRoadmapTask(index)}
                          className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-black/20 px-3 py-1.5 text-xs text-purple-100/70 transition hover:bg-white/10"
                          disabled={isCreatingRoadmap}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Удалить
                        </button>
                      </div>

                      <div className="mt-3 grid gap-3">
                        <input
                          value={task.title}
                          onChange={(event) => handleCreateRoadmapTaskChange(index, 'title', event.target.value)}
                          className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-purple-50 placeholder:text-purple-100/40 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                          placeholder="Название задачи"
                          disabled={isCreatingRoadmap}
                        />
                        <textarea
                          value={task.description}
                          onChange={(event) => handleCreateRoadmapTaskChange(index, 'description', event.target.value)}
                          className="w-full resize-none rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-purple-50 placeholder:text-purple-100/40 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                          placeholder="Описание задачи (необязательно)"
                          rows={2}
                          disabled={isCreatingRoadmap}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateRoadmapOpen(false)}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-purple-100 transition hover:bg-white/10"
                  disabled={isCreatingRoadmap}
                >
                  <X className="h-4 w-4" />
                  Отмена
                </button>
                <button
                  type="button"
                  onClick={() => void handleCreateRoadmap()}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-purple-500/20 px-4 py-3 text-sm text-purple-50 transition hover:bg-purple-500/30"
                  disabled={isCreatingRoadmap}
                >
                  {isCreatingRoadmap ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                  Создать роудмап
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Roadmaps;
