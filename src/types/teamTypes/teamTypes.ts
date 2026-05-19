import type { TeamMemberItem, UserProfile } from '../authTypes/authTypes';

export type TeamLocationState = {
	teamName?: string;
};

export type TeamMemberView = {
	membership: TeamMemberItem;
	profile: UserProfile;
};