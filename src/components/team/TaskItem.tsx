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
		<div className="theme-card p-4">
			<div className="flex flex-wrap items-start justify-between gap-3">
				<div className="flex items-start gap-3">
					<button
						type="button"
						onClick={() => onToggleComplete(task)}
						disabled={busy}
						className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[rgb(var(--border-color))/0.35] bg-[rgb(var(--surface-soft))/0.45] text-[rgb(var(--muted-fg))] transition hover:bg-[rgb(var(--surface))/0.8] disabled:opacity-60"
						aria-label={task.completed ? 'Снять отметку выполнено' : 'Отметить выполнено'}
						title={task.completed ? 'Снять отметку выполнено' : 'Отметить выполнено'}
					>
						{task.completed ? (
							<CheckCircle2 className="h-5 w-5 text-emerald-400" />
						) : (
							<Circle className="h-5 w-5 text-[rgb(var(--accent))]" />
						)}
					</button>

					<div className="min-w-0">
						<p className="font-medium theme-heading">
							{task.order_index + 1}. {task.title}
						</p>
						{task.description && (
							<p className="mt-1 text-sm leading-relaxed theme-muted">{task.description}</p>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}