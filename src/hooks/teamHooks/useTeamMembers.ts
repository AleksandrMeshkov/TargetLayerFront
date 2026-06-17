import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getCurrentProfile, getUserById } from '../../api/auth/userClient';
import { deleteTeam, getTeamMembers, leaveTeam, removeTeamMember, renameTeam, updateMemberRole as updateMemberRoleRequest } from '../../api/auth/teamClient';
import type { TeamMemberView } from '../../types/teamTypes/teamTypes';

type UseTeamMembersParams = {
	teamId: number;
	initialTeamName?: string;
};

export function useTeamMembers({ teamId, initialTeamName = '' }: UseTeamMembersParams) {
	const navigate = useNavigate();
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [members, setMembers] = useState<TeamMemberView[]>([]);
	const [loadedOnce, setLoadedOnce] = useState(false);
	const [displayTeamName, setDisplayTeamName] = useState(initialTeamName);
	const [newTeamName, setNewTeamName] = useState(initialTeamName);
	const [savingName, setSavingName] = useState(false);
	const [deleting, setDeleting] = useState(false);
	const [removingMemberUserId, setRemovingMemberUserId] = useState<number | null>(null);
	const [myUserId, setMyUserId] = useState<number | null>(null);
	const [failedAvatarUserIds, setFailedAvatarUserIds] = useState<Set<number>>(new Set());
	const [updatingRoleUserId, setUpdatingRoleUserId] = useState<number | null>(null);

	useEffect(() => {
		setDisplayTeamName(initialTeamName);
		setNewTeamName(initialTeamName);
	}, [initialTeamName]);

	const teamTitle = useMemo(() => {
		if (displayTeamName) return displayTeamName;
		return 'Команда';
	}, [displayTeamName]);

	const myMembership = useMemo(() => {
		if (!myUserId) return null;
		return members.find((entry) => entry.membership.user_id === myUserId) ?? null;
	}, [members, myUserId]);

	const isAdmin = myMembership?.membership.team_role_id === 1;

	const refreshMembers = useCallback(async (): Promise<TeamMemberView[] | null> => {
		if (!Number.isFinite(teamId) || teamId <= 0) {
			const message = 'Некорректный идентификатор команды';
			setError(message);
			toast.error(message);
			return null;
		}

		try {
			setLoading(true);
			setError(null);

			const membersResponse = await getTeamMembers(teamId);
			const users = await Promise.all(
				membersResponse.users.map(async (membership) => {
					const profile = await getUserById(membership.user_id);
					return { membership, profile };
				}),
			);

			setMembers(users);
			setLoadedOnce(true);
			return users;
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Не удалось загрузить участников команды';
			setError(message);
			return null;
		} finally {
			setLoading(false);
		}
	}, [teamId]);

	useEffect(() => {
		setMembers([]);
		setError(null);
		setLoadedOnce(false);
		setIsModalOpen(false);
		setFailedAvatarUserIds(new Set());
		setUpdatingRoleUserId(null);
		setRemovingMemberUserId(null);

		const fetchCurrentUser = async () => {
			try {
				const me = await getCurrentProfile();
				if (typeof me.user_id === 'number') {
					setMyUserId(me.user_id);
				}
			} catch {
				return;
			}
		};

		void fetchCurrentUser();
		void refreshMembers();
	}, [refreshMembers, teamId]);

	const openTeamPanel = useCallback(async () => {
		setIsModalOpen(true);
		if (!loadedOnce) {
			await refreshMembers();
		}
	}, [loadedOnce, refreshMembers]);

	const closeTeamPanel = useCallback(() => {
		setIsModalOpen(false);
	}, []);

	const markAvatarAsFailed = useCallback((userId: number) => {
		setFailedAvatarUserIds((prev) => new Set([...prev, userId]));
	}, []);

	const updateMemberRole = useCallback(async (userId: number, newRoleId: number) => {
		if (!Number.isFinite(teamId) || teamId <= 0) {
			return;
		}

		setUpdatingRoleUserId(userId);
		try {
			const updatedMember = await updateMemberRoleRequest(teamId, userId, newRoleId);
			setMembers((prev) => prev.map((entry) => (
				entry.membership.user_id === userId
					? { ...entry, membership: { ...entry.membership, team_role_id: updatedMember.team_role_id } }
					: entry
			)));
			const roleText = newRoleId === 1 ? 'Администратор' : 'Участник';
			toast.success(`Пользователь теперь ${roleText}`);
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Не удалось обновить роль';
		} finally {
			setUpdatingRoleUserId(null);
		}
	}, [teamId]);

	const removeMember = useCallback(async (userId: number) => {
		if (!Number.isFinite(teamId) || teamId <= 0) {
			toast.error('Некорректный идентификатор команды');
			return;
		}

		const confirmed = window.confirm('Исключить участника из команды? Это действие нельзя отменить.');
		if (!confirmed) {
			return;
		}

		setRemovingMemberUserId(userId);
		try {
			await removeTeamMember(teamId, userId);
			setMembers((prev) => prev.filter((entry) => entry.membership.user_id !== userId));
			toast.success('Участник исключён из команды');
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Не удалось исключить участника';
		} finally {
			setRemovingMemberUserId(null);
		}
	}, [teamId]);

	const handleRenameTeam = useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const normalizedName = newTeamName.trim();

		if (!normalizedName) {
			toast.error('Введите новое название команды');
			return;
		}

		if (!Number.isFinite(teamId) || teamId <= 0) {
			toast.error('Некорректный идентификатор команды');
			return;
		}

		try {
			setSavingName(true);
			const updated = await renameTeam(teamId, { name: normalizedName });
			setDisplayTeamName(updated.name);
			setNewTeamName(updated.name);
			toast.success('Название команды обновлено');
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Не удалось переименовать команду';
		} finally {
			setSavingName(false);
		}
	}, [newTeamName, teamId]);

	const handleDeleteTeam = useCallback(async () => {
		if (!Number.isFinite(teamId) || teamId <= 0) {
			toast.error('Некорректный идентификатор команды');
			return;
		}

		const confirmed = window.confirm('Удалить команду? Это действие нельзя отменить.');
		if (!confirmed) {
			return;
		}

		try {
			setDeleting(true);
			await deleteTeam(teamId);
			toast.success('Команда удалена');
			navigate('/app/teams', { replace: true });
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Не удалось удалить команду';
		} finally {
			setDeleting(false);
		}
	}, [navigate, teamId]);

	const handleLeaveTeam = useCallback(async () => {
		if (!Number.isFinite(teamId) || teamId <= 0) {
			toast.error('Некорректный идентификатор команды');
			return;
		}

		const confirmed = window.confirm('Выйти из команды? Это действие нельзя отменить.');
		if (!confirmed) {
			return;
		}

		try {
			setDeleting(true);
			await leaveTeam(teamId);
			toast.success('Вы вышли из команды');
			navigate('/app/teams', { replace: true });
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Не удалось выти из команды';
		} finally {
			setDeleting(false);
		}
	}, [navigate, teamId]);

	return {
		isModalOpen,
		loading,
		error,
		members,
		loadedOnce,
		teamTitle,
		newTeamName,
		setNewTeamName,
		savingName,
		deleting,
		removingMemberUserId,
		myUserId,
		isAdmin,
		updatingRoleUserId,
		failedAvatarUserIds,
		openTeamPanel,
		closeTeamPanel,
		refreshMembers,
		handleRenameTeam,
		handleDeleteTeam,
		handleLeaveTeam,
		removeMember,
		updateMemberRole,
		markAvatarAsFailed,
	};
}