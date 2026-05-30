import React from 'react';
import { Shield, Users } from 'lucide-react';
import { API_BASE_URL } from '../../api/apiBase/apiBase';
import type { TeamMemberView } from '../../types/teamTypes/teamTypes';

type TeamMemberItemProps = {
	member: TeamMemberView;
	isAdmin: boolean;
	myUserId: number | null;
	updatingRoleUserId: number | null;
	failedAvatarUserIds: Set<number>;
	onAvatarError: (userId: number) => void;
	onUpdateRole: (userId: number, roleId: number) => void;
};

const buildAvatarUrl = (avatarPath: string | null | undefined): string | null => {
	if (!avatarPath) return null;
	if (avatarPath.startsWith('http')) return avatarPath;
	return `${API_BASE_URL}${avatarPath.startsWith('/') ? '' : '/'}${avatarPath}`;
};

const getFullName = (member: TeamMemberView): string => {
	return [member.profile.surname, member.profile.name, member.profile.patronymic].filter(Boolean).join(' ');
};

const getInitials = (member: TeamMemberView): string => {
	const first = member.profile.name?.[0] ?? '';
	const second = member.profile.surname?.[0] ?? '';
	return `${first}${second}`.toUpperCase() || '??';
};

const formatRole = (teamRoleId: number): string => {
	if (teamRoleId === 1) return 'Администратор';
	if (teamRoleId === 2) return 'Участник';
	return `Роль #${teamRoleId}`;
};

export function TeamMemberItem({
	member,
	isAdmin,
	myUserId,
	updatingRoleUserId,
	failedAvatarUserIds,
	onAvatarError,
	onUpdateRole,
}: TeamMemberItemProps) {
	const { membership, profile } = member;
	const avatarUrl = buildAvatarUrl(profile.avatar_url);
	const hasFailedAvatar = failedAvatarUserIds.has(membership.user_id);

	return (
		<article className="flex items-center justify-between rounded-xl p-4 theme-card">
			<div className="flex items-center gap-3">
				{(avatarUrl && !hasFailedAvatar) ? (
					<img
						src={avatarUrl}
						alt={`Аватар ${profile.username ?? `user-${membership.user_id}`}`}
						onError={() => onAvatarError(membership.user_id)}
						className="h-11 w-11 rounded-full border border-[rgb(var(--border-color))/0.12] object-cover"
					/>
				) : (
					<div className="flex h-11 w-11 items-center justify-center rounded-full border border-[rgb(var(--border-color))/0.12] bg-gradient-to-br from-[rgb(var(--accent))] to-[rgb(var(--accent-strong))] text-xs font-semibold text-[rgb(var(--accent-foreground))]">
						{getInitials(member)}
					</div>
				)}

				<div>
					<p className="text-sm font-semibold theme-heading">{getFullName(member)}</p>
					<p className="text-xs theme-muted">@{profile.username ?? `user-${membership.user_id}`}</p>
				</div>
			</div>

			{isAdmin && membership.user_id !== myUserId ? (
				<div className="flex items-center gap-2">
					{membership.team_role_id === 2 && (
						<button
							type="button"
							onClick={() => onUpdateRole(membership.user_id, 1)}
							disabled={updatingRoleUserId === membership.user_id}
							className="theme-button-primary px-3 py-1 text-xs disabled:opacity-60"
							title="Назначить администратором"
						>
							<Shield className="h-3 w-3" />
							{updatingRoleUserId === membership.user_id ? '...' : 'Администратор'}
						</button>
					)}
					{membership.team_role_id === 1 && (
						<button
							type="button"
							onClick={() => onUpdateRole(membership.user_id, 2)}
							disabled={updatingRoleUserId === membership.user_id}
							className="theme-button-secondary px-3 py-1 text-xs disabled:opacity-60"
							title="Понизить до участника"
						>
							<Users className="h-3 w-3" />
							{updatingRoleUserId === membership.user_id ? '...' : 'Участник'}
						</button>
					)}
				</div>
			) : (
				<span className="rounded-full border border-[rgb(var(--border-color))/0.12] bg-[rgb(var(--surface-soft))/0.45] px-3 py-1 text-xs font-medium theme-muted">
					{formatRole(membership.team_role_id)}
				</span>
			)}
		</article>
	);
}