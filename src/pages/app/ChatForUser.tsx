import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useOutletContext } from 'react-router-dom';
import { Edit2, LogOut, MessageCircle, SendHorizontal, Trash2, Users, X } from 'lucide-react';
import { API_BASE_URL } from '../../api/apiBase/apiBase';
import { toast } from 'react-toastify';
import type { AppLayoutOutletContext } from '../../components/AppLayout';
import { getCurrentProfile, getUserById } from '../../api/auth/userClient';
import { leaveChat, renameChat } from '../../api/chat/chatClient';
import { useMyChats } from '../../hooks/chatHooks/useMyChats';
import { useChatWebSocket } from '../../hooks/chatHooks/useChatWebSocket';
import type { ChatResponse } from '../../types/chatTypes/chatTypes';
import type { UserProfile } from '../../types/authTypes/authTypes';

function formatDateTime(dateValue: string): string {
	const date = new Date(dateValue);
	if (Number.isNaN(date.getTime())) {
		return 'Неизвестно';
	}
	return new Intl.DateTimeFormat('ru-RU', {
		day: '2-digit',
		month: '2-digit',
		hour: '2-digit',
		minute: '2-digit',
	}).format(date);
}

function formatFullName(profile: Pick<UserProfile, 'surname' | 'name' | 'patronymic'>): string {
	return [profile.surname, profile.name, profile.patronymic].filter(Boolean).join(' ').trim();
}

function formatUsername(profile: Pick<UserProfile, 'username'>): string {
	const raw = profile.username?.trim();
	if (!raw) return '—';
	return raw.startsWith('@') ? raw : `@${raw}`;
}

type ChatLocationState = {
	openChatId?: number | null;
};

