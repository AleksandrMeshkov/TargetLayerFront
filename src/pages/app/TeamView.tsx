import React from 'react';
import { LoaderCircle, Map, MessageCircle, Shield, Users, X } from 'lucide-react';
import { useLocation, useParams } from 'react-router-dom';
import { RoadmapCard } from '../../components/team/RoadmapCard';
import { TeamMemberItem } from '../../components/team/TeamMemberItem';
import { TaskItem } from '../../components/team/TaskItem';
import { useTeamChat } from '../../hooks/teamHooks/useTeamChat';
import { useTeamMembers } from '../../hooks/teamHooks/useTeamMembers';
import { useTeamRoadmaps } from '../../hooks/teamHooks/useTeamRoadmaps';
import { useTeamShareRoadmap } from '../../hooks/teamHooks/useTeamShareRoadmap';
import type { TeamLocationState } from '../../types/teamTypes/teamTypes';

const formatDate = (value: string): string => {
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) {
		return value;
	}

	return new Intl.DateTimeFormat('ru-RU', {
		day: '2-digit',
		month: '2-digit',
		year: 'numeric',
	}).format(date);
};

const TeamView: React.FC = () => {
	const { teamId } = useParams<{ teamId: string }>();
	const location = useLocation();
	const { teamName } = (location.state as TeamLocationState | null) ?? {};
	const numericTeamId = Number(teamId);

	const {
		isModalOpen,
		loading,
		error,
		members,
		loadedOnce,
		teamTitle,
		newTeamName,
		setNewTeamName,
		savingName,
		deleting,
		myUserId,
		isAdmin,
		updatingRoleUserId,
		failedAvatarUserIds,
		openTeamPanel,
		closeTeamPanel,
		refreshMembers,
		handleRenameTeam,
		handleDeleteTeam,
		handleLeaveTeam,
		updateMemberRole,
		markAvatarAsFailed,
	} = useTeamMembers({ teamId: numericTeamId, initialTeamName: teamName ?? '' });

	const {
		teamRoadmaps,
		isLoadingTeamRoadmaps,
		selectedTeamRoadmapId,
		selectedTeamRoadmap,
		visibleTeamRoadmapTasks,
		isLoadingTeamRoadmapTasks,
		teamTaskBusyIds,
		isDeletingTeamRoadmap,
		isCopyingRoadmap,
		loadTeamRoadmaps,
		selectTeamRoadmap,
		clearSelectedTeamRoadmap,
		toggleTeamTaskComplete,
		copyRoadmap,
		deleteTeamRoadmap,
	} = useTeamRoadmaps({ teamId: numericTeamId });

	const {
		isShareModalOpen,
		myRoadmaps,
		isLoadingMyRoadmaps,
		selectedRoadmapId,
		setSelectedRoadmapId,
		isSharingRoadmap,
		openShareModal,
		closeShareModal,
		shareRoadmap,
	} = useTeamShareRoadmap({ teamId: numericTeamId, isAdmin: Boolean(isAdmin), onShared: loadTeamRoadmaps });

	const {
		isOpeningTeamChat,
		openTeamChat,
	} = useTeamChat({
		teamId: numericTeamId,
		members,
		loadedOnce,
		refreshMembers,
	});

	return (
		<section className="flex h-[calc(100dvh-96px)] min-h-[540px] flex-col">
				<div className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl theme-panel">
					<button
						type="button"
						onClick={() => void openTeamPanel()}
						className="flex w-full items-center justify-between border-b border-[rgb(var(--border-color))/0.2] px-4 py-3 bg-[rgb(var(--surface-soft))/0.45] text-left transition-colors"
					>
						<div className="flex items-start gap-3">
							<Users className="mt-0.5 h-5 w-5 theme-accent" />
							<div>
								<p className="text-sm font-semibold theme-heading">{teamTitle}</p>
								<p className="text-xs theme-muted">
									{members.length} участников | {isAdmin ? 'У вас права администратора' : 'Режим участника'}
								</p>
							</div>
						</div>
					</button>

					<div className="relative flex-1 min-h-0 bg-[rgb(var(--surface))/0.04] p-3 sm:p-4 md:p-6">

						<div className="relative z-10 flex h-full min-h-0 flex-col">
						<div className="mb-4 flex flex-wrap items-center justify-between gap-3">
							<div>
								<h2 className="text-lg font-semibold theme-heading">Доска роудмапов команды</h2>
								<p className="text-xs theme-muted">Основное рабочее пространство команды</p>
							</div>
							<div className="flex items-center gap-2">
								<button
									type="button"
									onClick={() => void loadTeamRoadmaps()}
									className="theme-button-secondary"
									disabled={isLoadingTeamRoadmaps}
								>
									{isLoadingTeamRoadmaps ? 'Обновление...' : 'Обновить'}
								</button>
								<button
									type="button"
									onClick={() => void openTeamChat()}
									disabled={isOpeningTeamChat || !Number.isFinite(numericTeamId) || numericTeamId <= 0}
									className="theme-button-secondary disabled:opacity-60"
								>
									<MessageCircle className="h-4 w-4" />
									{isOpeningTeamChat ? 'Открываю...' : 'Зайти в беседу'}
								</button>
								{isAdmin && (
									<button
										type="button"
										onClick={() => void openShareModal()}
										className="theme-button-primary"
									>
										Поделиться роудмапом
									</button>
								)}
							</div>
						</div>

						<div className="flex-1 overflow-y-auto rounded-xl border border-[rgb(var(--border-color))/0.12] bg-[rgb(var(--surface-soft))/0.35] p-3 sm:p-4">
							{isLoadingTeamRoadmaps && (
								<div className="flex items-center gap-2 rounded-xl p-3 theme-panel text-sm">
									<LoaderCircle className="h-4 w-4 animate-spin" />
									<span className="theme-muted">Загрузка роудмапов команды...</span>
								</div>
							)}

							{(!isLoadingTeamRoadmaps && teamRoadmaps.length === 0) && (
								<div className="rounded-xl border border-dashed border-[rgb(var(--border-color))/0.3] bg-[rgb(var(--surface-soft))/0.35] px-4 py-6 text-center text-sm theme-heading">
									В этой команде пока нет роудмапов.
								</div>
							)}

							{!isLoadingTeamRoadmaps && teamRoadmaps.length > 0 && (
								<>
									<div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
										{teamRoadmaps.map((roadmap) => (
											<RoadmapCard
												key={roadmap.roadmap_id}
												roadmap={roadmap}
												isSelected={roadmap.roadmap_id === selectedTeamRoadmapId}
												onSelect={(roadmapId) => void selectTeamRoadmap(roadmapId)}
											/>
										))}
									</div>

									{selectedTeamRoadmap && (
										<div className="mt-4 rounded-xl pt-12 px-6 pb-6 theme-panel relative">
											<div className="absolute right-4 top-4 z-20 flex items-center gap-3">
												<button
													type="button"
													onClick={() => void copyRoadmap(selectedTeamRoadmap.roadmap_id)}
													disabled={isCopyingRoadmap || isDeletingTeamRoadmap}
													className="theme-button-secondary disabled:opacity-60"
													title="Скопировать роудмап себе"
												>
													{isCopyingRoadmap ? 'Копирую...' : 'Скопировать'}
												</button>
												{isAdmin && (
													<button
														type="button"
														onClick={() => void deleteTeamRoadmap(selectedTeamRoadmap.roadmap_id)}
														disabled={isDeletingTeamRoadmap || isCopyingRoadmap}
														className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-500/20 disabled:opacity-60"
														title="Удалить роудмап из команды"
													>
														{isDeletingTeamRoadmap ? 'Удаление...' : 'Удалить'}
													</button>
												)}
												<button
													type="button"
													onClick={() => clearSelectedTeamRoadmap()}
													className="theme-button-secondary"
													aria-label="Закрыть роудмап"
												>
													<X className="h-4 w-4" />
												</button>
											</div>

											<div className="flex flex-wrap items-start justify-between gap-4">
												<div>
													{selectedTeamRoadmap.goal?.description && (
														<p className="mt-2 max-w-3xl text-sm theme-muted">
															{selectedTeamRoadmap.goal.description}
														</p>
													)}
												</div>
											</div>

											{(!isLoadingTeamRoadmapTasks && visibleTeamRoadmapTasks.length === 0) && (
												<div className="mt-4 rounded-xl border border-dashed border-[rgb(var(--border-color))/0.3] bg-[rgb(var(--surface-soft))/0.35] px-4 py-6 text-sm theme-heading">
													В этом роудмапе пока нет задач.
												</div>
											)}

											{isLoadingTeamRoadmapTasks && (
												<div className="mt-4 rounded-xl p-3 theme-panel text-sm">
													<LoaderCircle className="mr-2 inline-block h-4 w-4 animate-spin" />
													<span className="theme-muted">Загрузка задач роудмапа...</span>
												</div>
											)}

											<div className="mt-6 space-y-3">
												{visibleTeamRoadmapTasks.map((task) => (
													<TaskItem
														key={task.task_id}
														task={task}
														busy={Boolean(teamTaskBusyIds[task.task_id])}
														onToggleComplete={(currentTask) => void toggleTeamTaskComplete(currentTask)}
													/>
												))}
											</div>
										</div>
									)}
								</>
							)}
						</div>
					</div>
				</div>
			</div>

			{isModalOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgb(var(--page-bg))/0.7] px-4 py-8 backdrop-blur-sm">
						<div className="w-full max-w-4xl rounded-2xl p-5 sm:p-6 theme-panel-strong">
							<div className="mb-4 flex items-start justify-between gap-4">
								<div>
									<h2 className="text-xl font-bold theme-heading">Команда и участники</h2>
									<p className="mt-1 text-sm theme-muted">{teamTitle}</p>
								</div>
								<button
									type="button"
									onClick={closeTeamPanel}
									className="rounded-lg p-2 theme-button-secondary"
									aria-label="Закрыть панель"
								>
									<X className="h-4 w-4" />
								</button>
							</div>

							{isAdmin && (
								<div className="mb-4 rounded-xl p-4 theme-panel">
									<div className="mb-3 flex items-center gap-2">
										<Shield className="h-4 w-4 text-[rgb(var(--accent))]" />
										<p className="text-sm font-semibold theme-heading">Инструменты администратора</p>
									</div>
									<form onSubmit={handleRenameTeam} className="flex flex-col gap-3 sm:flex-row">
										<input
											type="text"
											value={newTeamName}
											onChange={(event) => setNewTeamName(event.target.value)}
											maxLength={255}
											disabled={savingName || deleting}
											placeholder="Новое название команды"
											className="w-full rounded-xl theme-input"
										/>
										<div className="flex gap-2">
											<button
												type="submit"
												disabled={savingName || deleting}
												className="rounded-lg bg-[rgb(var(--accent))] px-4 py-2 text-sm font-semibold text-[rgb(var(--accent-foreground))] transition-colors hover:opacity-95 disabled:opacity-60"
											>
												{savingName ? 'Сохранение...' : 'Переименовать'}
											</button>
											<button
												type="button"
												onClick={() => void handleDeleteTeam()}
												disabled={savingName || deleting}
												className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-500/20 disabled:opacity-60"
											>
												{deleting ? 'Удаление...' : 'Удалить команду'}
											</button>
										</div>
									</form>
								</div>
							)}

						{loading && (
							<p className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-purple-100/70">
								Загрузка участников...
							</p>
						)}

						{!loading && error && (
							<p className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
								{error}
							</p>
						)}

						{!loading && !error && members.length === 0 && (
							<p className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-purple-100/70">
								В команде пока нет участников.
							</p>
						)}

						{!loading && !error && members.length > 0 && (
							<div className="max-h-[50vh] space-y-3 overflow-y-auto pr-1">
								{members.map((member) => (
									<TeamMemberItem
										key={member.membership.id}
										member={member}
										isAdmin={Boolean(isAdmin)}
										myUserId={myUserId}
										updatingRoleUserId={updatingRoleUserId}
										failedAvatarUserIds={failedAvatarUserIds}
										onAvatarError={markAvatarAsFailed}
										onUpdateRole={(userId, roleId) => {
											void updateMemberRole(userId, roleId);
										}}
									/>
								))}
							</div>
						)}

						{!isAdmin && loadedOnce && (
							<button
								type="button"
								onClick={() => void handleLeaveTeam()}
								disabled={deleting}
								className="mt-6 w-full rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-500/20 disabled:opacity-60"
							>
								{deleting ? 'Выход...' : 'Выйти из команды'}
							</button>
						)}
					</div>
				</div>
			)}

			{isShareModalOpen && (
				<div className="fixed inset-0 z-[70] flex items-center justify-center bg-[rgb(var(--page-bg))/0.7] px-4 py-8 backdrop-blur-sm">
					<div className="w-full max-w-2xl rounded-2xl p-5 sm:p-6 theme-panel-strong">
						<div className="mb-4 flex items-start justify-between gap-4">
							<div>
								<div className="flex items-center gap-2">
									<Map className="h-5 w-5 text-[rgb(var(--accent))]" />
									<h2 className="text-xl font-bold theme-heading">Поделиться роудмапом</h2>
								</div>
								<p className="mt-1 text-sm theme-muted">Выберите личный роудмап и добавьте его в команду {teamTitle}</p>
							</div>
							<button
								type="button"
								onClick={closeShareModal}
								disabled={isSharingRoadmap}
								className="rounded-lg p-2 theme-button-secondary disabled:opacity-60"
								aria-label="Закрыть окно шаринга"
							>
								<X className="h-4 w-4" />
							</button>
						</div>

						{isLoadingMyRoadmaps && (
							<div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-purple-100/70">
								<LoaderCircle className="h-4 w-4 animate-spin" />
								Загрузка личных роудмапов...
							</div>
						)}

						{!isLoadingMyRoadmaps && myRoadmaps.length === 0 && (
							<p className="rounded-xl border border-dashed border-white/20 bg-white/[0.03] px-4 py-5 text-sm text-purple-100/70">
								У вас нет личных роудмапов для шаринга.
							</p>
						)}

						{!isLoadingMyRoadmaps && myRoadmaps.length > 0 && (
							<div className="max-h-[46vh] space-y-2 overflow-y-auto pr-1">
								{myRoadmaps.map((roadmap) => {
									const isSelected = roadmap.roadmap_id === selectedRoadmapId;
									return (
										<button
											key={roadmap.roadmap_id}
											type="button"
											onClick={() => setSelectedRoadmapId(roadmap.roadmap_id)}
											className={`w-full rounded-xl border p-3 text-left transition-colors ${
												isSelected
													? 'border-purple-400/70 bg-purple-500/20'
													: 'border-white/10 bg-black/20 hover:border-white/25 hover:bg-black/35'
											}`}
										>
											<p className="text-sm font-semibold text-white">
												{roadmap.goal?.title ?? `Роудмап #${roadmap.roadmap_id}`}
											</p>
											<div className="mt-1 flex items-center justify-between text-xs text-purple-100/70">
												<span>{roadmap.tasks.length} задач</span>
												<span>Обновлен: {formatDate(roadmap.updated_at)}</span>
											</div>
										</button>
									);
								})}
							</div>
						)}

						<div className="mt-5 flex justify-end gap-2">
							<button
								type="button"
								onClick={closeShareModal}
								disabled={isSharingRoadmap}
								className="rounded-lg border border-white/10 bg-black/20 px-4 py-2 text-sm text-purple-100 transition-colors hover:bg-black/35 disabled:opacity-60"
							>
								Отмена
							</button>
							<button
								type="button"
								onClick={() => void shareRoadmap()}
								disabled={isSharingRoadmap || !selectedRoadmapId}
								className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-purple-500 disabled:opacity-60"
							>
								{isSharingRoadmap ? 'Отправка...' : 'Поделиться'}
							</button>
						</div>
					</div>
				</div>
			)}
		</section>
	);
};

export default TeamView;