import React from 'react';
import { LoaderCircle, Plus, Trash2 } from 'lucide-react';
import { BaseModal } from './BaseModal';

type RoadmapTaskDraft = {
  title: string;
  description: string;
};

type CreateRoadmapModalProps = {
  isOpen: boolean;
  isSubmitting: boolean;
  title: string;
  description: string;
  teamId: string;
  tasks: RoadmapTaskDraft[];
  onClose: () => void;
  onSubmit: () => void;
  onChangeTitle: (value: string) => void;
  onChangeDescription: (value: string) => void;
  onChangeTeamId: (value: string) => void;
  onChangeTask: (index: number, field: keyof RoadmapTaskDraft, value: string) => void;
  onAddTask: () => void;
  onRemoveTask: (index: number) => void;
};

export function CreateRoadmapModal({
  isOpen,
  isSubmitting,
  title,
  description,
  teamId,
  tasks,
  onClose,
  onSubmit,
  onChangeTitle,
  onChangeDescription,
  onChangeTeamId,
  onChangeTask,
  onAddTask,
  onRemoveTask,
}: CreateRoadmapModalProps) {
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Ручное создание роудмапа"
      subtitle="Новый роудмап"
      maxWidthClassName="max-w-3xl"
    >
      <div className="space-y-4">
        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <p className="text-sm font-medium text-purple-50">Параметры роудмапа</p>
          <div className="mt-3 grid gap-3">
            <input
              value={title}
              onChange={(event) => onChangeTitle(event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-purple-50 placeholder:text-purple-100/40 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
              placeholder="Название роудмапа"
              disabled={isSubmitting}
            />
            <textarea
              value={description}
              onChange={(event) => onChangeDescription(event.target.value)}
              className="w-full resize-none rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-purple-50 placeholder:text-purple-100/40 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
              placeholder="Описание роудмапа (необязательно)"
              rows={3}
              disabled={isSubmitting}
            />
            <input
              value={teamId}
              onChange={(event) => onChangeTeamId(event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-purple-50 placeholder:text-purple-100/40 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
              placeholder="ID команды, если роудмап нужно сразу привязать к команде"
              inputMode="numeric"
              disabled={isSubmitting}
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
              onClick={onAddTask}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-purple-100 transition hover:bg-white/10"
              disabled={isSubmitting}
            >
              <Plus className="h-4 w-4" />
              Добавить задачу
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {tasks.map((task, index) => (
              <div key={index} className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs uppercase tracking-wide text-purple-200/60">Задача #{index + 1}</p>
                  <button
                    type="button"
                    onClick={() => onRemoveTask(index)}
                    className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-black/20 px-3 py-1.5 text-xs text-purple-100/70 transition hover:bg-white/10"
                    disabled={isSubmitting}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Удалить
                  </button>
                </div>

                <div className="mt-3 grid gap-3">
                  <input
                    value={task.title}
                    onChange={(event) => onChangeTask(index, 'title', event.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-purple-50 placeholder:text-purple-100/40 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                    placeholder="Название задачи"
                    disabled={isSubmitting}
                  />
                  <textarea
                    value={task.description}
                    onChange={(event) => onChangeTask(index, 'description', event.target.value)}
                    className="w-full resize-none rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-purple-50 placeholder:text-purple-100/40 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                    placeholder="Описание задачи (необязательно)"
                    rows={2}
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-purple-100 transition hover:bg-white/10"
            disabled={isSubmitting}
          >
            Отмена
          </button>
          <button
            type="button"
            onClick={onSubmit}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-purple-500/20 px-4 py-3 text-sm text-purple-50 transition hover:bg-purple-500/30"
            disabled={isSubmitting}
          >
            {isSubmitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Создать роудмап
          </button>
        </div>
      </div>
    </BaseModal>
  );
}
