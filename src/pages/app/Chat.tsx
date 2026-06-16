import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { Menu, MessageCircle, Plus, X } from 'lucide-react';
import type { AppLayoutOutletContext } from '../../components/AppLayout';
import { useChatPage } from '../../hooks/chatHooks/useChatPage';
import ConversationList from '../../components/chat/ConversationList';
import MessageList from '../../components/chat/MessageList';
import MessageComposer from '../../components/chat/MessageComposer';

const Chat: React.FC = () => {
  useOutletContext<AppLayoutOutletContext>();
  const { state, actions } = useChatPage();

  const {
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
  } = state;

  const { setMessageDraft, selectConversation, createConversation, submitMessage, deleteConversation, setMobileHistoryOpen } = actions;

  return (
    <section className="relative">
      <div className="theme-panel mb-5 rounded-3xl p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <MessageCircle className="theme-accent h-7 w-7" />
            <h1 className="theme-heading text-2xl font-bold sm:text-3xl">ИИ-помощник</h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileHistoryOpen(true)}
              className="theme-button-secondary lg:hidden"
            >
              <Menu className="h-4 w-4" />
              История
            </button>
            <button
              type="button"
              onClick={() => void createConversation()}
              className="theme-button-primary"
              disabled={isCreatingConversation}
            >
              <Plus className="h-4 w-4" />
              Новый чат
            </button>
          </div>
        </div>

        <p className="theme-muted mt-3 max-w-3xl text-sm">Здесь можно обсуждать цели с AI и получать сгенерированный roadmap.</p>
      </div>

      <div className="flex min-h-[65vh] gap-4">
        <aside className="theme-panel hidden w-80 shrink-0 rounded-2xl p-4 lg:block">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs uppercase tracking-wide text-[rgb(var(--muted-fg))]">История чатов</p>
            <span className="rounded-lg border border-[rgb(var(--border-color))/0.25] px-2 py-1 text-xs text-[rgb(var(--muted-fg))]">{conversations.length}</span>
          </div>

          <ConversationList
            conversations={conversations}
            activeId={activeConversationId}
            onSelect={(id) => selectConversation(id)}
            onDelete={(id) => void deleteConversation(id)}
            deletingId={deletingConversationId}
            isCreating={isCreatingConversation}
          />
        </aside>

        <div className="theme-panel flex-1 rounded-2xl p-3 sm:p-4">
          <div className="mb-4 flex items-center justify-between border-b border-[rgb(var(--border-color))/0.25] pb-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-[rgb(var(--muted-fg))]">Активный чат</p>
              <p className="text-sm font-medium text-[rgb(var(--page-fg))]">{activeConversation ? `#${activeConversation.conversation_id}` : 'Чат не выбран'}</p>
            </div>
            {isSending && <p className="text-xs text-[rgb(var(--muted-fg))]">АИ отвечает...</p>}
          </div>

          <MessageList messages={messages} />

          <MessageComposer value={messageDraft} onChange={setMessageDraft} onSubmit={() => void submitMessage()} disabled={isSending} />
        </div>
      </div>

      {mobileHistoryOpen && (
        <div className="fixed inset-0 z-20 bg-black/60 backdrop-blur-sm lg:hidden">
          <div className="theme-panel-strong h-full w-[86%] max-w-sm border-r p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-[rgb(var(--page-fg))]">История чатов</p>
              <button type="button" onClick={() => setMobileHistoryOpen(false)} className="theme-button-secondary p-2">
                <X className="h-4 w-4" />
              </button>
            </div>

            <ConversationList
              conversations={conversations}
              activeId={activeConversationId}
              onSelect={(id) => selectConversation(id)}
              onDelete={(id) => void deleteConversation(id)}
              deletingId={deletingConversationId}
              isCreating={isCreatingConversation}
            />
          </div>
        </div>
      )}
    </section>
  );
};

export default Chat;
