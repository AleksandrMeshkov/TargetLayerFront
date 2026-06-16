import { useEffect, useMemo, useState } from 'react';
import {
  aiChat,
  createAIConversation,
  deleteAIConversation,
  getAIConversations,
  getAIHistory,
} from '../../api/ai/aiChatClient';
import type {
  AIConversationItem,
  AIHistoryConversation,
  AIHistoryMessage,
  AIRoadmapResponse,
} from '../../types/aiTypes/aiTypes';
import { toast } from 'react-toastify';

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
  roadmap?: AIRoadmapResponse;
};

function isRoadmapResponse(value: unknown): value is AIRoadmapResponse {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as AIRoadmapResponse;
  return (
    typeof candidate.goal_title === 'string' &&
    Array.isArray(candidate.tasks) &&
    candidate.tasks.every((t) => typeof t.title === 'string')
  );
}

function parseAssistantRoadmap(rawContent: string): AIRoadmapResponse | null {
  try {
    const parsed = JSON.parse(rawContent) as unknown;
    if (isRoadmapResponse(parsed)) return parsed;
  } catch {
  }
  return null;
}

function mapHistoryMessage(message: AIHistoryMessage): ChatMessage {
  if (message.role === 'assistant') {
    const parsedRoadmap = parseAssistantRoadmap(message.content);
    return {
      id: `history-${message.message_id}`,
      role: 'assistant',
      content: parsedRoadmap ? formatRoadmapAsText(parsedRoadmap) : message.content,
      createdAt: message.created_at,
      roadmap: parsedRoadmap ?? undefined,
    };
  }

  return {
    id: `history-${message.message_id}`,
    role: 'user',
    content: message.content,
    createdAt: message.created_at,
  };
}

function formatRoadmapAsText(roadmap: AIRoadmapResponse): string {
  const lines = [
    `Цель: ${roadmap.goal_title}`,
    roadmap.goal_description ? `Описание: ${roadmap.goal_description}` : '',
    'Шаги:',
    ...roadmap.tasks.map((task, index) => `${index + 1}. ${task.title}`),
  ].filter(Boolean);
  return lines.join('\n');
}

