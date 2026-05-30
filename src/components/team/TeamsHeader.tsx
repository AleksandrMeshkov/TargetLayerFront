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
		<div className="theme-panel rounded-2xl p-6 sm:p-8">
			<div className="mb-4 flex items-center gap-3">
				<Users className="theme-accent h-8 w-8" />
				<h1 className="theme-heading text-3xl font-bold">Мои команды</h1>
			</div>

			<h2 className="theme-heading text-xl font-semibold">Управление командами</h2>
			<p className="theme-muted mt-1 text-sm">Создайте новую команду</p>

			<form onSubmit={onCreateTeam} className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end">
				<div className="w-full sm:max-w-md">
					<label htmlFor="team-name" className="theme-label mb-1 text-xs">
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
						className="theme-input w-full px-4 py-2.5 text-sm"
					/>
				</div>

				<button
					type="submit"
					disabled={creating}
					className="theme-button-primary"
				>
					{creating ? 'Создание...' : 'Создать команду'}
				</button>
			</form>
		</div>
	);
}