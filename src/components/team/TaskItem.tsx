import React from 'react';
import { CheckCircle2, Circle } from 'lucide-react';
import type { RoadmapTask } from '../../types/roadmapsTypes/roadmapsTypes';

type TaskItemProps = {
	task: RoadmapTask;
	busy?: boolean;
	onToggleComplete: (task: RoadmapTask) => void;
};

export function TaskItem({ task, busy = false, onToggleComplete }: TaskItemProps) {
	return (
		<div className="rounded-2xl border border-white/10 bg-black/20 p-4">
			<div className="flex flex-wrap items-start justify-between gap-3">
				<div className="flex items-start gap-3">
					<button
						type="button"
						onClick={() => onToggleComplete(task)}
						disabled={busy}
						className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-purple-100/80 transition hover:bg-white/10 disabled:opacity-60"
						aria-label={task.completed ? 'Снять отметку выполнено' : 'Отметить выполнено'}
						title={task.completed ? 'Снять отметку выполнено' : 'Отметить выполнено'}
					>
						{task.completed ? (
							<CheckCircle2 className="h-5 w-5 text-emerald-400" />
						) : (
							<Circle className="h-5 w-5 text-purple-300" />
						)}
					</button>

					<div className="min-w-0">
						<p className="font-medium text-purple-50">
							{task.order_index + 1}. {task.title}
						</p>
						{task.description && (
							<p className="mt-1 text-sm leading-relaxed text-purple-100/70">{task.description}</p>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}