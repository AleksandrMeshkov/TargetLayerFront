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
    <aside className="flex min-h-0 flex-col rounded-2xl border border-white/10 bg-black/30 p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs uppercase tracking-wide text-purple-200/70">Мои роудмапы</p>
        <span className="rounded-lg border border-white/10 px-2 py-1 text-xs text-purple-100/70">
          {roadmaps.length}
        </span>
      </div>

      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
        {isLoading && (
          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-purple-100/70">
            <LoaderCircle className="h-4 w-4 animate-spin" />
            Загружаю роудмапы...
          </div>
        )}

        {!isLoading && roadmaps.length === 0 && (
          <div className="rounded-xl border border-dashed border-white/15 bg-white/[0.02] px-4 py-6 text-sm text-purple-100/60">
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
                  ? 'border-purple-400/60 bg-purple-500/20'
                  : 'border-white/10 bg-white/5 hover:border-purple-300/40 hover:bg-white/10'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-purple-50">
                    {roadmap.goal?.title ?? `Роудмап #${roadmap.roadmap_id}`}
                  </p>
                </div>
                <span className="rounded-lg border border-white/10 px-2 py-1 text-xs text-purple-100/70">
                  {getRoadmapTaskCount(roadmap.roadmap_id)} задач
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
  );
}
