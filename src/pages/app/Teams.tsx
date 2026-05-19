import React from 'react';
import { Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { TeamCard } from '../../components/team/TeamCard';
import { useTeams } from '../../hooks/teamHooks/useTeams';

const Teams: React.FC = () => {
	const navigate = useNavigate();
	const { teams, total, loading, error, teamName, setTeamName, creating, handleCreateTeam } = useTeams();

	return (
		<section className="space-y-6">
			<div className="rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8">
				<div className="mb-4 flex items-center gap-3">
					<Users className="h-8 w-8 text-purple-400" />
					<h1 className="text-3xl font-bold">Мои команды</h1>
				</div>

				<h2 className="text-xl font-semibold text-white">Управление командами</h2>
				<p className="mt-1 text-sm text-purple-100/60">Создайте новую команду</p>

				<form onSubmit={handleCreateTeam} className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end">
					<div className="w-full sm:max-w-md">
						<label htmlFor="team-name" className="mb-1 block text-xs font-medium text-purple-200">
							Название команды
						</label>
						<input
							id="team-name"
							type="text"
							value={teamName}
							onChange={(event) => setTeamName(event.target.value)}
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

				<div className="my-6 h-px w-full bg-white/10" />

				<p className="text-sm text-purple-100/60">Всего команд: {total}</p>

				{loading && (
					<p className="mt-6 rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-purple-100/70">
						Загрузка списка команд...
					</p>
				)}

				{!loading && error && (
					<p className="mt-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
						{error}
					</p>
				)}

				{!loading && !error && teams.length === 0 && (
					<p className="mt-6 rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-purple-100/70">
						Вы пока не состоите ни в одной команде.
					</p>
				)}

				{!loading && !error && teams.length > 0 && (
					<div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
						{teams.map((team) => (
							<TeamCard
								key={team.team_id}
								team={team}
								onOpen={(teamId, teamTitle) => {
									navigate(`/app/teams/${teamId}`, { state: { teamName: teamTitle } });
								}}
							/>
						))}
					</div>
				)}
			</div>
		</section>
	);
};

export default Teams;
