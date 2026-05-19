import React from 'react';
import { SendHorizontal } from 'lucide-react';

type Props = {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
};

const MessageComposer: React.FC<Props> = ({ value, onChange, onSubmit, disabled }) => {
  return (
    <div className="rounded-xl border border-white/10 bg-black/30 p-2 sm:p-3">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            onSubmit();
          }
        }}
        rows={3}
        placeholder="Опишите цель или задачу"
        className="w-full resize-none rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-white outline-none placeholder:text-purple-100/50 focus:border-purple-400/50"
      />
      <div className="mt-2 flex justify-end">
        <button
          type="button"
          onClick={onSubmit}
          disabled={disabled || !value.trim()}
          className="inline-flex items-center gap-2 rounded-lg border border-purple-400/40 bg-purple-500/20 px-4 py-2 text-sm font-medium text-purple-50 transition hover:bg-purple-500/30 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <SendHorizontal className="h-4 w-4" />
          Отправить
        </button>
      </div>
    </div>
  );
};

export default MessageComposer;
