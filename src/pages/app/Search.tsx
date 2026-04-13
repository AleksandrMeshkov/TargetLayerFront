import React, { useEffect, useMemo, useState } from 'react';
import { Loader2, Search as SearchIcon, UserPlus, Users, X } from 'lucide-react';
import { toast } from 'react-toastify';
import { API_BASE_URL } from '../../api/apiBase/apiBase';
import {
	getCurrentProfile,
	searchUsers,
} from '../../api/auth/userClient';
import { getMyTeams, getTeamMembers, inviteUserByEmail } from '../../api/auth/teamClient';
import type { SearchUser, TeamItem } from '../../types/authTypes/authTypes';

const ADMIN_TEAM_ROLE_ID = 1;

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

const Search: React.FC = () => {
	const [query, setQuery] = useState('');
	const [results, setResults] = useState<SearchUser[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [hasSearched, setHasSearched] = useState(false);
	const [selectedUser, setSelectedUser] = useState<SearchUser | null>(null);
	const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
	const [adminTeams, setAdminTeams] = useState<TeamItem[]>([]);
	const [teamsLoading, setTeamsLoading] = useState(false);
	const [teamsLoaded, setTeamsLoaded] = useState(false);
	const [teamsError, setTeamsError] = useState<string | null>(null);
	const [invitingTeamId, setInvitingTeamId] = useState<number | null>(null);

	const trimmedQuery = useMemo(() => query.trim(), [query]);

	useEffect(() => {
		if (!trimmedQuery) {
			setResults([]);
			setError(null);
			setHasSearched(false);
			return;
		}

		let isCancelled = false;
		const debounceId = window.setTimeout(async () => {
			try {
				setLoading(true);
				setError(null);

				const response = await searchUsers(trimmedQuery, 30);
				if (!isCancelled) {
					setResults(response.users);
					setHasSearched(true);
				}
			} catch (err) {
				const message = err instanceof Error ? err.message : 'Не удалось выполнить поиск пользователей';
				if (!isCancelled) {
					setError(message);
					setResults([]);
					setHasSearched(true);
					toast.error(message);
				}
			} finally {
				if (!isCancelled) {
					setLoading(false);
				}
			}
		}, 400);

		return () => {
			isCancelled = true;
			window.clearTimeout(debounceId);
		};
	}, [trimmedQuery]);

	const loadAdminTeams = async () => {
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
			toast.error(message);
		} finally {
			setTeamsLoading(false);
		}
	};

	const openInviteModal = async (user: SearchUser) => {
		setSelectedUser(user);
		setIsInviteModalOpen(true);
		if (!teamsLoaded) {
			await loadAdminTeams();
		}
	};

	const closeInviteModal = () => {
		if (invitingTeamId !== null) {
			return;
		}
		setIsInviteModalOpen(false);
		setSelectedUser(null);
		setTeamsError(null);
	};

	const handleInvite = async (team: TeamItem) => {
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
			toast.error(message);
		} finally {
			setInvitingTeamId(null);
		}
	};

	return (
		<>
			<section className="space-y-6">
			<div className="rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8">
				<div className="mb-6 flex items-center gap-3">
					<Users className="h-8 w-8 text-purple-400" />
					<div>
						<h1 className="text-3xl font-bold">Поиск пользователей</h1>
						<p className="mt-1 text-sm text-purple-100/60">Найдите пользователя по никнейму</p>
					</div>
				</div>

				<label className="relative block">
					<SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-purple-200/70" />
					<input
						type="text"
						value={query}
						onChange={(event) => setQuery(event.target.value)}
						placeholder="Введите никнейм, например alex"
						className="w-full rounded-xl border border-white/10 bg-black/20 py-3 pl-12 pr-4 text-sm text-white outline-none placeholder:text-purple-100/40 transition-colors focus:border-purple-400/40"
					/>
				</label>

				<div className="mt-6 space-y-3">
					{!trimmedQuery && (
						<p className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-purple-100/70">
							Введите никнейм в поле выше, чтобы увидеть пользователей.
						</p>
					)}

					{loading && (
						<div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-purple-100/70">
							<Loader2 className="h-4 w-4 animate-spin" />
							Выполняем поиск...
						</div>
					)}

					{error && !loading && (
						<p className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
							{error}
						</p>
					)}

					{hasSearched && !loading && !error && results.length === 0 && (
						<p className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-purple-100/70">
							По запросу ничего не найдено.
						</p>
					)}
				</div>
			</div>

			{results.length > 0 && (
				<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
					{results.map((user) => {
						const avatarUrl = buildAvatarUrl(user.avatar_url);
						const fullName = getFullName(user) || `@${user.username}`;
						return (
							<article
								key={user.user_id}
								className="rounded-2xl border border-white/10 bg-black/20 p-5 transition-colors hover:border-purple-500/30"
							>
								<div className="flex items-center justify-between gap-4">
									<div className="flex min-w-0 items-center gap-4">
									{avatarUrl ? (
										<img
											src={avatarUrl}
											alt={`Аватар ${user.username}`}
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

									<button
										type="button"
										onClick={() => void openInviteModal(user)}
										className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-purple-400/30 bg-purple-500/10 px-3 py-2 text-xs font-semibold text-purple-100 transition-colors hover:bg-purple-500/20"
									>
										<UserPlus className="h-4 w-4" />
										Пригласить
									</button>
								</div>
							</article>
						);
					})}
				</div>
			)}
			</section>

			{isInviteModalOpen && selectedUser && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-sm">
					<div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-[#140f24] p-5 shadow-2xl sm:p-6">
						<div className="mb-5 flex items-start justify-between gap-4">
							<div>
								<h2 className="text-xl font-bold text-white">Пригласить в команду</h2>
								<p className="mt-1 text-sm text-purple-100/70">
									Пользователь: @{selectedUser.username}
								</p>
							</div>
							<button
								type="button"
								onClick={closeInviteModal}
								disabled={invitingTeamId !== null}
								className="rounded-lg border border-white/10 bg-black/20 p-2 text-purple-200 transition-colors hover:bg-white/10 disabled:opacity-60"
								aria-label="Закрыть окно выбора команды"
							>
								<X className="h-4 w-4" />
							</button>
						</div>

						{teamsLoading && (
							<div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-purple-100/70">
								<Loader2 className="h-4 w-4 animate-spin" />
								Загружаем команды с правами администратора...
							</div>
						)}

						{teamsError && !teamsLoading && (
							<p className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
								{teamsError}
							</p>
						)}

						{!teamsLoading && !teamsError && adminTeams.length === 0 && (
							<p className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-purple-100/70">
								У вас нет команд, где вы администратор. Приглашать пользователей пока нельзя.
							</p>
						)}

						{!teamsLoading && !teamsError && adminTeams.length > 0 && (
							<div className="space-y-3">
								<p className="text-sm text-purple-100/80">Выберите команду для приглашения:</p>
								<div className="max-h-[45vh] space-y-2 overflow-y-auto pr-1">
									{adminTeams.map((team) => (
										<button
											key={team.team_id}
											type="button"
											onClick={() => void handleInvite(team)}
											disabled={invitingTeamId !== null}
											className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-left transition-colors hover:border-purple-400/40 hover:bg-black/30 disabled:opacity-60"
										>
											<div>
												<p className="text-sm font-semibold text-white">{team.name}</p>
												<p className="text-xs text-purple-100/70">Команда #{team.team_id}</p>
											</div>
											<span className="text-xs font-semibold text-purple-200">
												{invitingTeamId === team.team_id ? 'Отправка...' : 'Пригласить'}
											</span>
										</button>
									))}
								</div>
							</div>
						)}
					</div>
				</div>
			)}
		</>
	);
};

export default Search;
