import React from 'react';
import { Loader2, MessageCircle, UserPlus } from 'lucide-react';
import { API_BASE_URL } from '../../api/apiBase/apiBase';
import type { SearchUser } from '../../types/authTypes/authTypes';
import type { SearchUserCardProps } from '../../types/searchTypes/searchTypes';

const buildAvatarUrl = (avatarPath: string | null | undefined): string | null => {
	if (!avatarPath) return null;
	if (avatarPath.startsWith('http')) return avatarPath;
	return `${API_BASE_URL}${avatarPath.startsWith('/') ? '' : '/'}${avatarPath}`;
};

const getFullName = (user: SearchUser): string => {
	return [user.surname, user.name, user.patronymic].filter(Boolean).join(' ');
};

const getInitials = (user: SearchUser): string => {
	const first = user.name?.[0] ?? '';
	const second = user.surname?.[0] ?? '';
	return `${first}${second}`.toUpperCase() || '??';
};

export function SearchUserCard({
	user,
	failedAvatarUserIds,
	onAvatarError,
	onCreateChat,
	onOpenInvite,
	creatingChatUserId,
}: SearchUserCardProps) {
	const avatarUrl = buildAvatarUrl(user.avatar_url);
	const fullName = getFullName(user) || `@${user.username}`;

	return (
		<article className="rounded-2xl border border-white/10 bg-black/20 p-5 transition-colors hover:border-purple-500/30">
			<div className="flex items-center justify-between gap-4">
				<div className="flex min-w-0 items-center gap-4">
					{avatarUrl && !failedAvatarUserIds.has(user.user_id) ? (
						<img
							src={avatarUrl}
							alt={`Аватар ${user.username}`}
							onError={() => onAvatarError(user.user_id)}
							className="h-14 w-14 rounded-full border border-purple-400/30 object-cover"
						/>
					) : (
						<div className="flex h-14 w-14 items-center justify-center rounded-full border border-purple-400/30 bg-gradient-to-br from-purple-500 to-fuchsia-500 text-sm font-semibold text-white">
							{getInitials(user)}
						</div>
					)}

					<div className="min-w-0">
						<p className="truncate text-sm font-semibold text-white">{fullName}</p>
						<p className="truncate text-sm text-purple-200/80">@{user.username}</p>
					</div>
				</div>

				<div className="flex shrink-0 items-center gap-2">
					<button
						type="button"
						onClick={() => void onCreateChat(user)}
						disabled={creatingChatUserId === user.user_id}
						className="inline-flex items-center gap-2 rounded-lg border border-purple-400/30 bg-purple-500/10 px-3 py-2 text-xs font-semibold text-purple-100 transition-colors hover:bg-purple-500/20 disabled:cursor-not-allowed disabled:opacity-50"
					>
						{creatingChatUserId === user.user_id ? (
							<Loader2 className="h-4 w-4 animate-spin" />
						) : (
							<MessageCircle className="h-4 w-4" />
						)}
						Написать
					</button>

					<button
						type="button"
						onClick={() => void onOpenInvite(user)}
						className="inline-flex items-center gap-2 rounded-lg border border-purple-400/30 bg-purple-500/10 px-3 py-2 text-xs font-semibold text-purple-100 transition-colors hover:bg-purple-500/20"
					>
						<UserPlus className="h-4 w-4" />
						Пригласить
					</button>
				</div>
			</div>
		</article>
	);
}