import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Circle, LoaderCircle, Map, RefreshCw } from 'lucide-react';
import { toast } from 'react-toastify';
import { getMyRoadmaps, getRoadmapTasks, type RoadmapItem, type RoadmapTask } from '../../api/roadmaps';

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
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const loadRoadmaps = async () => {
      setIsLoadingRoadmaps(true);
      try {
        const response = await getMyRoadmaps();
        const items = [...response.roadmaps].sort((left, right) => (
          new Date(right.updated_at).getTime() - new Date(left.updated_at).getTime()
        ));

        setRoadmaps(items);

        if (items.length > 0) {
          const firstRoadmapId = items[0].roadmap_id;
          setSelectedRoadmapId(firstRoadmapId);

          if (!tasksCache[firstRoadmapId]) {
            setIsLoadingTasks(true);
            try {
              const tasks = await getRoadmapTasks(firstRoadmapId);
              setTasksCache((prev) => ({ ...prev, [firstRoadmapId]: sortTasks(tasks) }));
            } catch (error) {
              const message = error instanceof Error ? error.message : 'Не удалось загрузить задачи роудмапа';
              toast.error(message);
            } finally {
              setIsLoadingTasks(false);
            }
          }
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Не удалось загрузить роудмапы';
        toast.error(message);
      } finally {
        setIsLoadingRoadmaps(false);
      }
    };

    void loadRoadmaps();
  }, []);

  const selectedRoadmap = useMemo(
    () => roadmaps.find((roadmap) => roadmap.roadmap_id === selectedRoadmapId) ?? null,
    [roadmaps, selectedRoadmapId],
  );

  const selectedTasks = selectedRoadmapId != null ? tasksCache[selectedRoadmapId] : undefined;

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

  const handleRefresh = async (): Promise<void> => {
    setIsRefreshing(true);
    try {
      const response = await getMyRoadmaps();
      const items = [...response.roadmaps].sort((left, right) => (
        new Date(right.updated_at).getTime() - new Date(left.updated_at).getTime()
      ));

      setRoadmaps(items);

      if (items.length === 0) {
        setSelectedRoadmapId(null);
        setTasksCache({});
        return;
      }

      const currentSelected = items.some((roadmap) => roadmap.roadmap_id === selectedRoadmapId)
        ? selectedRoadmapId
        : items[0].roadmap_id;

      if (currentSelected != null) {
        setSelectedRoadmapId(currentSelected);
        if (!tasksCache[currentSelected]) {
          setIsLoadingTasks(true);
          try {
            const tasks = await getRoadmapTasks(currentSelected);
            setTasksCache((prev) => ({ ...prev, [currentSelected]: sortTasks(tasks) }));
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Не удалось загрузить задачи роудмапа';
            toast.error(message);
          } finally {
            setIsLoadingTasks(false);
          }
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Не удалось обновить роудмапы';
      toast.error(message);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <section className="space-y-6">
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

          <button
            type="button"
            onClick={() => void handleRefresh()}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-black/30 px-4 py-2 text-sm text-purple-100 transition hover:bg-white/10"
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Обновить
          </button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[360px_minmax(0,1fr)]">
        <aside className="rounded-2xl border border-white/10 bg-black/30 p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs uppercase tracking-wide text-purple-200/70">Мои роудмапы</p>
            <span className="rounded-lg border border-white/10 px-2 py-1 text-xs text-purple-100/70">
              {roadmaps.length}
            </span>
          </div>

          <div className="space-y-2">
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

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 sm:p-6">
          {!selectedRoadmap && !isLoadingRoadmaps && (
            <div className="rounded-xl border border-dashed border-white/15 bg-white/[0.02] px-4 py-10 text-center text-sm text-purple-100/60">
              Выберите роудмап, чтобы увидеть его задачи.
            </div>
          )}

          {selectedRoadmap && (
            <div className="space-y-5">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-purple-200/70">Активный роудмап</p>
                    <h2 className="mt-2 text-2xl font-bold text-purple-50">
                      {selectedRoadmap.goal?.title ?? `Роудмап #${selectedRoadmap.roadmap_id}`}
                    </h2>
                    {selectedRoadmap.goal?.description && (
                      <p className="mt-2 max-w-3xl text-sm text-purple-100/75">
                        {selectedRoadmap.goal.description}
                      </p>
                    )}
                  </div>

                  <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-purple-100/75">
                    <p>Статус: {selectedRoadmap.completed ? 'Завершен' : 'В процессе'}</p>
                    <p className="mt-1">Задач: {selectedTasks?.length ?? selectedRoadmap.tasks.length}</p>
                  </div>
                </div>
              </div>

              <div>
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-medium text-purple-100/80">Задачи роудмапа</p>
                  {isLoadingTasks && (
                    <span className="inline-flex items-center gap-2 text-xs text-purple-200/70">
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                      Загружаю задачи...
                    </span>
                  )}
                </div>

                <div className="space-y-3">
                  {sortTasks(selectedTasks ?? selectedRoadmap.tasks).map((task) => (
                    <div
                      key={task.task_id}
                      className="rounded-2xl border border-white/10 bg-black/20 p-4"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          {task.completed ? (
                            <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-400" />
                          ) : (
                            <Circle className="mt-0.5 h-5 w-5 text-purple-300" />
                          )}
                          <div>
                            <p className="font-medium text-purple-50">
                              {task.order_index + 1}. {task.title}
                            </p>
                            {task.description && (
                              <p className="mt-1 text-sm text-purple-100/70">{task.description}</p>
                            )}
                          </div>
                        </div>

                        <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-purple-100/70">
                          <p>{task.completed ? 'Выполнено' : 'Не выполнено'}</p>
                          <p className="mt-1">Создано: {formatDate(task.created_at)}</p>
                        </div>
                      </div>
                    </div>
                  ))}

                  {!isLoadingTasks && sortTasks(selectedTasks ?? selectedRoadmap.tasks).length === 0 && (
                    <div className="rounded-xl border border-dashed border-white/15 bg-white/[0.02] px-4 py-8 text-sm text-purple-100/60">
                      У этого роудмапа пока нет задач.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Roadmaps;
