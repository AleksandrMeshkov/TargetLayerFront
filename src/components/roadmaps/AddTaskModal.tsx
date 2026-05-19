import React from 'react';
import { LoaderCircle, Plus } from 'lucide-react';
import { BaseModal } from './BaseModal';
import type { RoadmapItem } from '../../types/roadmapsTypes/roadmapsTypes';

type AddTaskModalProps = {
  isOpen: boolean;
  selectedRoadmap: RoadmapItem | null;
  isSubmitting: boolean;
  isLoadingTasks: boolean;
  isDeletingRoadmap: boolean;
  title: string;
  description: string;
  onClose: () => void;
  onSubmit: () => void;
  onChangeTitle: (value: string) => void;
  onChangeDescription: (value: string) => void;
};

export function AddTaskModal({
  isOpen,
  selectedRoadmap,
  isSubmitting,
  isLoadingTasks,
  isDeletingRoadmap,
  title,
  description,
  onClose,
  onSubmit,
  onChangeTitle,
  onChangeDescription,
}: AddTaskModalProps) {
  if (!selectedRoadmap) {
    return null;
  }

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={selectedRoadmap.goal?.title ?? `Роудмап #${selectedRoadmap.roadmap_id}`}
      subtitle="Новая задача"
    >
      <div className="space-y-4">
        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-purple-50">Данные задачи</p>
              <p className="mt-1 text-xs text-purple-100/60">Заполните поля и нажмите создать.</p>
            </div>
            <button
              type="button"
              onClick={onSubmit}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-purple-500/20 px-4 py-2 text-sm text-purple-50 transition hover:bg-purple-500/30"
              disabled={isSubmitting || isLoadingTasks || isDeletingRoadmap}
            >
              {isSubmitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Создать
            </button>
          </div>

          <div className="mt-3 grid gap-3">
            <input
              value={title}
              onChange={(event) => onChangeTitle(event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-purple-50 placeholder:text-purple-100/40 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
              placeholder="Название задачи"
              disabled={isSubmitting || isLoadingTasks || isDeletingRoadmap}
            />
            <textarea
              value={description}
              onChange={(event) => onChangeDescription(event.target.value)}
              className="w-full resize-none rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-purple-50 placeholder:text-purple-100/40 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
              placeholder="Описание (необязательно)"
              rows={3}
              disabled={isSubmitting || isLoadingTasks || isDeletingRoadmap}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-purple-100 transition hover:bg-white/10"
            disabled={isSubmitting || isDeletingRoadmap}
          >
            Отмена
          </button>
        </div>
      </div>
    </BaseModal>
  );
}
