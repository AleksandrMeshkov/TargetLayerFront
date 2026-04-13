import React, { useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { MessageCircle, Plus, SendHorizontal } from 'lucide-react';
import { toast } from 'react-toastify';
import type { AppLayoutOutletContext } from '../../components/AppLayout';
import { getCurrentProfile } from '../../api/auth/userClient';
import { getMyTeams } from '../../api/auth/teamClient';
import { createChat, postChatMessage } from '../../api/chat/chatClient';
import { useChatMessages } from '../../hooks/chatHooks/useChatMessages';
import { useMyChats } from '../../hooks/chatHooks/useMyChats';
import type { ChatResponse, MessageResponse } from '../../types/chatTypes/chatTypes';
import type { TeamItem } from '../../types/authTypes/authTypes';

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

function parseUserIds(rawValue: string): number[] {
	return rawValue
		.split(/[,\s]+/)
		.map((part) => part.trim())
		.filter(Boolean)
		.map((part) => Number(part))
		.filter((value) => Number.isFinite(value) && value > 0)
		.map((value) => Math.trunc(value));
}

const ChatForUser: React.FC = () => {
	useOutletContext<AppLayoutOutletContext>();

	const { data: myChatsData, isLoading: isChatsLoading, loadMyChats } = useMyChats();
	const { data: messagesData, isLoading: isMessagesLoading, loadMessages, setData: setMessagesData } = useChatMessages();

	const [teams, setTeams] = useState<TeamItem[]>([]);
	const [teamsLoading, setTeamsLoading] = useState(true);
	const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
	const [activeChatId, setActiveChatId] = useState<number | null>(null);
	const [messageDraft, setMessageDraft] = useState('');
	const [currentUserId, setCurrentUserId] = useState<number | null>(null);
	const [isCreating, setIsCreating] = useState(false);
	const [isSending, setIsSending] = useState(false);

	useEffect(() => {
		const loadInitial = async () => {
			try {
				const [profile, teamsResponse, chatsResponse] = await Promise.all([
					getCurrentProfile(),
					getMyTeams(),
					loadMyChats(),
				]);

				setCurrentUserId(profile.user_id ?? null);
				setTeams(teamsResponse.teams);
				setSelectedTeamId(teamsResponse.teams[0]?.team_id ?? null);

				const firstChatId = chatsResponse.chats[0]?.chat_id ?? null;
				setActiveChatId(firstChatId);
				if (firstChatId != null) {
					await loadMessages(firstChatId);
				}
			} catch (err) {
				const message = err instanceof Error ? err.message : 'Не удалось загрузить чаты';
				toast.error(message);
			} finally {
				setTeamsLoading(false);
			}
		};

		void loadInitial();
	}, [loadMessages, loadMyChats]);

	const chats = myChatsData?.chats ?? [];
	const messages = messagesData?.messages ?? [];

	const activeChat = useMemo<ChatResponse | null>(() => {
		if (activeChatId == null) {
			return null;
		}
		return chats.find((chat) => chat.chat_id === activeChatId) ?? null;
	}, [activeChatId, chats]);

	const selectChat = async (chatId: number) => {
		setActiveChatId(chatId);
		try {
			await loadMessages(chatId);
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Не удалось загрузить сообщения';
			toast.error(message);
		}
	};

	const reloadChatsAndSelect = async (chatIdToSelect?: number | null) => {
		const response = await loadMyChats();
		const nextChatId = chatIdToSelect ?? response.chats[0]?.chat_id ?? null;
		setActiveChatId(nextChatId);
		if (nextChatId != null) {
			await loadMessages(nextChatId);
		} else {
			setMessagesData({ messages: [], total: 0 });
		}
	};

	const handleCreateChat = async () => {
		if (selectedTeamId == null) {
			toast.error('Нет команды для создания чата');
			return;
		}
		if (isCreating) {
			return;
		}

		const participantsRaw = window.prompt('Введите user_id участников через запятую (например: 12, 34)', '');
		if (!participantsRaw) {
			return;
		}

		const participantIds = parseUserIds(participantsRaw);
		if (participantIds.length === 0) {
			toast.error('Не удалось распознать user_id участников');
			return;
		}

		const nameRaw = window.prompt('Название чата (опционально)', '') ?? '';
		const name = nameRaw.trim() || null;

		setIsCreating(true);
		try {
			const chat = await createChat({
				team_id: selectedTeamId,
				participant_user_ids: participantIds,
				name,
			});
			await reloadChatsAndSelect(chat.chat_id);
			toast.success('Чат создан');
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Не удалось создать чат';
			toast.error(message);
		} finally {
			setIsCreating(false);
		}
	};

	const handleSendMessage = async () => {
		const normalizedMessage = messageDraft.trim();
		if (!normalizedMessage || activeChatId == null || isSending) {
			return;
		}

		setIsSending(true);
		try {
			const optimisticMessage: MessageResponse = {
				message_id: Date.now(),
				chat_id: activeChatId,
				user_id: currentUserId ?? -1,
				type: 'text',
				content: normalizedMessage,
				created_at: new Date().toISOString(),
			};

			setMessagesData((prev) => {
				const previousMessages = prev?.messages ?? [];
				return {
					messages: [...previousMessages, optimisticMessage],
					total: (prev?.total ?? previousMessages.length) + 1,
				};
			});

			setMessageDraft('');

			const created = await postChatMessage(activeChatId, { content: normalizedMessage, type: 'text' });

			setMessagesData((prev) => {
				const previousMessages = prev?.messages ?? [];
				const withoutOptimistic = previousMessages.filter((msg) => msg.message_id !== optimisticMessage.message_id);
				return {
					messages: [...withoutOptimistic, created],
					total: (prev?.total ?? previousMessages.length),
				};
			});
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Не удалось отправить сообщение';
			toast.error(message);
			if (activeChatId != null) {
				try {
					await loadMessages(activeChatId);
				} catch {
				}
			}
		} finally {
			setIsSending(false);
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

					<button
						type="button"
						onClick={() => void handleCreateChat()}
						disabled={teamsLoading || isCreating || selectedTeamId == null}
						className="inline-flex items-center gap-2 rounded-xl border border-purple-400/40 bg-purple-500/20 px-4 py-2 text-sm font-semibold text-purple-50 transition hover:bg-purple-500/30 disabled:opacity-60"
					>
						<Plus className="h-4 w-4" />
						Создать чат
					</button>
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
								Пока нет чатов. Создайте чат с пользователем или откройте чат команды.
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
						{isSending && <p className="text-xs text-purple-200/80">Отправка...</p>}
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

						{messages.map((message) => {
							const isMine = currentUserId != null && message.user_id === currentUserId;
							return (
								<div
									key={message.message_id}
									className={`rounded-2xl border px-4 py-3 ${
										isMine
											? 'ml-auto max-w-[90%] border-purple-500/40 bg-purple-500/20'
											: 'mr-auto max-w-[95%] border-white/10 bg-white/5'
									}`}
								>
									<div className="mb-2 flex items-center gap-2 text-xs text-purple-200/80">
										<MessageCircle className="h-4 w-4" />
										<span>{isMine ? 'Вы' : `User #${message.user_id}`}</span>
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
		</section>
	);
};

export default ChatForUser;
