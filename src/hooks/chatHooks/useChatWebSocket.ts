import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { API_BASE_URL } from '../../api/apiBase/apiBase';
import { ensureAccessToken } from '../../api/auth/fetchWithAuthRetry';
import type { MessageResponse } from '../../types/chatTypes/chatTypes';

export type ChatWsParticipant = {
  user_id: number;
  joined_at: string;
};

type ChatWsServerEvent =
  | { event: 'history'; data: MessageResponse[] }
  | { event: 'participants'; data: ChatWsParticipant[] }
  | { event: 'message'; data: MessageResponse }
  | { event: 'message_deleted'; data: { message_id: number } }
  | { event: 'user_left'; data: { user_id: number } }
  | { event: 'error'; detail: string };

type ChatWsClientAction =
  | { action: 'send'; content: string; type?: string }
  | { action: 'delete'; message_id: number }
  | { action: 'leave' };

export type ChatWebSocketStatus = 'idle' | 'connecting' | 'open' | 'closed' | 'error';

function toWebSocketBaseUrl(httpBaseUrl: string): string {
  const rawBase = httpBaseUrl?.trim() ? httpBaseUrl : window.location.origin;
  return rawBase.replace(/^http(s?):/i, (_match, isHttps: string) => (isHttps ? 'wss:' : 'ws:'));
}

export function useChatWebSocket(chatId: number | null) {
  const wsRef = useRef<WebSocket | null>(null);
  const hasHistoryRef = useRef(false);

  const [status, setStatus] = useState<ChatWebSocketStatus>('idle');
  const [messages, setMessages] = useState<MessageResponse[]>([]);
  const [participants, setParticipants] = useState<ChatWsParticipant[]>([]);
  const [hasHistory, setHasHistory] = useState(false);
  const [hasParticipants, setHasParticipants] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const closeSocket = useCallback(() => {
    const ws = wsRef.current;
    wsRef.current = null;

    if (!ws) {
      return;
    }

    try {
      ws.close(1000, 'Client closed');
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    setMessages([]);
    setParticipants([]);
    setHasHistory(false);
    setHasParticipants(false);
    hasHistoryRef.current = false;
    setError(null);

    if (chatId == null) {
      setStatus('idle');
      closeSocket();
      return;
    }

    let isActive = true;
    setStatus('connecting');

    (async () => {
      try {
        const token = await ensureAccessToken();
        if (!isActive) {
          return;
        }

        const wsHttpBase = import.meta.env.VITE_WS_BASE_URL ?? API_BASE_URL;
        const wsBaseUrl = toWebSocketBaseUrl(wsHttpBase);
        const url = `${wsBaseUrl}/api/v1/chats/${chatId}/ws?token=${encodeURIComponent(token)}`;

        const ws = new WebSocket(url);
        wsRef.current = ws;

        ws.onopen = () => {
          if (!isActive) {
            return;
          }
          setStatus('open');
        };

        ws.onmessage = (event) => {
          if (!isActive) {
            return;
          }

          try {
            const payload = JSON.parse(String(event.data)) as ChatWsServerEvent;

            switch (payload.event) {
              case 'history':
                setMessages(payload.data);
                setHasHistory(true);
                hasHistoryRef.current = true;
                break;
              case 'participants':
                setParticipants(payload.data);
                setHasParticipants(true);
                break;
              case 'message':
                setMessages((prev) => [...prev, payload.data]);
                break;
              case 'message_deleted':
                setMessages((prev) => prev.filter((msg) => msg.message_id !== payload.data.message_id));
                break;
              case 'user_left':
                setParticipants((prev) => prev.filter((p) => p.user_id !== payload.data.user_id));
                break;
              case 'error':
                setError(payload.detail || 'Ошибка WebSocket');
                break;
              default:
                break;
            }
          } catch {
          }
        };

        ws.onerror = () => {
          if (!isActive) {
            return;
          }
          setStatus('error');
          setError('Ошибка WebSocket соединения');
        };

        ws.onclose = (event) => {
          if (!isActive) {
            return;
          }
          setStatus('closed');

          if (!hasHistoryRef.current) {
            const reason = event.reason?.trim() ? event.reason.trim() : '—';
            setError(`WebSocket соединение закрыто до получения истории (code=${event.code}, reason=${reason})`);
          }
        };
      } catch (err) {
        if (!isActive) {
          return;
        }

        const message = err instanceof Error ? err.message : 'Не удалось подключиться к чату';
        setStatus('error');
        setError(message);
      }
    })();

    return () => {
      isActive = false;
      closeSocket();
    };
  }, [chatId, closeSocket]);

  const sendAction = useCallback((action: ChatWsClientAction) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      throw new Error('Соединение с чатом не установлено');
    }

    ws.send(JSON.stringify(action));
  }, []);

  const sendMessage = useCallback((content: string, type: string = 'text') => {
    const normalized = content.trim();
    if (!normalized) {
      return;
    }

    sendAction({ action: 'send', content: normalized, type });
  }, [sendAction]);

  const deleteMessage = useCallback((messageId: number) => {
    if (!Number.isFinite(messageId) || messageId <= 0) {
      return;
    }

    sendAction({ action: 'delete', message_id: messageId });
  }, [sendAction]);

  const leave = useCallback(() => {
    try {
      sendAction({ action: 'leave' });
    } catch {
    } finally {
      closeSocket();
    }
  }, [closeSocket, sendAction]);

  const isReady = status === 'open';
  const isLoadingHistory = chatId != null && (!hasHistory || status === 'connecting');

  return useMemo(() => ({
    status,
    error,
    isReady,
    messages,
    participants,
    hasHistory,
    hasParticipants,
    isLoadingHistory,
    sendMessage,
    deleteMessage,
    leave,
    close: closeSocket,
  }), [
    status,
    error,
    isReady,
    messages,
    participants,
    hasHistory,
    hasParticipants,
    isLoadingHistory,
    sendMessage,
    deleteMessage,
    leave,
    closeSocket,
  ]);
}
