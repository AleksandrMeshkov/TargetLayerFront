import React from 'react';
import { Search as SearchIcon, Users } from 'lucide-react';
import { SearchInviteModal } from '../../components/search/SearchInviteModal';
import { SearchUserCard } from '../../components/search/SearchUserCard';
import { useSearchInviteTeams } from '../../hooks/searchHooks/useSearchInviteTeams';
import { useSearchUsers } from '../../hooks/searchHooks/useSearchUsers';

const Search: React.FC = () => {
	const {
		query,
		setQuery,
		trimmedQuery,
		results,
		loading,
		error,
		hasSearched,
		failedAvatarUserIds,
		creatingChatUserId,
		markAvatarAsFailed,
		handleCreateChat,
	} = useSearchUsers();

	const {
		selectedUser,
		isInviteModalOpen,
		adminTeams,
		teamsLoading,
		teamsError,
		invitingTeamId,
		openInviteModal,
		closeInviteModal,
		handleInvite,
	} = useSearchInviteTeams();

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
								<div className="h-4 w-4 animate-spin rounded-full border-2 border-purple-300 border-t-transparent" />
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
						{results.map((user) => (
							<SearchUserCard
								key={user.user_id}
								user={user}
								failedAvatarUserIds={failedAvatarUserIds}
								onAvatarError={markAvatarAsFailed}
								onCreateChat={handleCreateChat}
								onOpenInvite={openInviteModal}
								creatingChatUserId={creatingChatUserId}
							/>
						))}
					</div>
				)}
			</section>

			<SearchInviteModal
				isOpen={isInviteModalOpen}
				selectedUser={selectedUser}
				teamsLoading={teamsLoading}
				teamsError={teamsError}
				adminTeams={adminTeams}
				invitingTeamId={invitingTeamId}
				onClose={closeInviteModal}
				onInvite={handleInvite}
			/>
		</>
	);
};

export default Search;