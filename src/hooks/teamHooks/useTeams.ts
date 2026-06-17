import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { createTeam, getMyTeams } from '../../api/auth/teamClient';
import type { TeamItem } from '../../types/authTypes/authTypes';

export function useTeams() {
	const [teams, setTeams] = useState<TeamItem[]>([]);
	const [total, setTotal] = useState(0);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [teamName, setTeamName] = useState('');
	const [creating, setCreating] = useState(false);

	const loadTeams = useCallback(async () => {
		try {
			setLoading(true);
			const data = await getMyTeams();
			setTeams(data.teams);
			setTotal(data.total);
			setError(null);
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Не удалось загрузить команды';
			setError(message);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		void loadTeams();
	}, [loadTeams]);

	const handleCreateTeam = useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
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
		} finally {
			setCreating(false);
		}
	}, [teamName]);

	return {
		teams,
		total,
		loading,
		error,
		teamName,
		setTeamName,
		creating,
		loadTeams,
		handleCreateTeam,
	};
}