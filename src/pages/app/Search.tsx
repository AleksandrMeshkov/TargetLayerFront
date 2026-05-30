import React from 'react';
import { SearchInviteModal } from '../../components/search/SearchInviteModal';
import { SearchHeader } from '../../components/search/SearchHeader';
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
				<SearchHeader query={query} onQueryChange={setQuery} />
				<div className="space-y-3">
					{!trimmedQuery && (
						<p className="theme-panel rounded-xl px-4 py-3 text-sm">
							Введите никнейм в поле выше, чтобы увидеть пользователей.
						</p>
					)}

					{loading && (
						<div className="theme-panel flex items-center gap-2 rounded-xl px-4 py-3 text-sm">
							<div className="h-4 w-4 animate-spin rounded-full border-2 border-purple-300 border-t-transparent" />
							Выполняем поиск...
						</div>
					)}

					{error && !loading && (
						<p className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-200">
							{error}
						</p>
					)}

					{hasSearched && !loading && !error && results.length === 0 && (
						<p className="theme-panel rounded-xl px-4 py-3 text-sm">
							По запросу ничего не найдено.
						</p>
					)}
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