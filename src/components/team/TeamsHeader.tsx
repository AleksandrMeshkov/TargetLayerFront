import React from 'react';
import { Users } from 'lucide-react';

type TeamsHeaderProps = {
	teamName: string;
	creating: boolean;
	onTeamNameChange: (value: string) => void;
	onCreateTeam: (event: React.FormEvent<HTMLFormElement>) => void;
};

export function TeamsHeader({ teamName, creating, onTeamNameChange, onCreateTeam }: TeamsHeaderProps) {
	return (
		<div className="rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8">
			<div className="mb-4 flex items-center gap-3">
				<Users className="h-8 w-8 text-purple-400" />
				<h1 className="text-3xl font-bold">Мои команды</h1>
			</div>

			<h2 className="text-xl font-semibold text-white">Управление командами</h2>
			<p className="mt-1 text-sm text-purple-100/60">Создайте новую команду</p>

			<form onSubmit={onCreateTeam} className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end">
				<div className="w-full sm:max-w-md">
					<label htmlFor="team-name" className="mb-1 block text-xs font-medium text-purple-200">
						Название команды
					</label>
					<input
						id="team-name"
						type="text"
						value={teamName}
						onChange={(event) => onTeamNameChange(event.target.value)}
						maxLength={255}
						placeholder="Например, Frontend Crew"
						disabled={creating}
						className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-white outline-none placeholder:text-purple-100/40"
					/>
				</div>

				<button
					type="submit"
					disabled={creating}
					className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-purple-500 disabled:opacity-60"
				>
					{creating ? 'Создание...' : 'Создать команду'}
				</button>
			</form>
		</div>
	);
}