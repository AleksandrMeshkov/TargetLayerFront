import React from 'react';
import type { RoadmapItem } from '../../types/roadmapsTypes/roadmapsTypes';

type RoadmapCardProps = {
	roadmap: RoadmapItem;
	isSelected: boolean;
	onSelect: (roadmapId: number) => void;
};

export function RoadmapCard({ roadmap, isSelected, onSelect }: RoadmapCardProps) {
	return (
		<div
			className={`w-full rounded-xl border bg-black/20 p-4 text-left transition-colors ${
				isSelected ? 'border-purple-400/60' : 'border-white/10 hover:border-purple-500/30'
			}`}
		>
			<button type="button" onClick={() => onSelect(roadmap.roadmap_id)} className="block w-full text-left">
				<div className="flex items-start justify-between gap-3">
					<div>
						<p className="text-xs uppercase tracking-wide text-purple-200/70">Список задач</p>
						<h3 className="mt-2 text-sm font-semibold text-white">{roadmap.goal?.title ?? 'Роудмап'}</h3>
					</div>
					<span className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-purple-100/80">
						{roadmap.tasks.length} задач
					</span>
				</div>

				{roadmap.goal?.description && (
					<p className="mt-2 line-clamp-3 text-xs text-purple-100/70">{roadmap.goal.description}</p>
				)}
			</button>
		</div>
	);
}