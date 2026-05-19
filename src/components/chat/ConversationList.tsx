import React from 'react';
import type { AIConversationItem } from '../../types/aiTypes/aiTypes';

type Props = {
  conversations: AIConversationItem[];
  activeId: number | null;
  onSelect: (id: number) => void;
  onDelete: (id: number) => void;
  deletingId: number | null;
  isCreating: boolean;
};

const ConversationList: React.FC<Props> = ({ conversations, activeId, onSelect, onDelete, deletingId, isCreating }) => {
  return (
    <div className="max-h-[58vh] space-y-2 overflow-y-auto pr-1">
      {conversations.length === 0 && !isCreating && (
        <p className="rounded-xl border border-dashed border-white/15 p-3 text-xs text-purple-100/60">История пуста. Создайте первый чат.</p>
      )}

      {conversations.map((conversation) => {
        const isActive = conversation.conversation_id === activeId;
        const isDeleting = deletingId === conversation.conversation_id;
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
              <button type="button" onClick={() => onSelect(conversation.conversation_id)} className="min-w-0 flex-1 text-left">
                <p className="text-sm font-medium text-purple-50">Чат #{conversation.conversation_id}</p>
                <p className="mt-1 text-xs text-purple-100/60">Обновлен: {new Date(conversation.updated_at).toLocaleString()}</p>
              </button>

              <button
                type="button"
                onClick={() => onDelete(conversation.conversation_id)}
                disabled={deletingId !== null}
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-red-500/30 bg-red-500/10 text-red-200 transition hover:bg-red-500/20 disabled:opacity-60"
                aria-label={`Удалить чат #${conversation.conversation_id}`}
              >
                {isDeleting ? <span className="text-[10px]">...</span> : '🗑'}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ConversationList;
