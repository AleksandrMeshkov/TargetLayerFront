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
    <div className="rounded-xl border border-[rgb(var(--border-color))/0.25] bg-[rgb(var(--surface-soft))/0.45] p-2 sm:p-3">
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
        className="theme-input w-full resize-none text-sm"
      />
      <div className="mt-2 flex justify-end">
        <button
          type="button"
          onClick={onSubmit}
          disabled={disabled || !value.trim()}
          className="theme-button-primary bg-[rgb(var(--accent))] text-[rgb(var(--accent-foreground))]"
        >
          <SendHorizontal className="h-4 w-4" />
          Отправить
        </button>
      </div>
    </div>
  );
};

export default MessageComposer;
