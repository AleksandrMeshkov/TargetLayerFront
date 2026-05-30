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
    <div className="theme-card p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={() => onToggleComplete(task)}
            className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[rgb(var(--border-color))/0.35] bg-[rgb(var(--surface-soft))/0.45] text-[rgb(var(--muted-fg))] transition hover:bg-[rgb(var(--surface))/0.8]"
            disabled={Boolean(taskBusyIds[task.task_id])}
            aria-label={task.completed ? 'Снять отметку выполнено' : 'Отметить выполнено'}
          >
            {task.completed ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            ) : (
              <Circle className="h-5 w-5 text-[rgb(var(--accent))]" />
            )}
          </button>

          <div className="min-w-0">
            {editingTaskId !== task.task_id ? (
              <>
                <p className="font-medium text-[rgb(var(--page-fg))]">{task.order_index + 1}. {task.title}</p>
                {task.description && (
                  <p className="mt-1 text-sm leading-relaxed text-[rgb(var(--muted-fg))]">{task.description}</p>
                )}
              </>
            ) : (
              <div className="space-y-2">
                <input
                  value={editTaskTitle}
                  onChange={(e) => onChangeEditTitle(e.target.value)}
                  className="theme-input w-full px-3 py-2 text-sm"
                  placeholder="Название"
                  disabled={Boolean(taskBusyIds[task.task_id])}
                />
                <textarea
                  value={editTaskDescription}
                  onChange={(e) => onChangeEditDescription(e.target.value)}
                  className="theme-input w-full resize-none px-3 py-2 text-sm"
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
                className="theme-button-secondary px-3 py-2 text-xs"
                disabled={Boolean(taskBusyIds[task.task_id])}
              >
                <Pencil className="h-4 w-4" />
                Изменить
              </button>
              <button
                type="button"
                onClick={() => onDelete(task)}
                className="theme-button-secondary px-3 py-2 text-xs"
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
                className="theme-button-primary px-3 py-2 text-xs"
                disabled={Boolean(taskBusyIds[task.task_id])}
              >
                <Save className="h-4 w-4" />
                Сохранить
              </button>
              <button
                type="button"
                onClick={onCancelEdit}
                className="theme-button-secondary px-3 py-2 text-xs"
                disabled={Boolean(taskBusyIds[task.task_id])}
              >
                <X className="h-4 w-4" />
                Отмена
              </button>
            </>
          )}

          <div className="rounded-lg border border-[rgb(var(--border-color))/0.35] bg-[rgb(var(--surface-soft))/0.45] px-3 py-2 text-xs text-[rgb(var(--muted-fg))]">
            <p>{task.completed ? 'Выполнено' : 'Не выполнено'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
