import React from 'react';

type ProfileMessageProps = {
  message: string;
  tone?: 'loading' | 'error';
};

export function ProfileMessage({ message, tone = 'loading' }: ProfileMessageProps) {
  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8">
        <div className="mb-8 flex items-center gap-3">
          <div className="h-8 w-8 rounded-full border border-purple-400/30 bg-purple-500/10" />
          <h1 className="text-3xl font-bold">Профиль</h1>
        </div>
        <p className={tone === 'error' ? 'text-sm text-red-400' : 'text-sm text-purple-100/60'}>{message}</p>
      </div>
    </section>
  );
}
