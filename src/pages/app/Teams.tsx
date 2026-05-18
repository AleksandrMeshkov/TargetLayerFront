import React, { useEffect, useState } from 'react';
import { Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { createTeam, getMyTeams } from '../../api/auth/teamClient';
import type { TeamItem } from '../../types/authTypes/authTypes';

const formatDate = (value: string): string => {
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) {
		return value;
	}
	return new Intl.DateTimeFormat('ru-RU', {
		day: '2-digit',
		month: '2-digit',
		year: 'numeric',
	}).format(date);
};

const Teams: React.FC = () => {
	const navigate = useNavigate();
	const [teams, setTeams] = useState<TeamItem[]>([]);
	const [total, setTotal] = useState(0);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [teamName, setTeamName] = useState('');
	const [creating, setCreating] = useState(false);

	useEffect(() => {
		const fetchTeams = async () => {
			try {
				setLoading(true);
				const data = await getMyTeams();
				setTeams(data.teams);
				setTotal(data.total);
				setError(null);
			} catch (err) {
				const message = err instanceof Error ? err.message : 'Не удалось загрузить команды';
				setError(message);
				toast.error(message);
			} finally {
				setLoading(false);
			}
		};

		fetchTeams();
	}, []);

	const handleCreateTeam = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const normalizedName = teamName.trim();

		if (!normalizedName) {
			toast.error('Введите название команды');
			return;
		}

		try {
			setCreating(true);
			const createdTeam = await createTeam({ name: normalizedName });
			setTeams((prev) => [createdTeam, ...prev]);
			setTotal((prev) => prev + 1);
			setTeamName('');
			toast.success('Команда успешно создана');
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Не удалось создать команду';
			toast.error(message);
		} finally {
			setCreating(false);
		}
	};

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
							<button
								key={team.team_id}
								type="button"
								onClick={() => navigate(`/app/teams/${team.team_id}`, { state: { teamName: team.name } })}
								className="w-full rounded-2xl border border-white/10 bg-black/20 p-5 text-left transition-colors hover:border-purple-500/30"
							>
								<h2 className="mt-2 text-lg font-semibold text-white">{team.name}</h2>
							</button>
						))}
					</div>
				)}
			</div>
		</section>
	);
};

export default Teams;
