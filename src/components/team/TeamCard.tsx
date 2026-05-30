import React from 'react';
import { Users } from 'lucide-react';
import type { TeamCardProps } from '../../types/teamTypes/teamTypes';

export function TeamCard({ team, onOpen }: TeamCardProps) {
	return (
		<button
			type="button"
			onClick={() => onOpen(team.team_id, team.name)}
			className="theme-panel w-full rounded-2xl p-5 text-left transition-colors hover:border-[rgb(var(--accent))/0.28]"
		>
			<div className="flex items-center gap-3">
				<div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[rgb(var(--border-color))/0.35] bg-[rgb(var(--accent))/0.12] text-[rgb(var(--accent))]">
					<Users className="h-5 w-5" />
				</div>
				<div className="min-w-0">
					<p className="text-xs uppercase tracking-wide text-[rgb(var(--muted-fg))]">Команда</p>
					<h2 className="truncate text-lg font-semibold text-[rgb(var(--page-fg))]">{team.name}</h2>
				</div>
			</div>
		</button>
	);
}