export function useChatPage() {
  const [conversations, setConversations] = useState<AIConversationItem[]>([]);
  const [historyByConversation, setHistoryByConversation] = useState<Record<number, AIHistoryConversation>>({});
  const [activeConversationId, setActiveConversationId] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageDraft, setMessageDraft] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);
  const [deletingConversationId, setDeletingConversationId] = useState<number | null>(null);
  const [mobileHistoryOpen, setMobileHistoryOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [history, conversationItems] = await Promise.all([getAIHistory(), getAIConversations()]);

        const historyMap = history.reduce<Record<number, AIHistoryConversation>>((acc, conversation) => {
          acc[conversation.conversation_id] = conversation;
          return acc;
        }, {});

        const normalizedConversations = conversationItems.length > 0
          ? conversationItems
          : history.map((item) => ({
              conversation_id: item.conversation_id,
              created_at: item.created_at,
              updated_at: item.updated_at,
            }));

        normalizedConversations.sort((a, b) => (
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        ));

        setHistoryByConversation(historyMap);
        setConversations(normalizedConversations);

        if (normalizedConversations.length > 0) {
          const firstConversationId = normalizedConversations[0].conversation_id;
          setActiveConversationId(firstConversationId);
          const firstMessages = historyMap[firstConversationId]?.messages ?? [];
          setMessages(firstMessages.map(mapHistoryMessage));
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Не удалось загрузить АИ-чаты';
        // Silently handle server errors for demo
      } finally {
        setIsLoading(false);
      }
    };

    void loadData();
  }, []);

  const activeConversation = useMemo(() => {
    if (!activeConversationId) return null;
    return conversations.find((c) => c.conversation_id === activeConversationId) ?? null;
  }, [activeConversationId, conversations]);

  const selectConversation = (conversationId: number) => {
    setActiveConversationId(conversationId);
    const convHistory = historyByConversation[conversationId];
    const historyMessages = convHistory?.messages ?? [];
    setMessages(historyMessages.map(mapHistoryMessage));
    setMobileHistoryOpen(false);
  };

  const createConversation = async () => {
    if (isCreatingConversation) return;
    setIsCreatingConversation(true);
    try {
      const conversationId = await createAIConversation();
      const now = new Date().toISOString();
      const newConversation: AIConversationItem = {
        conversation_id: conversationId,
        created_at: now,
        updated_at: now,
      };
      setConversations((prev) => [newConversation, ...prev]);
      setHistoryByConversation((prev) => ({
        ...prev,
        [conversationId]: {
          conversation_id: conversationId,
          created_at: now,
          updated_at: now,
          messages: [],
        },
      }));
      setActiveConversationId(conversationId);
      setMessages([]);
      setMobileHistoryOpen(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Не удалось создать новый чат';
      // Silently handle server errors for demo
    } finally {
      setIsCreatingConversation(false);
    }
  };

  const submitMessage = async () => {
    const prompt = messageDraft.trim();
    if (!prompt || isSending) return;

    let conversationId = activeConversationId;

    try {
      setIsSending(true);

      if (conversationId == null) {
        conversationId = await createAIConversation();
        const now = new Date().toISOString();
        const freshConversation: AIConversationItem = {
          conversation_id: conversationId,
          created_at: now,
          updated_at: now,
        };
        setConversations((prev) => [freshConversation, ...prev]);
        setActiveConversationId(conversationId);
      }

      if (conversationId == null) throw new Error('Не удалось создать чат для отправки сообщения');

      const ensuredConversationId = conversationId;
      const nowIso = new Date().toISOString();
      const optimisticUserMessage: ChatMessage = {
        id: `local-user-${Date.now()}`,
        role: 'user',
        content: prompt,
        createdAt: nowIso,
      };
      setMessages((prev) => [...prev, optimisticUserMessage]);
      setMessageDraft('');

      const roadmap = await aiChat({ prompt, conversation_id: ensuredConversationId });

      const assistantMessage: ChatMessage = {
        id: `local-assistant-${Date.now()}`,
        role: 'assistant',
        content: formatRoadmapAsText(roadmap),
        createdAt: new Date().toISOString(),
        roadmap,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      const updatedAt = new Date().toISOString();
      setConversations((prev) => {
        const withoutActive = prev.filter((item) => item.conversation_id !== ensuredConversationId);
        const existing = prev.find((item) => item.conversation_id === ensuredConversationId);
        const nextItem: AIConversationItem = {
          conversation_id: ensuredConversationId,
          created_at: existing?.created_at ?? updatedAt,
          updated_at: updatedAt,
        };
        return [nextItem, ...withoutActive];
      });

      setHistoryByConversation((prev) => {
        const currentConversation = prev[ensuredConversationId] ?? {
          conversation_id: ensuredConversationId,
          created_at: updatedAt,
          updated_at: updatedAt,
          messages: [],
        };

        return {
          ...prev,
          [ensuredConversationId]: {
            ...currentConversation,
            updated_at: updatedAt,
            messages: [
              ...currentConversation.messages,
              {
                message_id: Date.now(),
                role: 'user',
                content: prompt,
                created_at: optimisticUserMessage.createdAt,
              },
              {
                message_id: Date.now() + 1,
                role: 'assistant',
                content: JSON.stringify(roadmap),
                created_at: assistantMessage.createdAt,
              },
            ],
          },
        };
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Не удалось отправить сообщение';
      // Silently handle server errors for demo
    } finally {
      setIsSending(false);
    }
  };

  const deleteConversation = async (conversationId: number) => {
    if (deletingConversationId != null) return;

    const confirmed = window.confirm(`Удалить чат? Это действие нельзя отменить.`);
    if (!confirmed) return;

    try {
      setDeletingConversationId(conversationId);
      await deleteAIConversation(conversationId);

      const nextConversations = conversations.filter((item) => item.conversation_id !== conversationId);
      const nextActiveConversationId = activeConversationId === conversationId
        ? (nextConversations[0]?.conversation_id ?? null)
        : activeConversationId;

      setConversations(nextConversations);
      setHistoryByConversation((prev) => {
        const { [conversationId]: _removed, ...rest } = prev;
        return rest;
      });
      setActiveConversationId(nextActiveConversationId);

      if (nextActiveConversationId == null) {
        setMessages([]);
      } else if (activeConversationId === conversationId) {
        const nextHistoryMessages = historyByConversation[nextActiveConversationId]?.messages ?? [];
        setMessages(nextHistoryMessages.map(mapHistoryMessage));
      }

      toast.success(`Чат удален`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Не удалось удалить чат';
      // Silently handle server errors for demo
    } finally {
      setDeletingConversationId(null);
    }
  };

  return {
    state: {
      conversations,
      messages,
      messageDraft,
      isLoading,
      isSending,
      isCreatingConversation,
      deletingConversationId,
      mobileHistoryOpen,
      activeConversation,
      activeConversationId,
    },
    actions: {
      setMessageDraft,
      selectConversation,
      createConversation,
      submitMessage,
      deleteConversation,
      setMobileHistoryOpen,
    },
  };
}

export type { ChatMessage };
