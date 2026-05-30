import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TeamCard } from '../../components/team/TeamCard';
import { TeamsHeader } from '../../components/team/TeamsHeader';
import { useTeams } from '../../hooks/teamHooks/useTeams';

const Teams: React.FC = () => {
	const navigate = useNavigate();
	const { teams, total, loading, error, teamName, setTeamName, creating, handleCreateTeam } = useTeams();

	return (
		<section className="space-y-6">
			<TeamsHeader
				teamName={teamName}
				creating={creating}
				onTeamNameChange={setTeamName}
				onCreateTeam={handleCreateTeam}
			/>

			<div className="theme-panel rounded-2xl p-6 sm:p-8">
				<div className="my-6 h-px w-full bg-[rgb(var(--border-color))/0.35]" />

				<p className="theme-muted text-sm">Всего команд: {total}</p>

				{loading && (
					<p className="theme-panel mt-6 rounded-xl px-4 py-3 text-sm">
						Загрузка списка команд...
					</p>
				)}

				{!loading && error && (
					<p className="mt-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-200">
						{error}
					</p>
				)}

				{!loading && !error && teams.length === 0 && (
					<p className="theme-panel mt-6 rounded-xl px-4 py-3 text-sm">
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
