import React, { useEffect, useMemo, useState } from 'react';
import { Loader2, Search as SearchIcon, Users } from 'lucide-react';
import { toast } from 'react-toastify';
import { searchUsers, type SearchUser } from '../../api/auth';

const buildAvatarUrl = (avatarPath: string | null | undefined): string | null => {
	if (!avatarPath) return null;
	if (avatarPath.startsWith('http')) return avatarPath;

	const baseUrl = (import.meta.env.VITE_API_BASE_URL ?? 'https://targetl.site').replace(/\/$/, '');
	return `${baseUrl}${avatarPath.startsWith('/') ? '' : '/'}${avatarPath}`;
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

	return (
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
						return (
							<article
								key={user.user_id}
								className="rounded-2xl border border-white/10 bg-black/20 p-5 transition-colors hover:border-purple-500/30"
							>
								<div className="flex items-center gap-4">
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
										<p className="truncate text-sm font-semibold text-white">{getFullName(user)}</p>
										<p className="truncate text-sm text-purple-200/80">@{user.username}</p>
									</div>
								</div>
							</article>
						);
					})}
				</div>
			)}
		</section>
	);
};

export default Search;
