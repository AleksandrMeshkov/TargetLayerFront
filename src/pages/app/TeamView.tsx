import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Circle, LoaderCircle, Map, MessageCircle, Shield, Users, X } from 'lucide-react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { API_BASE_URL } from '../../api/apiBase/apiBase';
import {
	getCurrentProfile,
	getUserById,
} from '../../api/auth/userClient';
import {
	deleteTeam,
	getTeamMembers,
	renameTeam,
} from '../../api/auth/teamClient';
import type { TeamMemberItem, UserProfile } from '../../types/authTypes/authTypes';
import { createChat, getMyChats, getOrCreateTeamChat } from '../../api/chat/chatClient';
import {
	getMyRoadmaps,
	getRoadmapsByTeam,
	getRoadmapTasks,
	setRoadmapTaskComplete,
	shareRoadmapToTeam,
} from '../../api/roadmaps/roadmapApi';
import type { RoadmapItem, RoadmapTask } from '../../types/roadmapsTypes/roadmapsTypes';

type TeamLocationState = {
	teamName?: string;
};

type TeamMemberView = {
	membership: TeamMemberItem;
	profile: UserProfile;
};

const buildAvatarUrl = (avatarPath: string | null | undefined): string | null => {
	if (!avatarPath) return null;
	if (avatarPath.startsWith('http')) return avatarPath;
	return `${API_BASE_URL}${avatarPath.startsWith('/') ? '' : '/'}${avatarPath}`;
};

const getFullName = (profile: UserProfile): string => {
	return [profile.surname, profile.name, profile.patronymic].filter(Boolean).join(' ');
};

const getInitials = (profile: UserProfile): string => {
	const first = profile.name?.[0] ?? '';
	const second = profile.surname?.[0] ?? '';
	return `${first}${second}`.toUpperCase() || '??';
};

const formatRole = (teamRoleId: number): string => {
	if (teamRoleId === 1) return 'Администратор';
	if (teamRoleId === 2) return 'Участник';
	return `Роль #${teamRoleId}`;
};

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

const sortTasks = (tasks: RoadmapTask[]): RoadmapTask[] => {
	return [...tasks].sort((left, right) => left.order_index - right.order_index);
};

