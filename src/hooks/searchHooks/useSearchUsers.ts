import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { createChat } from '../../api/chat/chatClient';
import { searchUsers } from '../../api/auth/userClient';
import type { SearchUser } from '../../types/authTypes/authTypes';

export function useSearchUsers() {
	const navigate = useNavigate();
	const [query, setQuery] = useState('');
	const [results, setResults] = useState<SearchUser[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [hasSearched, setHasSearched] = useState(false);
	const [failedAvatarUserIds, setFailedAvatarUserIds] = useState<Set<number>>(new Set());
	const [creatingChatUserId, setCreatingChatUserId] = useState<number | null>(null);

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
					// Silently handle server errors for demo
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

	const handleCreateChat = async (user: SearchUser) => {
		try {
			setCreatingChatUserId(user.user_id);
			const chat = await createChat({
				team_id: 0,
				participant_user_ids: [user.user_id],
			});
			toast.success(`Чат с @${user.username} создан`);
			navigate('/app/chats', { state: { openChatId: chat.chat_id } });
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Не удалось создать чат';
			// Silently handle server errors for demo
		} finally {
			setCreatingChatUserId(null);
		}
	};

	const markAvatarAsFailed = (userId: number) => {
		setFailedAvatarUserIds((prev) => new Set([...prev, userId]));
	};

	return {
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
	};
}