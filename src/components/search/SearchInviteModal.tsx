import React from 'react';
import { Loader2, X } from 'lucide-react';
import type { SearchInviteModalProps } from '../../types/searchTypes/searchTypes';

export function SearchInviteModal({
	isOpen,
	selectedUser,
	teamsLoading,
	teamsError,
	adminTeams,
	invitingTeamId,
	onClose,
	onInvite,
}: SearchInviteModalProps) {
	if (!isOpen || !selectedUser) {
		return null;
	}

	return (
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
						onClick={onClose}
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
									onClick={() => void onInvite(team)}
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
	);
}