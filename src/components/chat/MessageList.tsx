import React from 'react';
import type { AIRoadmapResponse } from '../../types/aiTypes/aiTypes';
import type { ChatMessage } from '../../hooks/chatHooks/useChatPage';

type Props = {
  messages: ChatMessage[];
};

const MessageList: React.FC<Props> = ({ messages }) => {
  return (
    <div className="mb-4 max-h-[50vh] space-y-3 overflow-y-auto rounded-xl bg-black/30 p-3 sm:p-4">
      {messages.length === 0 && (
        <div className="rounded-xl border border-dashed border-white/15 bg-white/[0.02] px-4 py-8 text-center text-sm text-purple-100/60">Отправьте сообщение, чтобы начать обсуждение с АИ.</div>
      )}

      {messages.map((message) => (
        <div
          key={message.id}
          className={`rounded-2xl border px-4 py-3 ${message.role === 'user' ? 'ml-auto max-w-[90%] border-purple-500/40 bg-purple-500/20' : 'mr-auto max-w-[95%] border-white/10 bg-white/5'}`}
        >
          <div className="mb-2 flex items-center gap-2 text-xs text-purple-200/80">
            <span>{message.role === 'assistant' ? 'AI' : 'Вы'}</span>
            <span>•</span>
            <span>{new Date(message.createdAt).toLocaleString()}</span>
          </div>

          {message.roadmap ? (
            <div className="space-y-3">
              <div>
                <p className="text-sm font-semibold text-purple-50">{message.roadmap.goal_title}</p>
                {message.roadmap.goal_description && <p className="mt-1 text-sm text-purple-100/80">{message.roadmap.goal_description}</p>}
              </div>

              <div className="space-y-2">
                {message.roadmap.tasks.map((task, index) => (
                  <div key={`${message.id}-task-${task.order_index}-${index}`} className="rounded-lg border border-white/10 bg-black/20 px-3 py-2">
                    <p className="text-sm text-purple-50">{index + 1}. {task.title}</p>
                    {task.description && <p className="mt-1 text-xs text-purple-100/70">{task.description}</p>}
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
  );
};

export default MessageList;
