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
        <div className="rounded-2xl p-4 theme-panel">
          <p className="text-sm font-medium theme-heading">Параметры роудмапа</p>
          <div className="mt-3 grid gap-3">
            <input
              value={title}
              onChange={(event) => onChangeTitle(event.target.value)}
              className="theme-input"
              placeholder="Название роудмапа"
              disabled={isSubmitting}
            />
            <textarea
              value={description}
              onChange={(event) => onChangeDescription(event.target.value)}
              className="theme-input"
              placeholder="Описание роудмапа (необязательно)"
              rows={3}
              disabled={isSubmitting}
            />
            <input
              value={teamId}
              onChange={(event) => onChangeTeamId(event.target.value)}
              className="theme-input"
              placeholder="ID команды, если роудмап нужно сразу привязать к команде"
              inputMode="numeric"
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className="rounded-2xl p-4 theme-panel">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium theme-heading">Стартовые задачи</p>
              <p className="mt-1 text-xs theme-muted">Можно оставить пустыми и создать роудмап без задач.</p>
            </div>
            <button
              type="button"
              onClick={onAddTask}
              className="theme-button-secondary"
              disabled={isSubmitting}
            >
              <Plus className="h-4 w-4" />
              Добавить задачу
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {tasks.map((task, index) => (
              <div key={index} className="rounded-2xl p-3 theme-card">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs uppercase tracking-wide theme-muted">Задача #{index + 1}</p>
                  <button
                    type="button"
                    onClick={() => onRemoveTask(index)}
                    className="theme-button-secondary"
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
                    className="theme-input"
                    placeholder="Название задачи"
                    disabled={isSubmitting}
                  />
                  <textarea
                    value={task.description}
                    onChange={(event) => onChangeTask(index, 'description', event.target.value)}
                    className="theme-input"
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
            className="theme-button-secondary"
            disabled={isSubmitting}
          >
            Отмена
          </button>
          <button
            type="button"
            onClick={onSubmit}
            className="theme-button-primary"
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
