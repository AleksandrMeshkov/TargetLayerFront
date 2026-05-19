import React from 'react';
import { CheckCircle2, Circle, Pencil, Save, Trash2, X } from 'lucide-react';
import type { RoadmapTask } from '../../types/roadmapsTypes/roadmapsTypes';

type Props = {
  task: RoadmapTask;
  editingTaskId: number | null;
  editTaskTitle: string;
  editTaskDescription: string;
  taskBusyIds: Record<number, boolean>;
  onToggleComplete: (task: RoadmapTask) => void;
  onStartEdit: (task: RoadmapTask) => void;
  onSaveEdit: (task: RoadmapTask) => void;
  onDelete: (task: RoadmapTask) => void;
  onCancelEdit: () => void;
  onChangeEditTitle: (value: string) => void;
  onChangeEditDescription: (value: string) => void;
};

export function TaskItem({
  task,
  editingTaskId,
  editTaskTitle,
  editTaskDescription,
  taskBusyIds,
  onToggleComplete,
  onStartEdit,
  onSaveEdit,
  onDelete,
  onCancelEdit,
  onChangeEditTitle,
  onChangeEditDescription,
}: Props) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={() => onToggleComplete(task)}
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
                <p className="font-medium text-purple-50">{task.order_index + 1}. {task.title}</p>
                {task.description && (
                  <p className="mt-1 text-sm leading-relaxed text-purple-100/70">{task.description}</p>
                )}
              </>
            ) : (
              <div className="space-y-2">
                <input
                  value={editTaskTitle}
                  onChange={(e) => onChangeEditTitle(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-purple-50 placeholder:text-purple-100/40 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                  placeholder="Название"
                  disabled={Boolean(taskBusyIds[task.task_id])}
                />
                <textarea
                  value={editTaskDescription}
                  onChange={(e) => onChangeEditDescription(e.target.value)}
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
                onClick={() => onStartEdit(task)}
                className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-purple-100/70 transition hover:bg-white/10"
                disabled={Boolean(taskBusyIds[task.task_id])}
              >
                <Pencil className="h-4 w-4" />
                Изменить
              </button>
              <button
                type="button"
                onClick={() => onDelete(task)}
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
                onClick={() => onSaveEdit(task)}
                className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-purple-500/20 px-3 py-2 text-xs text-purple-50 transition hover:bg-purple-500/30"
                disabled={Boolean(taskBusyIds[task.task_id])}
              >
                <Save className="h-4 w-4" />
                Сохранить
              </button>
              <button
                type="button"
                onClick={onCancelEdit}
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
          </div>
        </div>
      </div>
    </div>
  );
}