const TeamView: React.FC = () => {
	const navigate = useNavigate();
	const { teamId } = useParams<{ teamId: string }>();
	const location = useLocation();
	const { teamName } = (location.state as TeamLocationState | null) ?? {};

	const [isModalOpen, setIsModalOpen] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [members, setMembers] = useState<TeamMemberView[]>([]);
	const [loadedOnce, setLoadedOnce] = useState(false);
	const [displayTeamName, setDisplayTeamName] = useState(teamName ?? '');
	const [newTeamName, setNewTeamName] = useState(teamName ?? '');
	const [savingName, setSavingName] = useState(false);
	const [deleting, setDeleting] = useState(false);
	const [myUserId, setMyUserId] = useState<number | null>(null);
	const [teamRoadmaps, setTeamRoadmaps] = useState<RoadmapItem[]>([]);
	const [isLoadingTeamRoadmaps, setIsLoadingTeamRoadmaps] = useState(false);
	const [selectedTeamRoadmapId, setSelectedTeamRoadmapId] = useState<number | null>(null);
	const [teamTasksCache, setTeamTasksCache] = useState<Record<number, RoadmapTask[]>>({});
	const [isLoadingTeamRoadmapTasks, setIsLoadingTeamRoadmapTasks] = useState(false);
	const [teamTaskBusyIds, setTeamTaskBusyIds] = useState<Record<number, boolean>>({});
	const [isShareModalOpen, setIsShareModalOpen] = useState(false);
	const [myRoadmaps, setMyRoadmaps] = useState<RoadmapItem[]>([]);
	const [isLoadingMyRoadmaps, setIsLoadingMyRoadmaps] = useState(false);
	const [selectedRoadmapId, setSelectedRoadmapId] = useState<number | null>(null);
	const [isSharingRoadmap, setIsSharingRoadmap] = useState(false);
	const [isOpeningTeamChat, setIsOpeningTeamChat] = useState(false);

	const numericTeamId = Number(teamId);
	const teamTitle = useMemo(() => {
		if (displayTeamName) return displayTeamName;
		if (Number.isFinite(numericTeamId) && numericTeamId > 0) return `Команда #${numericTeamId}`;
		return 'Команда';
	}, [displayTeamName, numericTeamId]);

	const myMembership = useMemo(() => {
		if (!myUserId) return null;
		return members.find((entry) => entry.membership.user_id === myUserId) ?? null;
	}, [members, myUserId]);

	const isAdmin = myMembership?.membership.team_role_id === 1;
	const isTeamChatDisabled = (
		isOpeningTeamChat
		|| !Number.isFinite(numericTeamId)
		|| numericTeamId <= 0
	);

	const selectedTeamRoadmap = useMemo(
		() => teamRoadmaps.find((roadmap) => roadmap.roadmap_id === selectedTeamRoadmapId) ?? null,
		[teamRoadmaps, selectedTeamRoadmapId],
	);

	const visibleTeamRoadmapTasks = useMemo(() => {
		if (!selectedTeamRoadmap) {
			return [];
		}

		const cached = selectedTeamRoadmapId != null ? teamTasksCache[selectedTeamRoadmapId] : undefined;
		return sortTasks(cached ?? selectedTeamRoadmap.tasks ?? []);
	}, [selectedTeamRoadmap, selectedTeamRoadmapId, teamTasksCache]);

	const loadTeamRoadmaps = async () => {
		if (!Number.isFinite(numericTeamId) || numericTeamId <= 0) {
			return;
		}

		try {
			setIsLoadingTeamRoadmaps(true);
			const response = await getRoadmapsByTeam(numericTeamId);
			const sortedRoadmaps = [...response.roadmaps].sort(
				(left, right) => new Date(right.updated_at).getTime() - new Date(left.updated_at).getTime(),
			);
			setTeamRoadmaps(sortedRoadmaps);
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Не удалось загрузить роудмапы команды';
			toast.error(message);
		} finally {
			setIsLoadingTeamRoadmaps(false);
		}
	};

	const fetchMembers = async () => {
		if (!Number.isFinite(numericTeamId) || numericTeamId <= 0) {
			const message = 'Некорректный идентификатор команды';
			setError(message);
			toast.error(message);
			return;
		}

		try {
			setLoading(true);
			setError(null);

			const membersResponse = await getTeamMembers(numericTeamId);
			const users = await Promise.all(
				membersResponse.users.map(async (membership) => {
					const profile = await getUserById(membership.user_id);
					return { membership, profile };
				}),
			);

			setMembers(users);
			setLoadedOnce(true);
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Не удалось загрузить участников команды';
			setError(message);
			toast.error(message);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		const fetchCurrentUser = async () => {
			try {
				const me = await getCurrentProfile();
				if (typeof me.user_id === 'number') {
					setMyUserId(me.user_id);
				}
			} catch {
			}
		};

		fetchCurrentUser();
		fetchMembers();
		loadTeamRoadmaps();
	}, []);

	useEffect(() => {
		setSelectedTeamRoadmapId(null);
		setIsLoadingTeamRoadmapTasks(false);
	}, [numericTeamId]);

	const handleSelectTeamRoadmap = async (roadmapId: number): Promise<void> => {
		if (selectedTeamRoadmapId === roadmapId) {
			setSelectedTeamRoadmapId(null);
			return;
		}

		setSelectedTeamRoadmapId(roadmapId);

		if (teamTasksCache[roadmapId]) {
			return;
		}

		setIsLoadingTeamRoadmapTasks(true);
		try {
			const tasks = await getRoadmapTasks(roadmapId);
			setTeamTasksCache((prev) => ({ ...prev, [roadmapId]: sortTasks(tasks) }));
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Не удалось загрузить задачи роудмапа';
			toast.error(message);
		} finally {
			setIsLoadingTeamRoadmapTasks(false);
		}
	};

	const setTeamTaskBusy = (taskId: number, busy: boolean) => {
		setTeamTaskBusyIds((prev) => ({ ...prev, [taskId]: busy }));
	};

	const updateTeamRoadmapTasksState = (roadmapId: number, updater: (tasks: RoadmapTask[]) => RoadmapTask[]) => {
		setTeamRoadmaps((prev) => prev.map((item) => {
			if (item.roadmap_id !== roadmapId) {
				return item;
			}
			return {
				...item,
				tasks: updater(item.tasks),
			};
		}));
	};

	const updateCachedTeamTask = (roadmapId: number, updatedTask: RoadmapTask) => {
		setTeamTasksCache((prev) => {
			const current = prev[roadmapId];
			if (!current) {
				return prev;
			}
			return {
				...prev,
				[roadmapId]: current.map((task) => (task.task_id === updatedTask.task_id ? updatedTask : task)),
			};
		});

		updateTeamRoadmapTasksState(roadmapId, (tasks) => tasks.map((task) => (
			task.task_id === updatedTask.task_id ? updatedTask : task
		)));
	};

	const handleToggleTeamTaskComplete = async (task: RoadmapTask): Promise<void> => {
		if (selectedTeamRoadmapId == null) {
			return;
		}

		const nextCompleted = !task.completed;
		setTeamTaskBusy(task.task_id, true);
		try {
			const updated = await setRoadmapTaskComplete(selectedTeamRoadmapId, task.task_id, nextCompleted);
			updateCachedTeamTask(selectedTeamRoadmapId, updated);
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Не удалось обновить статус задачи';
			toast.error(message);
		} finally {
			setTeamTaskBusy(task.task_id, false);
		}
	};

	const handleOpenTeamPanel = async () => {
		setIsModalOpen(true);
		if (!loadedOnce) {
			await fetchMembers();
		}
	};

	const handleCloseTeamPanel = () => {
		setIsModalOpen(false);
	};

	const handleOpenShareModal = async () => {
		if (!isAdmin) {
			toast.error('Поделиться роудмапом может только администратор команды');
			return;
		}

		setIsShareModalOpen(true);
		setSelectedRoadmapId(null);

		try {
			setIsLoadingMyRoadmaps(true);
			const response = await getMyRoadmaps();
			const personalRoadmaps = response.roadmaps
				.filter((roadmap) => roadmap.team_id == null)
				.sort((left, right) => new Date(right.updated_at).getTime() - new Date(left.updated_at).getTime());
			setMyRoadmaps(personalRoadmaps);
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Не удалось загрузить личные роудмапы';
			toast.error(message);
		} finally {
			setIsLoadingMyRoadmaps(false);
		}
	};

	const handleCloseShareModal = () => {
		if (isSharingRoadmap) {
			return;
		}

		setIsShareModalOpen(false);
		setSelectedRoadmapId(null);
	};

	const handleShareRoadmap = async () => {
		if (!selectedRoadmapId) {
			toast.error('Выберите роудмап для шаринга');
			return;
		}

		if (!Number.isFinite(numericTeamId) || numericTeamId <= 0) {
			toast.error('Некорректный идентификатор команды');
			return;
		}

		try {
			setIsSharingRoadmap(true);
			await shareRoadmapToTeam(selectedRoadmapId, { team_id: numericTeamId });
			toast.success('Роудмап успешно добавлен в команду');
			setIsShareModalOpen(false);
			setSelectedRoadmapId(null);
			await loadTeamRoadmaps();
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Не удалось поделиться роудмапом';
			toast.error(message);
		} finally {
			setIsSharingRoadmap(false);
		}
	};

	const handleRenameTeam = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const normalizedName = newTeamName.trim();

		if (!normalizedName) {
			toast.error('Введите новое название команды');
			return;
		}

		if (!Number.isFinite(numericTeamId) || numericTeamId <= 0) {
			toast.error('Некорректный идентификатор команды');
			return;
		}

		try {
			setSavingName(true);
			const updated = await renameTeam(numericTeamId, { name: normalizedName });
			setDisplayTeamName(updated.name);
			setNewTeamName(updated.name);
			toast.success('Название команды обновлено');
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Не удалось переименовать команду';
			toast.error(message);
		} finally {
			setSavingName(false);
		}
	};

	const handleDeleteTeam = async () => {
		if (!Number.isFinite(numericTeamId) || numericTeamId <= 0) {
			toast.error('Некорректный идентификатор команды');
			return;
		}

		const confirmed = window.confirm('Удалить команду? Это действие нельзя отменить.');
		if (!confirmed) {
			return;
		}

		try {
			setDeleting(true);
			await deleteTeam(numericTeamId);
			toast.success('Команда удалена');
			navigate('/app/teams', { replace: true });
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Не удалось удалить команду';
			toast.error(message);
		} finally {
			setDeleting(false);
		}
	};

	const handleOpenTeamChat = async () => {
		if (!Number.isFinite(numericTeamId) || numericTeamId <= 0) {
			toast.error('Некорректный идентификатор команды');
			return;
		}
		if (isOpeningTeamChat) {
			return;
		}

		setIsOpeningTeamChat(true);
		try {
			const chat = await getOrCreateTeamChat(numericTeamId);
			navigate('/app/chats', { state: { openChatId: chat.chat_id, openTeamId: numericTeamId } });
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Не удалось открыть беседу команды';

			if (message === 'Method Not Allowed') {
				try {
					const myChats = await getMyChats();
					const existingTeamChat = myChats.chats.find((chat) => (
						chat.team_id === numericTeamId && chat.type === 'team'
					)) ?? myChats.chats.find((chat) => chat.team_id === numericTeamId) ?? null;

					if (existingTeamChat) {
						navigate('/app/chats', { state: { openChatId: existingTeamChat.chat_id, openTeamId: numericTeamId } });
						return;
					}

					if (!loadedOnce) {
						await fetchMembers();
					}

					const participantIds = Array.from(
						new Set(members.map((entry) => entry.membership.user_id).filter((id) => Number.isFinite(id) && id > 0)),
					);

					if (participantIds.length === 0) {
						toast.error('Не удалось определить участников команды');
						return;
					}

					const created = await createChat({
						team_id: numericTeamId,
						participant_user_ids: participantIds,
						name: null,
					});
					navigate('/app/chats', { state: { openChatId: created.chat_id, openTeamId: numericTeamId } });
					return;
				} catch (fallbackErr) {
					const fallbackMessage = fallbackErr instanceof Error ? fallbackErr.message : 'Не удалось открыть беседу команды';
					toast.error(fallbackMessage);
					return;
				}
			}

			toast.error(message);
		} finally {
			setIsOpeningTeamChat(false);
		}
	};

	return (
		<section className="flex h-[calc(100dvh-96px)] min-h-[540px] flex-col">
			<div className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/5">
				<button
					type="button"
					onClick={handleOpenTeamPanel}
					className="flex w-full items-center justify-between border-b border-white/10 bg-black/30 px-4 py-3 text-left backdrop-blur-sm transition-colors hover:bg-black/40"
				>
					<div className="flex items-start gap-3">
						<Users className="mt-0.5 h-5 w-5 text-purple-300" />
						<div>
							<p className="text-sm font-semibold text-white">{teamTitle}</p>
							<p className="text-xs text-purple-100/65">
								{members.length} участников | {isAdmin ? 'У вас права администратора' : 'Режим участника'}
							</p>
						</div>
					</div>

					<div className="flex items-center gap-2">
						<span className="rounded-full border border-purple-400/30 bg-purple-500/10 px-2.5 py-1 text-[11px] font-medium text-purple-200">
							{Number.isFinite(numericTeamId) ? `Team #${numericTeamId}` : 'Team'}
						</span>
					</div>
				</button>

				<div className="relative flex-1 min-h-0 bg-gradient-to-br from-emerald-200/20 via-green-200/10 to-lime-200/20 p-3 sm:p-4 md:p-6">
					<div className="pointer-events-none absolute inset-0 opacity-30" style={{
						backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.35) 1px, transparent 0)',
						backgroundSize: '22px 22px',
					}} />

					<div className="relative z-10 flex h-full min-h-0 flex-col">
						<div className="mb-4 flex flex-wrap items-center justify-between gap-3">
							<div>
								<h2 className="text-lg font-semibold text-white">Доска роудмапов команды</h2>
								<p className="text-xs text-purple-100/70">Основное рабочее пространство команды</p>
							</div>
							<div className="flex items-center gap-2">
								<button
									type="button"
									onClick={() => void loadTeamRoadmaps()}
									className="rounded-lg border border-white/20 bg-black/20 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-black/35"
									disabled={isLoadingTeamRoadmaps}
								>
									{isLoadingTeamRoadmaps ? 'Обновление...' : 'Обновить'}
								</button>
								<button
									type="button"
									onClick={() => void handleOpenTeamChat()}
									disabled={isTeamChatDisabled}
									className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-black/20 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-black/35 disabled:opacity-60"
								>
									<MessageCircle className="h-4 w-4" />
									{isOpeningTeamChat ? 'Открываю...' : 'Зайти в беседу'}
								</button>
								{isAdmin && (
									<button
										type="button"
										onClick={() => void handleOpenShareModal()}
										className="rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-purple-500"
									>
										Поделиться роудмапом
									</button>
								)}
							</div>
						</div>

						<div className="flex-1 overflow-y-auto rounded-xl border border-white/15 bg-black/10 p-3 sm:p-4">
							{isLoadingTeamRoadmaps && (
								<div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-purple-100/70">
									<LoaderCircle className="h-4 w-4 animate-spin" />
									Загрузка роудмапов команды...
								</div>
							)}

							{!isLoadingTeamRoadmaps && teamRoadmaps.length === 0 && (
								<div className="rounded-xl border border-dashed border-white/20 bg-white/[0.03] px-4 py-6 text-center text-sm text-purple-100/70">
									В этой команде пока нет роудмапов.
								</div>
							)}

							{!isLoadingTeamRoadmaps && teamRoadmaps.length > 0 && (
								<>
									<div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
										{teamRoadmaps.map((roadmap) => {
											const isSelected = roadmap.roadmap_id === selectedTeamRoadmapId;
											return (
												<button
													key={roadmap.roadmap_id}
													type="button"
													onClick={() => void handleSelectTeamRoadmap(roadmap.roadmap_id)}
													className={`w-full rounded-xl border bg-black/20 p-4 text-left transition-colors hover:border-purple-500/30 ${
														isSelected ? 'border-purple-400/60' : 'border-white/10'
													}`}
												>
											<div className="flex items-start justify-between gap-3">
												<div>
													<p className="text-xs uppercase tracking-wide text-purple-200/70">Роудмап #{roadmap.roadmap_id}</p>
													<h3 className="mt-2 text-sm font-semibold text-white">
														{roadmap.goal?.title ?? `Роудмап #${roadmap.roadmap_id}`}
													</h3>
												</div>
												<span className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-purple-100/80">
													{roadmap.tasks.length} задач
												</span>
											</div>

											{roadmap.goal?.description && (
												<p className="mt-2 line-clamp-3 text-xs text-purple-100/70">{roadmap.goal.description}</p>
											)}

											<div className="mt-3 flex items-center justify-between text-xs text-purple-100/60">
												<span>{roadmap.completed ? 'Завершен' : 'В процессе'}</span>
												<span>Обновлен: {formatDate(roadmap.updated_at)}</span>
											</div>
											</button>
										);
										})}
									</div>

									{selectedTeamRoadmap && (
										<div className="mt-4 rounded-xl border border-white/10 bg-black/15 p-4">
											<div className="flex flex-wrap items-start justify-between gap-4">
												<div>
													<p className="text-xs uppercase tracking-wide text-purple-200/70">Открытый роудмап</p>
													<h3 className="mt-2 text-lg font-semibold text-white">
														{selectedTeamRoadmap.goal?.title ?? `Роудмап #${selectedTeamRoadmap.roadmap_id}`}
													</h3>
													{selectedTeamRoadmap.goal?.description && (
														<p className="mt-2 max-w-3xl text-sm text-purple-100/70">
															{selectedTeamRoadmap.goal.description}
														</p>
													)}
												</div>

											<button
												type="button"
												onClick={() => setSelectedTeamRoadmapId(null)}
												className="rounded-lg border border-white/10 bg-black/20 p-2 text-purple-200 transition-colors hover:bg-white/10"
												aria-label="Закрыть роудмап"
											>
												<X className="h-4 w-4" />
											</button>
										</div>

										<div className="mt-4">
											<div className="mb-3 flex items-center justify-between gap-3">
												<p className="text-sm font-medium text-purple-100/80">Задачи роудмапа</p>
												{isLoadingTeamRoadmapTasks && (
													<span className="inline-flex items-center gap-2 text-xs text-purple-200/70">
														<LoaderCircle className="h-4 w-4 animate-spin" />
														Загружаю задачи...
													</span>
												)}
											</div>

											{!isLoadingTeamRoadmapTasks && visibleTeamRoadmapTasks.length === 0 && (
												<div className="rounded-xl border border-dashed border-white/15 bg-white/[0.02] px-4 py-6 text-sm text-purple-100/60">
													В этом роудмапе пока нет задач.
												</div>
											)}

											<div className="space-y-3">
												{visibleTeamRoadmapTasks.map((task) => (
													<div
														key={task.task_id}
														className="rounded-2xl border border-white/10 bg-black/20 p-4"
													>
														<div className="flex flex-wrap items-start justify-between gap-3">
															<div className="flex items-start gap-3">
																	<button
																		type="button"
																		onClick={() => void handleToggleTeamTaskComplete(task)}
																		disabled={Boolean(teamTaskBusyIds[task.task_id])}
																		className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-purple-100/80 transition hover:bg-white/10 disabled:opacity-60"
																		aria-label={task.completed ? 'Снять отметку выполнено' : 'Отметить выполнено'}
																		title={task.completed ? 'Снять отметку выполнено' : 'Отметить выполнено'}
																	>
																	{task.completed ? (
																		<CheckCircle2 className="h-5 w-5 text-emerald-400" />
																	) : (
																		<Circle className="h-5 w-5 text-purple-300" />
																	)}
																	</button>

																<div className="min-w-0">
																	<p className="font-medium text-purple-50">
																		{task.order_index + 1}. {task.title}
																	</p>
																	{task.description && (
																		<p className="mt-1 text-sm leading-relaxed text-purple-100/70">{task.description}</p>
																	)}
																</div>
															</div>
														</div>
													</div>
												))}
											</div>
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
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-8 backdrop-blur-sm">
					<div className="w-full max-w-4xl rounded-2xl border border-white/10 bg-[#140f24] p-5 shadow-2xl sm:p-6">
						<div className="mb-4 flex items-start justify-between gap-4">
							<div>
								<h2 className="text-xl font-bold text-white">Команда и участники</h2>
								<p className="mt-1 text-sm text-purple-100/70">{teamTitle}</p>
							</div>
							<button
								type="button"
								onClick={handleCloseTeamPanel}
								className="rounded-lg border border-white/10 bg-black/20 p-2 text-purple-200 transition-colors hover:bg-white/10"
								aria-label="Закрыть панель"
							>
								<X className="h-4 w-4" />
							</button>
						</div>

						{isAdmin && (
							<div className="mb-4 rounded-xl border border-white/10 bg-black/20 p-4">
								<div className="mb-3 flex items-center gap-2">
									<Shield className="h-4 w-4 text-purple-300" />
									<p className="text-sm font-semibold text-white">Инструменты администратора</p>
								</div>
								<form onSubmit={handleRenameTeam} className="flex flex-col gap-3 sm:flex-row">
									<input
										type="text"
										value={newTeamName}
										onChange={(event) => setNewTeamName(event.target.value)}
										maxLength={255}
										disabled={savingName || deleting}
										placeholder="Новое название команды"
										className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-white outline-none placeholder:text-purple-100/40"
									/>
									<div className="flex gap-2">
										<button
											type="submit"
											disabled={savingName || deleting}
											className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-purple-500 disabled:opacity-60"
										>
											{savingName ? 'Сохранение...' : 'Переименовать'}
										</button>
										<button
											type="button"
											onClick={handleDeleteTeam}
											disabled={savingName || deleting}
											className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-200 transition-colors hover:bg-red-500/20 disabled:opacity-60"
										>
											{deleting ? 'Удаление...' : 'Удалить команду'}
										</button>
									</div>
								</form>
							</div>
						)}

						{!isAdmin && loadedOnce && (
							<p className="mb-4 rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-purple-100/70">
								У вас роль участника. Управление командой доступно администратору.
							</p>
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
								{members.map(({ membership, profile }) => {
									const avatarUrl = buildAvatarUrl(profile.avatar_url);
									return (
										<article
											key={membership.id}
											className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 p-4"
										>
											<div className="flex items-center gap-3">
												{avatarUrl ? (
													<img
														src={avatarUrl}
														alt={`Аватар ${profile.username ?? `user-${membership.user_id}`}`}
														className="h-11 w-11 rounded-full border border-purple-400/30 object-cover"
													/>
												) : (
													<div className="flex h-11 w-11 items-center justify-center rounded-full border border-purple-400/30 bg-gradient-to-br from-purple-500 to-fuchsia-500 text-xs font-semibold text-white">
														{getInitials(profile)}
													</div>
												)}

												<div>
													<p className="text-sm font-semibold text-white">{getFullName(profile)}</p>
													<p className="text-xs text-purple-100/70">@{profile.username ?? `user-${membership.user_id}`}</p>
												</div>
											</div>

											<span className="rounded-full border border-purple-400/30 bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-200">
												{formatRole(membership.team_role_id)}
											</span>
										</article>
									);
								})}
							</div>
						)}
					</div>
				</div>
			)}

			{isShareModalOpen && (
				<div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 px-4 py-8 backdrop-blur-sm">
					<div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-[#140f24] p-5 shadow-2xl sm:p-6">
						<div className="mb-4 flex items-start justify-between gap-4">
							<div>
								<div className="flex items-center gap-2">
									<Map className="h-5 w-5 text-purple-300" />
									<h2 className="text-xl font-bold text-white">Поделиться роудмапом</h2>
								</div>
								<p className="mt-1 text-sm text-purple-100/70">Выберите личный роудмап и добавьте его в команду {teamTitle}</p>
							</div>
							<button
								type="button"
								onClick={handleCloseShareModal}
								disabled={isSharingRoadmap}
								className="rounded-lg border border-white/10 bg-black/20 p-2 text-purple-200 transition-colors hover:bg-white/10 disabled:opacity-60"
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
								onClick={handleCloseShareModal}
								disabled={isSharingRoadmap}
								className="rounded-lg border border-white/10 bg-black/20 px-4 py-2 text-sm text-purple-100 transition-colors hover:bg-black/35 disabled:opacity-60"
							>
								Отмена
							</button>
							<button
								type="button"
								onClick={() => void handleShareRoadmap()}
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
