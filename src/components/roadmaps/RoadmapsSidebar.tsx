import React from 'react';
import { LoaderCircle } from 'lucide-react';
import type { RoadmapItem } from '../../types/roadmapsTypes/roadmapsTypes';

type RoadmapsSidebarProps = {
  roadmaps: RoadmapItem[];
  selectedRoadmapId: number | null;
  isLoading: boolean;
  getRoadmapTaskCount: (roadmapId: number) => number;
  onSelectRoadmap: (roadmapId: number) => void;
};

export function RoadmapsSidebar({
  roadmaps,
  selectedRoadmapId,
  isLoading,
  getRoadmapTaskCount,
  onSelectRoadmap,
}: RoadmapsSidebarProps) {
  return (
    <aside className="theme-panel flex min-h-0 flex-col rounded-2xl p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs uppercase tracking-wide text-[rgb(var(--muted-fg))]">Мои роудмапы</p>
        <span className="rounded-lg border border-[rgb(var(--border-color))/0.35] px-2 py-1 text-xs text-[rgb(var(--muted-fg))]">
          {roadmaps.length}
        </span>
      </div>

      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
        {isLoading && (
          <div className="flex items-center gap-2 rounded-xl border border-[rgb(var(--border-color))/0.35] bg-[rgb(var(--surface-soft))/0.45] px-4 py-3 text-sm text-[rgb(var(--muted-fg))]">
            <LoaderCircle className="h-4 w-4 animate-spin" />
            Загружаю роудмапы...
          </div>
        )}

        {!isLoading && roadmaps.length === 0 && (
          <div className="rounded-xl border border-dashed border-[rgb(var(--border-color))/0.35] bg-[rgb(var(--surface-soft))/0.35] px-4 py-6 text-sm text-[rgb(var(--muted-fg))]">
            Роудмапы не найдены.
          </div>
        )}

        {roadmaps.map((roadmap) => {
          const isActive = roadmap.roadmap_id === selectedRoadmapId;

          return (
            <button
              key={roadmap.roadmap_id}
              type="button"
              onClick={() => onSelectRoadmap(roadmap.roadmap_id)}
              className={`w-full rounded-xl border px-4 py-3 text-left transition ${
                isActive
                    ? 'border-[rgb(var(--accent))/0.35] bg-[rgb(var(--accent))/0.12]'
                    : 'border-[rgb(var(--border-color))/0.35] bg-[rgb(var(--surface-soft))/0.45] hover:border-[rgb(var(--accent))/0.24] hover:bg-[rgb(var(--surface))/0.8]'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-sm font-semibold text-[rgb(var(--page-fg))]">
                    {roadmap.goal?.title ?? `Роудмап #${roadmap.roadmap_id}`}
                  </p>
                </div>
                  <span className="rounded-lg border border-[rgb(var(--border-color))/0.35] px-2 py-1 text-xs text-[rgb(var(--muted-fg))]">
                  {getRoadmapTaskCount(roadmap.roadmap_id)} задач
                </span>
              </div>

              {roadmap.goal?.description && (
                  <p className="mt-2 line-clamp-2 text-sm text-[rgb(var(--muted-fg))]">
                  {roadmap.goal.description}
                </p>
              )}
            </button>
          );
        })}
      </div>
    </aside>
  );
}
