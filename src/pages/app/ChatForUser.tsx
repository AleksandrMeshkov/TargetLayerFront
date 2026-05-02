import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useOutletContext } from 'react-router-dom';
import { LogOut, MessageCircle, SendHorizontal, Trash2, Users, X } from 'lucide-react';
import { toast } from 'react-toastify';
import type { AppLayoutOutletContext } from '../../components/AppLayout';
import { getCurrentProfile, getUserById } from '../../api/auth/userClient';
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

	const { data: myChatsData, isLoading: isChatsLoading, loadMyChats } = useMyChats();

	const [activeChatId, setActiveChatId] = useState<number | null>(null);
	const [messageDraft, setMessageDraft] = useState('');
	const [currentUserId, setCurrentUserId] = useState<number | null>(null);
	const [isSending, setIsSending] = useState(false);
	const [deletingMessageId, setDeletingMessageId] = useState<number | null>(null);
	const [pendingDeletedMessageIds, setPendingDeletedMessageIds] = useState<number[]>([]);
	const [isLeavingChat, setIsLeavingChat] = useState(false);
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
			chatSocket.leave();
			toast.success('Вы вышли из чата');
			setMessageDraft('');
			await reloadChatsAndSelect(null);
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Не удалось выйти из чата';
			toast.error(message);
		} finally {
			setIsLeavingChat(false);
		}
	};

	return (
		<section className="relative">
			<div className="mb-5 rounded-3xl border border-white/10 bg-white/5 p-5 sm:p-6">
				<div className="flex flex-wrap items-center justify-between gap-3">
					<div className="flex items-center gap-3">
						<MessageCircle className="h-7 w-7 text-purple-300" />
						<h1 className="text-2xl font-bold sm:text-3xl">Чаты</h1>
					</div>
				</div>

				<p className="mt-3 max-w-3xl text-sm text-purple-100/70">
					Чаты с пользователями (групповые) и чат вашей команды.
				</p>
			</div>

			<div className="flex min-h-[65vh] flex-col gap-4 lg:flex-row">
				<aside className="w-full shrink-0 rounded-2xl border border-white/10 bg-black/30 p-4 lg:w-80">
					<div className="mb-3 flex items-center justify-between">
						<p className="text-xs uppercase tracking-wide text-purple-200/70">Мои чаты</p>
						<span className="rounded-lg border border-white/10 px-2 py-1 text-xs text-purple-100/70">
							{chats.length}
						</span>
					</div>

					<div className="max-h-[58vh] space-y-2 overflow-y-auto pr-1">
						{isChatsLoading && (
							<p className="rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-purple-100/70">
								Загружаю чаты...
							</p>
						)}

						{!isChatsLoading && chats.length === 0 && (
							<p className="rounded-xl border border-dashed border-white/15 p-3 text-xs text-purple-100/60">
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
											? 'border-purple-400/60 bg-purple-500/20'
											: 'border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10'
									}`}
								>
									<p className="text-sm font-medium text-purple-50">
										{chat.name?.trim() ? chat.name : `Чат #${chat.chat_id}`}
									</p>
									<p className="mt-1 text-xs text-purple-100/60">
										{chat.type} • team #{chat.team_id}
									</p>
									<p className="mt-1 text-[11px] text-purple-100/50">
										Создан: {formatDateTime(chat.created_at)}
									</p>
								</button>
							);
						})}
					</div>
				</aside>

				<div className="flex-1 rounded-2xl border border-white/10 bg-white/[0.04] p-3 sm:p-4">
					<div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
						<div>
							<p className="text-xs uppercase tracking-wide text-purple-200/70">Активный чат</p>
							<p className="text-sm font-medium text-purple-50">
								{activeChat
									? `${activeChat.name?.trim() ? activeChat.name : `#${activeChat.chat_id}`} (team #${activeChat.team_id})`
									: 'Чат не выбран'}
							</p>
						</div>
						<div className="flex items-center gap-2">
							{isSending && <p className="text-xs text-purple-200/80">Отправка...</p>}
							<button
								type="button"
								onClick={() => void handleToggleParticipants()}
								disabled={activeChatId == null}
								className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition disabled:opacity-60 ${
									isParticipantsOpen
										? 'border-purple-400/50 bg-purple-500/20 text-purple-50 hover:bg-purple-500/30'
										: 'border-white/10 bg-white/5 text-purple-50 hover:border-white/30 hover:bg-white/10'
								}`}
								aria-label="Открыть участников чата"
							>
								<Users className="h-4 w-4" />
								{isParticipantsLoading ? '...' : `Участники${participantsChatId === activeChatId ? ` (${participants.length})` : ''}`}
							</button>
							<button
								type="button"
								onClick={() => void handleLeaveChat()}
								disabled={activeChatId == null || isLeavingChat}
								className="inline-flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-100 transition hover:bg-red-500/20 disabled:opacity-60"
								aria-label="Выйти из чата"
							>
								<LogOut className="h-4 w-4" />
								{isLeavingChat ? '...' : 'Выйти'}
							</button>
						</div>
					</div>

					<div className="mb-4 max-h-[50vh] space-y-3 overflow-y-auto rounded-xl bg-black/30 p-3 sm:p-4">
						{isMessagesLoading && activeChatId != null && (
							<div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-purple-100/70">
								Загружаю сообщения...
							</div>
						)}

						{!isMessagesLoading && activeChatId == null && (
							<div className="rounded-xl border border-dashed border-white/15 bg-white/[0.02] px-4 py-8 text-center text-sm text-purple-100/60">
								Выберите чат слева или создайте новый.
							</div>
						)}

						{!isMessagesLoading && activeChatId != null && messages.length === 0 && (
							<div className="rounded-xl border border-dashed border-white/15 bg-white/[0.02] px-4 py-8 text-center text-sm text-purple-100/60">
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
											? 'ml-auto max-w-[90%] border-purple-500/40 bg-purple-500/20'
											: 'mr-auto max-w-[95%] border-white/10 bg-white/5'
									}`}
								>
									{isMine && activeChatId != null && (
										<button
											type="button"
											onClick={() => void handleDeleteMessage(message.message_id)}
											disabled={deletingMessageId != null}
											className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-lg border border-red-500/30 bg-red-500/10 text-red-100 opacity-0 transition hover:bg-red-500/20 group-hover:opacity-100 disabled:opacity-60"
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
									<div className="mb-2 flex items-center gap-2 text-xs text-purple-200/80">
										<MessageCircle className="h-4 w-4" />
										<span>{senderLabel}</span>
										<span>•</span>
										<span>{formatDateTime(message.created_at)}</span>
									</div>
									<p className="whitespace-pre-wrap text-sm text-purple-50">{message.content}</p>
								</div>
							);
						})}
					</div>

					<div className="rounded-xl border border-white/10 bg-black/30 p-2 sm:p-3">
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
							className="w-full resize-none rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-white outline-none placeholder:text-purple-100/50 focus:border-purple-400/50 disabled:opacity-60"
						/>
						<div className="mt-2 flex justify-end">
							<button
								type="button"
								onClick={() => void handleSendMessage()}
								disabled={activeChatId == null || isSending || !messageDraft.trim()}
								className="inline-flex items-center gap-2 rounded-lg border border-purple-400/40 bg-purple-500/20 px-4 py-2 text-sm font-medium text-purple-50 transition hover:bg-purple-500/30 disabled:cursor-not-allowed disabled:opacity-40"
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
						className="w-full max-w-xl rounded-2xl border border-white/10 bg-black/40 p-5 sm:p-6"
						onClick={(event) => event.stopPropagation()}
						role="dialog"
						aria-modal="true"
						aria-labelledby="chat-participants-title"
					>
						<div className="mb-5 flex items-start justify-between gap-4">
							<div>
								<h2 id="chat-participants-title" className="text-xl font-bold text-white">
									Участники чата
									{participantsChatId === activeChatId ? ` (${participants.length})` : ''}
								</h2>
								<p className="mt-1 text-sm text-purple-100/70">
									{activeChat?.name?.trim() ? activeChat.name : `Чат #${activeChatId}`}
								</p>
							</div>
							<button
								type="button"
								onClick={() => setIsParticipantsOpen(false)}
								className="rounded-lg border border-white/10 bg-black/20 p-2 text-purple-200 transition-colors hover:bg-white/10"
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
							<div className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-purple-100/70">
								Загружаю участников...
							</div>
						)}

						{!participantsError && !isParticipantsLoading && participantsChatId === activeChatId && participants.length === 0 && (
							<p className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-purple-100/70">
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
									return (
										<div
											key={participant.user_id}
											className="flex items-start justify-between gap-3 rounded-xl border border-white/10 bg-black/20 px-4 py-3"
									>
											<div className="min-w-0">
												<p className="truncate text-sm font-semibold text-white">
													{isMe ? 'Вы' : (fullName || 'Пользователь')}
												</p>
												<p className="truncate text-xs text-purple-100/70">
													{isMe ? 'Это вы' : (username || 'Загружаю профиль...')}
												</p>
											</div>
											<p className="shrink-0 text-xs text-purple-100/70">с {formatDateTime(participant.joined_at)}</p>
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
