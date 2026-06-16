import { useCallback, useState } from 'react';
import { toast } from 'react-toastify';
import { getCurrentProfile } from '../../api/auth/userClient';
import { getMyTeams, getTeamMembers, inviteUserByEmail } from '../../api/auth/teamClient';
import type { SearchUser, TeamItem } from '../../types/authTypes/authTypes';

const ADMIN_TEAM_ROLE_ID = 1;

export function useSearchInviteTeams() {
	const [selectedUser, setSelectedUser] = useState<SearchUser | null>(null);
	const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
	const [adminTeams, setAdminTeams] = useState<TeamItem[]>([]);
	const [teamsLoading, setTeamsLoading] = useState(false);
	const [teamsLoaded, setTeamsLoaded] = useState(false);
	const [teamsError, setTeamsError] = useState<string | null>(null);
	const [invitingTeamId, setInvitingTeamId] = useState<number | null>(null);

	const loadAdminTeams = useCallback(async () => {
		if (teamsLoading) {
			return;
		}

		try {
			setTeamsLoading(true);
			setTeamsError(null);

			const [profile, teamsResponse] = await Promise.all([getCurrentProfile(), getMyTeams()]);
			if (typeof profile.user_id !== 'number') {
				throw new Error('Не удалось определить текущего пользователя');
			}

			const currentUserId = profile.user_id;
			const filteredTeams = await Promise.all(
				teamsResponse.teams.map(async (team) => {
					try {
						const membersResponse = await getTeamMembers(team.team_id);
						const myMembership = membersResponse.users.find((member) => member.user_id === currentUserId);
						if (myMembership?.team_role_id === ADMIN_TEAM_ROLE_ID) {
							return team;
						}
						return null;
					} catch {
						return null;
					}
				}),
			);

			setAdminTeams(filteredTeams.filter((team): team is TeamItem => Boolean(team)));
			setTeamsLoaded(true);
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Не удалось загрузить список команд';
			setTeamsError(message);
			// Silently handle server errors for demo
		} finally {
			setTeamsLoading(false);
		}
	}, [teamsLoading]);

	const openInviteModal = useCallback(async (user: SearchUser) => {
		setSelectedUser(user);
		setIsInviteModalOpen(true);
		if (!teamsLoaded) {
			await loadAdminTeams();
		}
	}, [loadAdminTeams, teamsLoaded]);

	const closeInviteModal = useCallback(() => {
		if (invitingTeamId !== null) {
			return;
		}

		setIsInviteModalOpen(false);
		setSelectedUser(null);
		setTeamsError(null);
	}, [invitingTeamId]);

	const handleInvite = useCallback(async (team: TeamItem) => {
		if (!selectedUser) {
			return;
		}

		try {
			setInvitingTeamId(team.team_id);
			await inviteUserByEmail(team.team_id, selectedUser.user_id);
			toast.success(`Приглашение отправлено пользователю @${selectedUser.username} в команду "${team.name}"`);
			setIsInviteModalOpen(false);
			setSelectedUser(null);
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Не удалось отправить приглашение';
			// Silently handle server errors for demo
		} finally {
			setInvitingTeamId(null);
		}
	}, [selectedUser]);

	return {
		selectedUser,
		isInviteModalOpen,
		adminTeams,
		teamsLoading,
		teamsLoaded,
		teamsError,
		invitingTeamId,
		openInviteModal,
		closeInviteModal,
		handleInvite,
	};
}