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
			className={`w-full rounded-xl border p-4 text-left transition-colors ${
				isSelected
					? 'border-[rgb(var(--accent))/0.35] bg-[rgb(var(--accent))/0.12]'
					: 'border-[rgb(var(--border-color))/0.35] bg-[rgb(var(--surface-soft))/0.45] hover:border-[rgb(var(--accent))/0.24] hover:bg-[rgb(var(--surface))/0.8]'
			}`}
		>
			<button type="button" onClick={() => onSelect(roadmap.roadmap_id)} className="block w-full text-left">
				<div className="flex items-start justify-between gap-3">
					<div>
						<p className="text-xs uppercase tracking-wide text-[rgb(var(--muted-fg))]">Список задач</p>
						<h3 className="mt-2 text-sm font-semibold text-[rgb(var(--page-fg))]">{roadmap.goal?.title ?? 'Роудмап'}</h3>
					</div>
					<span className="rounded-lg border border-[rgb(var(--border-color))/0.35] bg-[rgb(var(--surface-soft))/0.45] px-2 py-1 text-[11px] text-[rgb(var(--muted-fg))]">
						{roadmap.tasks.length} задач
					</span>
				</div>

				{roadmap.goal?.description && (
					<p className="mt-2 line-clamp-3 text-xs text-[rgb(var(--muted-fg))]">{roadmap.goal.description}</p>
				)}
			</button>
		</div>
	);
}