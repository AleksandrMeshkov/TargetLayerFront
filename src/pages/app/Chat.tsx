import React, { useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Bot, Menu, MessageCircle, Plus, SendHorizontal, Trash2, X } from 'lucide-react';
import { toast } from 'react-toastify';
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
import type { AppLayoutOutletContext } from '../../components/AppLayout';

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
  roadmap?: AIRoadmapResponse;
};

function isRoadmapResponse(value: unknown): value is AIRoadmapResponse {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as AIRoadmapResponse;
  return (
    typeof candidate.goal_title === 'string'
    && Array.isArray(candidate.tasks)
    && candidate.tasks.every((task) => typeof task.title === 'string')
  );
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

function parseAssistantRoadmap(rawContent: string): AIRoadmapResponse | null {
  try {
    const parsed = JSON.parse(rawContent) as unknown;
    if (isRoadmapResponse(parsed)) {
      return parsed;
    }
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

function formatConversationDate(dateValue: string): string {
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

const Chat: React.FC = () => {
  useOutletContext<AppLayoutOutletContext>();
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
        const [history, conversationItems] = await Promise.all([
          getAIHistory(),
          getAIConversations(),
        ]);

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
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    };

    void loadData();
  }, []);

  const activeConversation = useMemo(() => {
    if (!activeConversationId) {
      return null;
    }
    return conversations.find((conversation) => conversation.conversation_id === activeConversationId) ?? null;
  }, [activeConversationId, conversations]);

  const selectConversation = (conversationId: number): void => {
    setActiveConversationId(conversationId);
    const conversationHistory = historyByConversation[conversationId];
    const historyMessages = conversationHistory?.messages ?? [];
    setMessages(historyMessages.map(mapHistoryMessage));
    setMobileHistoryOpen(false);
  };

  const handleCreateConversation = async (): Promise<void> => {
    if (isCreatingConversation) {
      return;
    }

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
      toast.error(message);
    } finally {
      setIsCreatingConversation(false);
    }
  };

  const handleSubmitMessage = async (): Promise<void> => {
    const prompt = messageDraft.trim();
    if (!prompt || isSending) {
      return;
    }

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

      if (conversationId == null) {
        throw new Error('Не удалось создать чат для отправки сообщения');
      }

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

      const roadmap = await aiChat({
        prompt,
        conversation_id: ensuredConversationId,
      });

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
      toast.error(message);
    } finally {
      setIsSending(false);
    }
  };

  const handleDeleteConversation = async (conversationId: number): Promise<void> => {
    if (deletingConversationId != null) {
      return;
    }

    const confirmed = window.confirm(`Удалить чат #${conversationId}? Это действие нельзя отменить.`);
    if (!confirmed) {
      return;
    }

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

      toast.success(`Чат #${conversationId} удален`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Не удалось удалить чат';
      toast.error(message);
    } finally {
      setDeletingConversationId(null);
    }
  };

  return (
    <section className="relative">
      <div className="mb-5 rounded-3xl border border-white/10 bg-white/5 p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <MessageCircle className="h-7 w-7 text-purple-300" />
            <h1 className="text-2xl font-bold sm:text-3xl">AI чат</h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileHistoryOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-purple-100 transition hover:bg-white/10 lg:hidden"
            >
              <Menu className="h-4 w-4" />
              История
            </button>
            <button
              type="button"
              onClick={() => void handleCreateConversation()}
              className="inline-flex items-center gap-2 rounded-xl border border-purple-400/40 bg-purple-500/20 px-3 py-2 text-sm text-purple-50 transition hover:bg-purple-500/30"
              disabled={isCreatingConversation}
            >
              <Plus className="h-4 w-4" />
              Новый чат
            </button>
          </div>
        </div>

        <p className="mt-3 max-w-3xl text-sm text-purple-100/70">
          Здесь можно обсуждать цели с AI и получать сгенерированный roadmap.
        </p>
      </div>

      <div className="flex min-h-[65vh] gap-4">
        <aside
          className="hidden w-80 shrink-0 rounded-2xl border border-white/10 bg-black/30 p-4 lg:block"
        >
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs uppercase tracking-wide text-purple-200/70">История чатов</p>
            <span className="rounded-lg border border-white/10 px-2 py-1 text-xs text-purple-100/70">
              {conversations.length}
            </span>
          </div>

          <div className="max-h-[58vh] space-y-2 overflow-y-auto pr-1">
            {conversations.length === 0 && !isLoading && (
              <p className="rounded-xl border border-dashed border-white/15 p-3 text-xs text-purple-100/60">
                История пуста. Создайте первый чат.
              </p>
            )}

            {conversations.map((conversation) => {
              const isActive = conversation.conversation_id === activeConversationId;
              const isDeleting = deletingConversationId === conversation.conversation_id;
              return (
                <div
                  key={conversation.conversation_id}
                  className={`w-full rounded-xl border px-3 py-3 text-left transition ${
                    isActive
                      ? 'border-purple-400/60 bg-purple-500/20'
                      : 'border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => selectConversation(conversation.conversation_id)}
                      className="min-w-0 flex-1 text-left"
                    >
                      <p className="text-sm font-medium text-purple-50">Чат #{conversation.conversation_id}</p>
                      <p className="mt-1 text-xs text-purple-100/60">Обновлен: {formatConversationDate(conversation.updated_at)}</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => void handleDeleteConversation(conversation.conversation_id)}
                      disabled={deletingConversationId !== null || isCreatingConversation || isSending}
                      className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-red-500/30 bg-red-500/10 text-red-200 transition hover:bg-red-500/20 disabled:opacity-60"
                      aria-label={`Удалить чат #${conversation.conversation_id}`}
                    >
                      {isDeleting ? <span className="text-[10px]">...</span> : <Trash2 className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        <div className="flex-1 rounded-2xl border border-white/10 bg-white/[0.04] p-3 sm:p-4">
          <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-purple-200/70">Активный чат</p>
              <p className="text-sm font-medium text-purple-50">
                {activeConversation ? `#${activeConversation.conversation_id}` : 'Чат не выбран'}
              </p>
            </div>
            {isSending && <p className="text-xs text-purple-200/80">АИ отвечает...</p>}
          </div>

          <div className="mb-4 max-h-[50vh] space-y-3 overflow-y-auto rounded-xl bg-black/30 p-3 sm:p-4">
            {isLoading && (
              <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-purple-100/70">
                Загружаю историю...
              </div>
            )}

            {!isLoading && messages.length === 0 && (
              <div className="rounded-xl border border-dashed border-white/15 bg-white/[0.02] px-4 py-8 text-center text-sm text-purple-100/60">
                Отправьте сообщение, чтобы начать обсуждение с АИ.
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`rounded-2xl border px-4 py-3 ${
                  message.role === 'user'
                    ? 'ml-auto max-w-[90%] border-purple-500/40 bg-purple-500/20'
                    : 'mr-auto max-w-[95%] border-white/10 bg-white/5'
                }`}
              >
                <div className="mb-2 flex items-center gap-2 text-xs text-purple-200/80">
                  {message.role === 'assistant' ? <Bot className="h-4 w-4" /> : <MessageCircle className="h-4 w-4" />}
                  <span>{message.role === 'assistant' ? 'AI' : 'Вы'}</span>
                  <span>•</span>
                  <span>{formatConversationDate(message.createdAt)}</span>
                </div>

                {message.roadmap ? (
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-semibold text-purple-50">{message.roadmap.goal_title}</p>
                      {message.roadmap.goal_description && (
                        <p className="mt-1 text-sm text-purple-100/80">{message.roadmap.goal_description}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      {message.roadmap.tasks.map((task, index) => (
                        <div key={`${message.id}-task-${task.order_index}-${index}`} className="rounded-lg border border-white/10 bg-black/20 px-3 py-2">
                          <p className="text-sm text-purple-50">{index + 1}. {task.title}</p>
                          {task.description && (
                            <p className="mt-1 text-xs text-purple-100/70">{task.description}</p>
                          )}
                          <p className="mt-1 text-xs text-purple-200/70">
                            Дедлайн: +{task.deadline_offset_days} дн.
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap text-sm text-purple-50">{message.content}</p>
                )}
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-white/10 bg-black/30 p-2 sm:p-3">
            <textarea
              value={messageDraft}
              onChange={(event) => setMessageDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault();
                  void handleSubmitMessage();
                }
              }}
              rows={3}
              placeholder="Опишите цель или задачу, и AI предложит roadmap..."
              className="w-full resize-none rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-white outline-none placeholder:text-purple-100/50 focus:border-purple-400/50"
            />
            <div className="mt-2 flex justify-end">
              <button
                type="button"
                onClick={() => void handleSubmitMessage()}
                disabled={isSending || !messageDraft.trim()}
                className="inline-flex items-center gap-2 rounded-lg border border-purple-400/40 bg-purple-500/20 px-4 py-2 text-sm font-medium text-purple-50 transition hover:bg-purple-500/30 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <SendHorizontal className="h-4 w-4" />
                Отправить
              </button>
            </div>
          </div>
        </div>
      </div>

      {mobileHistoryOpen && (
        <div className="fixed inset-0 z-20 bg-black/60 backdrop-blur-sm lg:hidden">
          <div className="h-full w-[86%] max-w-sm border-r border-white/10 bg-[#0f0a1f] p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-purple-50">История чатов</p>
              <button
                type="button"
                onClick={() => setMobileHistoryOpen(false)}
                className="rounded-lg border border-white/10 p-2 text-purple-100/80"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2 overflow-y-auto">
              {conversations.map((conversation) => (
                <div
                  key={`mobile-${conversation.conversation_id}`}
                  className={`w-full rounded-xl border px-3 py-3 text-left ${
                    conversation.conversation_id === activeConversationId
                      ? 'border-purple-400/60 bg-purple-500/20'
                      : 'border-white/10 bg-white/5'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => selectConversation(conversation.conversation_id)}
                      className="min-w-0 flex-1 text-left"
                    >
                      <p className="text-sm text-purple-50">Чат #{conversation.conversation_id}</p>
                      <p className="mt-1 text-xs text-purple-100/60">{formatConversationDate(conversation.updated_at)}</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => void handleDeleteConversation(conversation.conversation_id)}
                      disabled={deletingConversationId !== null || isCreatingConversation || isSending}
                      className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-red-500/30 bg-red-500/10 text-red-200 transition hover:bg-red-500/20 disabled:opacity-60"
                      aria-label={`Удалить чат #${conversation.conversation_id}`}
                    >
                      {deletingConversationId === conversation.conversation_id ? <span className="text-[10px]">...</span> : <Trash2 className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Chat;
