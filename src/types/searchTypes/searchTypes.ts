import type { SearchUser, TeamItem } from '../authTypes/authTypes';

export type SearchUserCardProps = {
	user: SearchUser;
	failedAvatarUserIds: Set<number>;
	onAvatarError: (userId: number) => void;
	onCreateChat: (user: SearchUser) => void;
	onOpenInvite: (user: SearchUser) => void;
	creatingChatUserId: number | null;
};

export type SearchInviteModalProps = {
	isOpen: boolean;
	selectedUser: SearchUser | null;
	teamsLoading: boolean;
	teamsError: string | null;
	adminTeams: TeamItem[];
	invitingTeamId: number | null;
	onClose: () => void;
	onInvite: (team: TeamItem) => void;
};