const ChatForUser: React.FC = () => {
	useOutletContext<AppLayoutOutletContext>();
	const location = useLocation();
	const { openChatId } = (location.state as ChatLocationState | null) ?? {};

	const { data: myChatsData, isLoading: isChatsLoading, loadMyChats, removeChatLocally } = useMyChats();

	const [activeChatId, setActiveChatId] = useState<number | null>(null);
	const [messageDraft, setMessageDraft] = useState('');
	const [currentUserId, setCurrentUserId] = useState<number | null>(null);
	const [isSending, setIsSending] = useState(false);
	const [deletingMessageId, setDeletingMessageId] = useState<number | null>(null);
	const [pendingDeletedMessageIds, setPendingDeletedMessageIds] = useState<number[]>([]);
	const [isLeavingChat, setIsLeavingChat] = useState(false);
	const [chatNameDraft, setChatNameDraft] = useState('');
	const [isChatNameEditorOpen, setIsChatNameEditorOpen] = useState(false);
	const [isRenamingChat, setIsRenamingChat] = useState(false);
	const [isParticipantsOpen, setIsParticipantsOpen] = useState(false);
	const [profilesByUserId, setProfilesByUserId] = useState<Record<number, UserProfile | null>>({});

	const chatSocket = useChatWebSocket(activeChatId);
	const messages = chatSocket.messages;
	const participants = chatSocket.participants;
	const isMessagesLoading = chatSocket.isLoadingHistory;
	const isParticipantsLoading = isParticipantsOpen && activeChatId != null && !chatSocket.hasParticipants;
	const participantsChatId = chatSocket.hasParticipants ? activeChatId : null;
	const participantsError = chatSocket.error;

	useEffect(() => {
		const loadInitial = async () => {
			try {
				const [profile, chatsResponse] = await Promise.all([getCurrentProfile(), loadMyChats()]);

				setCurrentUserId(profile.user_id ?? null);

				const preferredChatId = openChatId ?? null;
				const nextChatId = preferredChatId ?? chatsResponse.chats[0]?.chat_id ?? null;
				setActiveChatId(nextChatId);
			} catch (err) {
				const message = err instanceof Error ? err.message : 'Не удалось загрузить чаты';
				toast.error(message);
			}
		};

		void loadInitial();
	}, [loadMyChats, openChatId]);

	const chats = myChatsData?.chats ?? [];

	const activeChat = useMemo<ChatResponse | null>(() => {
		if (activeChatId == null) {
			return null;
		}
		return chats.find((chat) => chat.chat_id === activeChatId) ?? null;
	}, [activeChatId, chats]);

	useEffect(() => {
		setChatNameDraft(activeChat?.name?.trim() ?? '');
		setIsChatNameEditorOpen(false);
	}, [activeChat?.chat_id, activeChat?.name]);

	const selectChat = async (chatId: number) => {
		setActiveChatId(chatId);
		setIsParticipantsOpen(false);
	};

	const reloadChatsAndSelect = async (chatIdToSelect?: number | null) => {
		const response = await loadMyChats();
		const nextChatId = chatIdToSelect ?? response.chats[0]?.chat_id ?? null;
		setActiveChatId(nextChatId);
		setIsParticipantsOpen(false);
	};

	const loadMissingProfilesByUserIds = async (userIds: number[]) => {
		const uniqueUserIds = Array.from(new Set(userIds.filter((id) => Number.isFinite(id) && id > 0)));
		const missingUserIds = uniqueUserIds.filter((userId) => profilesByUserId[userId] === undefined);
		if (missingUserIds.length === 0) {
			return;
		}

		const results = await Promise.allSettled(missingUserIds.map((userId) => getUserById(userId)));
		setProfilesByUserId((prev) => {
			const next = { ...prev };
			missingUserIds.forEach((userId, index) => {
				const result = results[index];
				next[userId] = result.status === 'fulfilled' ? result.value : null;
			});
			return next;
		});
	};

	useEffect(() => {
		if (activeChatId == null) {
			return;
		}

		const senderIds = messages
			.map((msg) => msg.user_id)
			.filter((userId) => userId != null && userId > 0 && userId !== currentUserId);

		void loadMissingProfilesByUserIds(senderIds);
	}, [activeChatId, currentUserId, messages]);

	useEffect(() => {
		if (pendingDeletedMessageIds.length === 0) {
			return;
		}

		setPendingDeletedMessageIds((prev) => prev.filter((id) => messages.some((msg) => msg.message_id === id)));
	}, [messages, pendingDeletedMessageIds.length]);

	const handleToggleParticipants = async () => {
		if (activeChatId == null) {
			return;
		}

		const nextOpen = !isParticipantsOpen;
		setIsParticipantsOpen(nextOpen);
		if (!nextOpen) {
			return;
		}

		await loadMissingProfilesByUserIds(participants.map((entry) => entry.user_id));
	};

	const handleSendMessage = async () => {
		const normalizedMessage = messageDraft.trim();
		if (!normalizedMessage || activeChatId == null || isSending) {
			return;
		}

		setIsSending(true);
		try {
			setMessageDraft('');
			chatSocket.sendMessage(normalizedMessage, 'text');
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Не удалось отправить сообщение';
			toast.error(message);
		} finally {
			setIsSending(false);
		}
	};

	const handleDeleteMessage = async (messageId: number) => {
		if (activeChatId == null) {
			return;
		}
		if (deletingMessageId != null) {
			return;
		}

		const ok = window.confirm('Удалить сообщение?');
		if (!ok) {
			return;
		}

		setDeletingMessageId(messageId);
		setPendingDeletedMessageIds((prev) => (prev.includes(messageId) ? prev : [...prev, messageId]));

		try {
			chatSocket.deleteMessage(messageId);
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Не удалось удалить сообщение';
			toast.error(message);
			setPendingDeletedMessageIds((prev) => prev.filter((id) => id !== messageId));
		} finally {
			setDeletingMessageId(null);
		}
	};

	const handleLeaveChat = async () => {
		if (activeChatId == null || isLeavingChat) {
			return;
		}
		const ok = window.confirm('Выйти из этого чата?');
		if (!ok) {
			return;
		}

		setIsLeavingChat(true);
		try {
			await leaveChat(activeChatId);
			removeChatLocally(activeChatId);
			toast.success('Вы вышли из чата');
			setMessageDraft('');
			
			const remainingChats = chats.filter(chat => chat.chat_id !== activeChatId);
			const nextChatId = remainingChats[0]?.chat_id ?? null;
			setActiveChatId(nextChatId);
			setIsParticipantsOpen(false);
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Не удалось выйти из чата';
			toast.error(message);
		} finally {
			setIsLeavingChat(false);
		}
	};

	const openChatNameEditor = () => {
		if (!activeChat) {
			return;
		}

		setChatNameDraft(activeChat.name?.trim() ?? '');
		setIsChatNameEditorOpen(true);
	};

	const closeChatNameEditor = () => {
		if (isRenamingChat) {
			return;
		}

		setIsChatNameEditorOpen(false);
		setChatNameDraft(activeChat?.name?.trim() ?? '');
	};

	const handleRenameChat = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		if (activeChatId == null || isRenamingChat) {
			return;
		}

		const normalizedName = chatNameDraft.trim();
		if (!normalizedName) {
			toast.error('Введите новое название чата');
			return;
		}

		try {
			setIsRenamingChat(true);
			const updated = await renameChat(activeChatId, { name: normalizedName });
			setChatNameDraft(updated.name?.trim() ?? '');
			await loadMyChats();
			setIsChatNameEditorOpen(false);
			toast.success('Название чата обновлено');
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Не удалось переименовать чат';
			toast.error(message);
		} finally {
			setIsRenamingChat(false);
		}
	};

	return (
		<section className="relative">
			<div className="theme-panel mb-5 rounded-3xl p-5 sm:p-6">
				<div className="flex flex-wrap items-center justify-between gap-3">
					<div className="flex items-center gap-3">
						<MessageCircle className="theme-accent h-7 w-7" />
						<h1 className="theme-heading text-2xl font-bold sm:text-3xl">Чаты</h1>
					</div>
				</div>

				<p className="theme-muted mt-3 max-w-3xl text-sm">
					Ваши сообщения
				</p>
			</div>

			<div className="flex min-h-[65vh] flex-col gap-4 lg:flex-row">
				<aside className="theme-panel w-full shrink-0 rounded-2xl p-4 lg:w-80">
					<div className="mb-3 flex items-center justify-between">
						<p className="text-xs uppercase tracking-wide text-[rgb(var(--muted-fg))]">Мои чаты</p>
						<span className="rounded-lg border border-[rgb(var(--border-color))] px-2 py-1 text-xs text-[rgb(var(--muted-fg))]">
							{chats.length}
						</span>
					</div>

					<div className="max-h-[58vh] space-y-2 overflow-y-auto pr-1">
						{isChatsLoading && (
							<p className="theme-panel rounded-xl p-3 text-xs text-[rgb(var(--muted-fg))]">
								Загружаю чаты...
							</p>
						)}

						{!isChatsLoading && chats.length === 0 && (
							<p className="rounded-xl border border-dashed border-[rgb(var(--border-color))] bg-[rgb(var(--surface-soft))/0.4] p-3 text-xs text-[rgb(var(--muted-fg))]">
								Пока нет чатов. Откройте чат команды или дождитесь добавления в групповой чат.
							</p>
						)}

						{chats.map((chat) => {
							const isActive = chat.chat_id === activeChatId;
							return (
								<button
									key={chat.chat_id}
									type="button"
									onClick={() => void selectChat(chat.chat_id)}
									className={`w-full rounded-xl border px-3 py-3 text-left transition ${
										isActive
											? 'border-[rgb(var(--accent))] bg-[rgb(var(--accent)/0.12)]'
											: 'border-[rgb(var(--border-color))] bg-[rgb(var(--surface-soft))/0.45] hover:border-[rgb(var(--accent))] hover:bg-[rgb(var(--surface))/0.85]'
									}`}
								>
									<p className="text-sm font-medium text-[rgb(var(--page-fg))]">
										{chat.name?.trim() ?? ''}
									</p>
									<p className="mt-1 text-[11px] text-[rgb(var(--muted-fg))]">
										Создан: {formatDateTime(chat.created_at)}
									</p>
								</button>
							);
						})}
					</div>
				</aside>

				<div className="theme-panel flex-1 rounded-2xl p-3 sm:p-4">
					<div className="mb-4 flex items-center justify-between border-b border-[rgb(var(--border-color))] pb-3">
						<div>
							<p className="text-sm font-medium text-[rgb(var(--page-fg))]">
								{activeChat?.name?.trim() ?? ''}
							</p>
						</div>
						<div className="flex items-center gap-2">
							{isSending && <p className="text-xs text-[rgb(var(--muted-fg))]">Отправка</p>}
							<button
								type="button"
								onClick={() => void handleToggleParticipants()}
								disabled={activeChatId == null}
								className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition disabled:opacity-60 ${
									isParticipantsOpen
										? 'border-[rgb(var(--accent))] bg-[rgb(var(--accent)/0.12)] text-[rgb(var(--page-fg))] hover:bg-[rgb(var(--accent)/0.16)]'
										: 'border-[rgb(var(--border-color))] bg-[rgb(var(--surface-soft))/0.45] text-[rgb(var(--page-fg))] hover:border-[rgb(var(--accent))] hover:bg-[rgb(var(--surface))/0.85]'
								}`}
								aria-label="Открыть участников чата"
							>
								<Users className="h-4 w-4" />
								{isParticipantsLoading ? '...' : `Участники${participantsChatId === activeChatId ? ` (${participants.length})` : ''}`}
							</button>
							<button
								type="button"
								onClick={() => void openChatNameEditor()}
								disabled={activeChatId == null}
								className="inline-flex items-center gap-2 rounded-lg border border-[rgb(var(--border-color))] bg-[rgb(var(--surface-soft))/0.45] px-3 py-2 text-xs font-semibold text-[rgb(var(--page-fg))] transition hover:border-[rgb(var(--accent))] hover:bg-[rgb(var(--surface))/0.85] disabled:opacity-60"
								aria-label="Изменить название чата"
							>
								<Edit2 className="h-4 w-4" />
								Изменить название
							</button>
							<button
								type="button"
								onClick={() => void handleLeaveChat()}
								disabled={activeChatId == null || isLeavingChat}
								className="inline-flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-500/20 disabled:opacity-60"
								aria-label="Выйти из чата"
							>
								<LogOut className="h-4 w-4" />
								{isLeavingChat ? '...' : 'Выйти'}
							</button>
						</div>
					</div>

					{activeChat && isChatNameEditorOpen && (
						<form onSubmit={handleRenameChat} className="theme-panel mb-4 rounded-xl p-3">
							<div className="mb-3 flex items-center justify-between gap-3">
								<p className="text-xs uppercase tracking-wide text-[rgb(var(--muted-fg))]">Название чата</p>
								<button
									type="button"
									onClick={closeChatNameEditor}
									disabled={isRenamingChat}
									className="inline-flex items-center gap-2 rounded-lg border border-[rgb(var(--border-color))] bg-[rgb(var(--surface-soft))/0.45] px-3 py-1.5 text-xs font-semibold text-[rgb(var(--page-fg))] transition hover:border-[rgb(var(--accent))] hover:bg-[rgb(var(--surface))/0.85] disabled:opacity-60"
								>
									<X className="h-4 w-4" />
									Закрыть
								</button>
							</div>
							<div className="flex flex-col gap-3 sm:flex-row sm:items-end">
								<div className="min-w-0 flex-1">
									<input
										id="chat-name"
										type="text"
										value={chatNameDraft}
										onChange={(event) => setChatNameDraft(event.target.value)}
										placeholder={activeChat?.name?.trim() ?? ''}
										disabled={isRenamingChat}
										className="theme-input w-full rounded-lg px-3 py-2 text-sm"
									/>
								</div>
								<button
									type="submit"
									disabled={isRenamingChat || !chatNameDraft.trim()}
									className="theme-button-primary disabled:cursor-not-allowed disabled:opacity-40"
								>
									<Edit2 className="h-4 w-4" />
									{isRenamingChat ? 'Сохранение...' : 'Сохранить'}
								</button>
							</div>
						</form>
					)}

					<div className="theme-panel mb-4 max-h-[50vh] space-y-3 overflow-y-auto rounded-xl p-3 sm:p-4">
						{isMessagesLoading && activeChatId != null && (
							<div className="rounded-xl border border-[rgb(var(--border-color))] bg-[rgb(var(--surface-soft))/0.45] px-4 py-3 text-sm text-[rgb(var(--muted-fg))]">
								Загружаю сообщения...
							</div>
						)}

						{!isMessagesLoading && activeChatId == null && (
							<div className="rounded-xl border border-dashed border-[rgb(var(--border-color))] bg-[rgb(var(--surface-soft))/0.35] px-4 py-8 text-center text-sm text-[rgb(var(--muted-fg))]">
								Выберите чат слева или создайте новый.
							</div>
						)}

						{!isMessagesLoading && activeChatId != null && messages.length === 0 && (
							<div className="rounded-xl border border-dashed border-[rgb(var(--border-color))] bg-[rgb(var(--surface-soft))/0.35] px-4 py-8 text-center text-sm text-[rgb(var(--muted-fg))]">
								Сообщений пока нет — отправьте первое.
							</div>
						)}

						{messages.filter((message) => !pendingDeletedMessageIds.includes(message.message_id)).map((message) => {
							const isMine = currentUserId != null && message.user_id === currentUserId;
							const senderProfile = !isMine ? profilesByUserId[message.user_id] : null;
							const senderFullName = senderProfile ? formatFullName(senderProfile) : '';
							const senderUsername = senderProfile ? formatUsername(senderProfile) : '';
							const senderLabel = isMine ? 'Вы' : (senderFullName || senderUsername || 'Пользователь');
							return (
								<div
									key={message.message_id}
									className={`group relative rounded-2xl border px-4 py-3 ${
										isMine
											? 'ml-auto max-w-[90%] border-[rgb(var(--accent))] bg-[rgb(var(--accent)/0.12)]'
											: 'mr-auto max-w-[95%] border-[rgb(var(--border-color))] bg-[rgb(var(--surface))/0.8]'
									}`}
								>
									{isMine && activeChatId != null && (
										<button
											type="button"
											onClick={() => void handleDeleteMessage(message.message_id)}
											disabled={deletingMessageId != null}
											className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-lg border border-red-500/30 bg-red-500/10 text-red-700 opacity-0 transition hover:bg-red-500/20 group-hover:opacity-100 disabled:opacity-60 dark:text-red-100"
											aria-label="Удалить сообщение"
											title="Удалить"
										>
											{deletingMessageId === message.message_id ? (
												<span className="text-[10px]">...</span>
											) : (
												<Trash2 className="h-4 w-4" />
											)}
										</button>
									)}
									<div className="mb-2 flex items-center gap-2 text-xs text-[rgb(var(--muted-fg))]">
										<MessageCircle className="h-4 w-4" />
										<span>{senderLabel}</span>
										<span>•</span>
										<span>{formatDateTime(message.created_at)}</span>
									</div>
									<p className="whitespace-pre-wrap text-sm text-[rgb(var(--page-fg))]">{message.content}</p>
								</div>
							);
						})}
					</div>

					<div className="theme-panel rounded-xl p-2 sm:p-3">
						<textarea
							value={messageDraft}
							onChange={(event) => setMessageDraft(event.target.value)}
							onKeyDown={(event) => {
								if (event.key === 'Enter' && !event.shiftKey) {
									event.preventDefault();
									void handleSendMessage();
								}
							}}
							rows={3}
							placeholder={activeChatId == null ? 'Сначала выберите чат...' : 'Напишите сообщение...'}
							disabled={activeChatId == null || isSending}
							className="theme-input w-full resize-none rounded-lg p-3 text-sm"
						/>
						<div className="mt-2 flex justify-end">
							<button
								type="button"
								onClick={() => void handleSendMessage()}
								disabled={activeChatId == null || isSending || !messageDraft.trim()}
								className="theme-button-primary bg-[rgb(var(--accent))] text-[rgb(var(--accent-foreground))] disabled:cursor-not-allowed disabled:opacity-40"
							>
								<SendHorizontal className="h-4 w-4" />
								Отправить
							</button>
						</div>
					</div>
				</div>
			</div>

			{isParticipantsOpen && activeChatId != null && (
				<div
					className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-sm"
					onClick={() => setIsParticipantsOpen(false)}
				>
					<div
						className="theme-panel-strong w-full max-w-xl rounded-2xl p-5 sm:p-6"
						onClick={(event) => event.stopPropagation()}
						role="dialog"
						aria-modal="true"
						aria-labelledby="chat-participants-title"
					>
						<div className="mb-5 flex items-start justify-between gap-4">
							<div>
								<h2 id="chat-participants-title" className="theme-heading text-xl font-bold">
									Участники чата
									{participantsChatId === activeChatId ? ` (${participants.length})` : ''}
								</h2>
								<p className="theme-muted mt-1 text-sm">
									{activeChat?.name?.trim() ?? ''}
								</p>
							</div>
							<button
								type="button"
								onClick={() => setIsParticipantsOpen(false)}
								className="theme-button-secondary p-2"
								aria-label="Закрыть окно участников"
							>
								<X className="h-4 w-4" />
							</button>
						</div>

						{participantsError && (
							<p className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
								{participantsError}
							</p>
						)}

						{!participantsError && isParticipantsLoading && (
							<div className="rounded-xl border border-[rgb(var(--border-color))] bg-[rgb(var(--surface-soft))/0.45] px-4 py-3 text-sm text-[rgb(var(--muted-fg))]">
								Загружаю участников...
							</div>
						)}

						{!participantsError && !isParticipantsLoading && participantsChatId === activeChatId && participants.length === 0 && (
							<p className="rounded-xl border border-[rgb(var(--border-color))] bg-[rgb(var(--surface-soft))/0.45] px-4 py-3 text-sm text-[rgb(var(--muted-fg))]">
								В чате нет участников.
							</p>
						)}

						{!participantsError && participantsChatId === activeChatId && participants.length > 0 && (
							<div className="max-h-[55vh] space-y-2 overflow-y-auto pr-1">
								{participants.map((participant) => {
									const isMe = currentUserId != null && participant.user_id === currentUserId;
									const profile = profilesByUserId[participant.user_id];
									const fullName = profile ? formatFullName(profile) : '';
									const username = profile ? formatUsername(profile) : '';
									const buildAvatarUrl = (avatarPath: string | null | undefined): string | null => {
										if (!avatarPath) return null;
										if (avatarPath.startsWith('http')) return avatarPath;
										return `${API_BASE_URL}${avatarPath.startsWith('/') ? '' : '/'}${avatarPath}`;
									};
									const avatarUrl = profile ? buildAvatarUrl(profile.avatar_url) : null;
									const getInitials = (prof: Pick<UserProfile, 'name' | 'surname'> | null) => {
										const first = prof?.name?.[0] ?? '';
										const second = prof?.surname?.[0] ?? '';
										return `${first}${second}`.toUpperCase() || '??';
									};
									return (
										<div
											key={participant.user_id}
											className="flex items-center justify-between gap-3 rounded-xl border border-[rgb(var(--border-color))] bg-[rgb(var(--surface-soft))/0.45] px-4 py-3"
										>
											<div className="min-w-0 flex items-center gap-3">
												{avatarUrl ? (
													<img
														src={avatarUrl}
														alt={profile?.username ?? `user-${participant.user_id}`}
														className="h-10 w-10 rounded-full border border-[rgb(var(--border-color))/0.12] object-cover"
													/>
												) : (
													<div className="flex h-10 w-10 items-center justify-center rounded-full border border-[rgb(var(--border-color))/0.12] bg-gradient-to-br from-[rgb(var(--accent))] to-[rgb(var(--accent-strong))] text-xs font-semibold text-[rgb(var(--accent-foreground))]">
														{getInitials(profile ?? null)}
													</div>
												)}
												<div>
													<p className="truncate text-sm font-semibold text-[rgb(var(--page-fg))]">
														{isMe ? 'Вы' : (fullName || 'Пользователь')}
													</p>
													<p className="truncate text-xs text-[rgb(var(--muted-fg))]">
														{isMe ? 'Это вы' : (username || 'Загружаю профиль...')}
													</p>
												</div>
											</div>
											<p className="shrink-0 text-xs text-[rgb(var(--muted-fg))]">с {formatDateTime(participant.joined_at)}</p>
										</div>
									);
								})}
							</div>
						)}
					</div>
				</div>
			)}
		</section>
	);
};

export default ChatForUser;
