import React from 'react';
import { UserRound } from 'lucide-react';

type ProfileShellProps = {
  title: string;
  children: React.ReactNode;
};

export function ProfileShell({ title, children }: ProfileShellProps) {
  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8">
        <div className="mb-8 flex items-center gap-3">
          <UserRound className="h-8 w-8 text-purple-400" />
          <h1 className="text-3xl font-bold">{title}</h1>
        </div>
        {children}
      </div>
    </section>
  );
}
