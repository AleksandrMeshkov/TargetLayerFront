import React from 'react';
import { Map, Pencil, Plus } from 'lucide-react';
import type { RoadmapItem } from '../../types/roadmapsTypes/roadmapsTypes';

type RoadmapsHeaderProps = {
  selectedRoadmap: RoadmapItem | null;
  onOpenCreateRoadmap: () => void;
  onOpenManageRoadmap: () => void;
  isCreateDisabled: boolean;
  isManageDisabled: boolean;
};

export function RoadmapsHeader({
  selectedRoadmap,
  onOpenCreateRoadmap,
  onOpenManageRoadmap,
  isCreateDisabled,
  isManageDisabled,
}: RoadmapsHeaderProps) {
  return (
    <div className="theme-panel rounded-3xl p-6 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Map className="theme-accent h-8 w-8" />
          <div>
            <h1 className="theme-heading text-3xl font-bold">Роудмапы</h1>
            <p className="theme-muted mt-2 max-w-2xl text-sm">
              Выберите роудмап слева, чтобы посмотреть все его задачи.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onOpenCreateRoadmap}
            className="theme-button-primary"
            disabled={isCreateDisabled}
          >
            <Plus className="h-4 w-4" />
            Создать роудмап
          </button>

          {selectedRoadmap ? (
            <button
              type="button"
              onClick={onOpenManageRoadmap}
              className="theme-button-secondary"
              disabled={isManageDisabled}
            >
              <Pencil className="h-4 w-4" />
              Управление
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
