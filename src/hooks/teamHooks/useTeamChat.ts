import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { createChat, getMyChats, getOrCreateTeamChat } from '../../api/chat/chatClient';
import type { TeamMemberView } from '../../types/teamTypes/teamTypes';

type UseTeamChatParams = {
	teamId: number;
	members: TeamMemberView[];
	loadedOnce: boolean;
	refreshMembers: () => Promise<TeamMemberView[] | null>;
};

export function useTeamChat({ teamId, members, loadedOnce, refreshMembers }: UseTeamChatParams) {
	const navigate = useNavigate();
	const [isOpeningTeamChat, setIsOpeningTeamChat] = useState(false);

	const openTeamChat = useCallback(async () => {
		if (!Number.isFinite(teamId) || teamId <= 0) {
			toast.error('Некорректный идентификатор команды');
			return;
		}

		if (isOpeningTeamChat) {
			return;
		}

		setIsOpeningTeamChat(true);
		try {
			const chat = await getOrCreateTeamChat(teamId);
			navigate('/app/chats', { state: { openChatId: chat.chat_id, openTeamId: teamId } });
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Не удалось открыть беседу команды';

			if (message === 'Method Not Allowed') {
				try {
					const myChats = await getMyChats();
					const existingTeamChat = myChats.chats.find((chat) => (
						chat.team_id === teamId && chat.type === 'team'
					)) ?? myChats.chats.find((chat) => chat.team_id === teamId) ?? null;

					if (existingTeamChat) {
						navigate('/app/chats', { state: { openChatId: existingTeamChat.chat_id, openTeamId: teamId } });
						return;
					}

					const memberSource = loadedOnce ? members : await refreshMembers();
					const participantIds = Array.from(
						new Set((memberSource ?? members).map((entry) => entry.membership.user_id).filter((id) => Number.isFinite(id) && id > 0)),
					);

					if (participantIds.length === 0) {
						toast.error('Не удалось определить участников команды');
						return;
					}

					const created = await createChat({
						team_id: teamId,
						participant_user_ids: participantIds,
						name: null,
					});
					navigate('/app/chats', { state: { openChatId: created.chat_id, openTeamId: teamId } });
					return;
				} catch (fallbackErr) {
					const fallbackMessage = fallbackErr instanceof Error ? fallbackErr.message : 'Не удалось открыть беседу команды';
				// Silently handle server errors for demo
					return;
				}
			}

			// Silently handle server errors for demo
		} finally {
			setIsOpeningTeamChat(false);
		}
	}, [isOpeningTeamChat, loadedOnce, members, navigate, refreshMembers, teamId]);

	return {
		isOpeningTeamChat,
		openTeamChat,
	};
}