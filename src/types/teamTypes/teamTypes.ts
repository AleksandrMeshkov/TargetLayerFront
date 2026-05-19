import type { TeamItem, TeamMemberItem, UserProfile } from '../authTypes/authTypes';

export type TeamNavigationState = {
	teamName?: string;
};

export type TeamCardProps = {
	team: TeamItem;
	onOpen: (teamId: number, teamName: string) => void;
};

export type TeamLocationState = {
	teamName?: string;
};

export type TeamMemberView = {
	membership: TeamMemberItem;
	profile: UserProfile;
};