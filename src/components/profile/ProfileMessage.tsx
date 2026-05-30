import React from 'react';

type ProfileMessageProps = {
  message: string;
  tone?: 'loading' | 'error';
};

export function ProfileMessage({ message, tone = 'loading' }: ProfileMessageProps) {
  return (
    <section className="space-y-6">
      <div className="theme-panel rounded-2xl p-6 sm:p-8">
        <div className="mb-8 flex items-center gap-3">
          <div className="h-8 w-8 rounded-full border border-[rgb(var(--border-color))] bg-[rgb(var(--accent)/0.12)]" />
          <h1 className="theme-heading text-3xl font-bold">Профиль</h1>
        </div>
        <p className={tone === 'error' ? 'text-sm text-red-500' : 'theme-muted text-sm'}>{message}</p>
      </div>
    </section>
  );
}
