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
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
      <button
        type="button"
        className="absolute inset-0 cursor-default bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-label={closeLabel}
      />

      <div className={`relative w-full ${maxWidthClassName} rounded-3xl border border-white/10 bg-[#080512] p-5 shadow-none`}>
        <div className="flex items-start justify-between gap-4">
          <div>
            {subtitle ? <p className="text-xs uppercase tracking-wide text-purple-200/70">{subtitle}</p> : null}
            <h3 className="mt-2 text-xl font-bold text-purple-50">{title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-black/30 p-2 text-purple-100 transition hover:bg-white/10"
            aria-label={closeLabel}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
}
