import React from 'react';
import { Users } from 'lucide-react';
import type { TeamCardProps } from '../../types/teamTypes/teamTypes';

export function TeamCard({ team, onOpen }: TeamCardProps) {
	return (
		<button
			type="button"
			onClick={() => onOpen(team.team_id, team.name)}
			className="w-full rounded-2xl border border-white/10 bg-black/20 p-5 text-left transition-colors hover:border-purple-500/30"
		>
			<div className="flex items-center gap-3">
				<div className="flex h-11 w-11 items-center justify-center rounded-xl border border-purple-500/20 bg-purple-500/10 text-purple-200">
					<Users className="h-5 w-5" />
				</div>
				<div className="min-w-0">
					<p className="text-xs uppercase tracking-wide text-purple-200/70">Команда</p>
					<h2 className="truncate text-lg font-semibold text-white">{team.name}</h2>
				</div>
			</div>
		</button>
	);
}