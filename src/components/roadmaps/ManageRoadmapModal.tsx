import React from 'react';
import { LoaderCircle, Save, Trash2 } from 'lucide-react';
import { BaseModal } from './BaseModal';
import type { RoadmapItem } from '../../types/roadmapsTypes/roadmapsTypes';

type ManageRoadmapModalProps = {
  isOpen: boolean;
  selectedRoadmap: RoadmapItem | null;
  goalTitleDraft: string;
  goalDescriptionDraft: string;
  isSavingGoal: boolean;
  isDeletingRoadmap: boolean;
  onClose: () => void;
  onSaveGoal: () => void;
  onDeleteRoadmap: () => void;
  onChangeGoalTitle: (value: string) => void;
  onChangeGoalDescription: (value: string) => void;
};

export function ManageRoadmapModal({
  isOpen,
  selectedRoadmap,
  goalTitleDraft,
  goalDescriptionDraft,
  isSavingGoal,
  isDeletingRoadmap,
  onClose,
  onSaveGoal,
  onDeleteRoadmap,
  onChangeGoalTitle,
  onChangeGoalDescription,
}: ManageRoadmapModalProps) {
  if (!selectedRoadmap) {
    return null;
  }

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={selectedRoadmap.goal?.title ?? `Роудмап #${selectedRoadmap.roadmap_id}`}
      subtitle="Управление роудмапом"
    >
      <div className="space-y-4">
        <div className="rounded-2xl p-4 theme-panel">
          <p className="text-sm font-medium theme-heading">Цель</p>
          <div className="mt-3 grid gap-3">
            <input
              value={goalTitleDraft}
              onChange={(event) => onChangeGoalTitle(event.target.value)}
              className="theme-input"
              placeholder="Название цели"
              disabled={isSavingGoal || isDeletingRoadmap}
            />
            <textarea
              value={goalDescriptionDraft}
              onChange={(event) => onChangeGoalDescription(event.target.value)}
              className="theme-input"
              placeholder="Описание цели (необязательно)"
              rows={4}
              disabled={isSavingGoal || isDeletingRoadmap}
            />
            <div className="flex flex-wrap items-center justify-end gap-2">
              <button
                type="button"
                onClick={onSaveGoal}
                className="theme-button-primary"
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
            onClick={onDeleteRoadmap}
            className="theme-button-secondary"
            disabled={isSavingGoal || isDeletingRoadmap}
          >
            {isDeletingRoadmap ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            Удалить роудмап
          </button>

          <button
            type="button"
            onClick={onClose}
            className="theme-button-secondary"
            disabled={isSavingGoal || isDeletingRoadmap}
          >
            Закрыть
          </button>
        </div>
      </div>
    </BaseModal>
  );
}
