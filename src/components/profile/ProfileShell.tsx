import React from 'react';
import { UserRound } from 'lucide-react';

type ProfileShellProps = {
  title: string;
  children: React.ReactNode;
};

export function ProfileShell({ title, children }: ProfileShellProps) {
  return (
    <section className="space-y-6">
      <div className="theme-panel rounded-2xl p-6 sm:p-8">
        <div className="mb-8 flex items-center gap-3">
          <UserRound className="theme-accent h-8 w-8" />
          <h1 className="theme-heading text-3xl font-bold">{title}</h1>
        </div>
        {children}
      </div>
    </section>
  );
}
