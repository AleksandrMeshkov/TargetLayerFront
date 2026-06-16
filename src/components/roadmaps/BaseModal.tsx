import React, { useEffect } from 'react';
import { X } from 'lucide-react';

type BaseModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidthClassName?: string;
  closeLabel?: string;
};

export function BaseModal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidthClassName = 'max-w-2xl',
  closeLabel = 'Закрыть',
}: BaseModalProps) {
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto px-4 py-6">
      <button
        type="button"
        className="absolute inset-0 cursor-default bg-[rgb(var(--page-bg))/0.6] backdrop-blur-sm"
        onClick={onClose}
        aria-label={closeLabel}
      />

      <div className={`relative my-auto w-full ${maxWidthClassName} max-h-[calc(100vh-3rem)] overflow-hidden rounded-3xl p-5 shadow-none theme-panel-strong`}>
        <div className="flex items-start justify-between gap-4">
          <div>
            {subtitle ? <p className="text-xs uppercase tracking-wide theme-muted">{subtitle}</p> : null}
            <h3 className="mt-2 text-xl font-bold theme-heading">{title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-xl p-2 theme-button-secondary"
            aria-label={closeLabel}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 max-h-[calc(100vh-10rem)] overflow-y-auto pr-1">{children}</div>
      </div>
    </div>
  );
}
