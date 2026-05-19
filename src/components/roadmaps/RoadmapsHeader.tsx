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
            onClick={onOpenCreateRoadmap}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-purple-500/20 px-4 py-2 text-sm text-purple-50 transition hover:bg-purple-500/30"
            disabled={isCreateDisabled}
          >
            <Plus className="h-4 w-4" />
            Создать роудмап
          </button>

          {selectedRoadmap ? (
            <button
              type="button"
              onClick={onOpenManageRoadmap}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-black/30 px-4 py-2 text-sm text-purple-100 transition hover:bg-white/10"
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
