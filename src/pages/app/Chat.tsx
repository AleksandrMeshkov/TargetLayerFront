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
              onClick={() => void createConversation()}
              className="inline-flex items-center gap-2 rounded-xl border border-purple-400/40 bg-purple-500/20 px-3 py-2 text-sm text-purple-50 transition hover:bg-purple-500/30"
              disabled={isCreatingConversation}
            >
              <Plus className="h-4 w-4" />
              Новый чат
            </button>
          </div>
        </div>

        <p className="mt-3 max-w-3xl text-sm text-purple-100/70">Здесь можно обсуждать цели с AI и получать сгенерированный roadmap.</p>
      </div>

      <div className="flex min-h-[65vh] gap-4">
        <aside className="hidden w-80 shrink-0 rounded-2xl border border-white/10 bg-black/30 p-4 lg:block">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs uppercase tracking-wide text-purple-200/70">История чатов</p>
            <span className="rounded-lg border border-white/10 px-2 py-1 text-xs text-purple-100/70">{conversations.length}</span>
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

        <div className="flex-1 rounded-2xl border border-white/10 bg-white/[0.04] p-3 sm:p-4">
          <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-purple-200/70">Активный чат</p>
              <p className="text-sm font-medium text-purple-50">{activeConversation ? `#${activeConversation.conversation_id}` : 'Чат не выбран'}</p>
            </div>
            {isSending && <p className="text-xs text-purple-200/80">АИ отвечает...</p>}
          </div>

          <MessageList messages={messages} />

          <MessageComposer value={messageDraft} onChange={setMessageDraft} onSubmit={() => void submitMessage()} disabled={isSending} />
        </div>
      </div>

      {mobileHistoryOpen && (
        <div className="fixed inset-0 z-20 bg-black/60 backdrop-blur-sm lg:hidden">
          <div className="h-full w-[86%] max-w-sm border-r border-white/10 bg-[#0f0a1f] p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-purple-50">История чатов</p>
              <button type="button" onClick={() => setMobileHistoryOpen(false)} className="rounded-lg border border-white/10 p-2 text-purple-100/80">
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
