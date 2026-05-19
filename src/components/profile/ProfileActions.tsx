import React from 'react';
import { KeyRound } from 'lucide-react';

type ProfileActionsProps = {
  onChangePassword: () => void;
};

export function ProfileActions({ onChangePassword }: ProfileActionsProps) {
  return (
    <nav className="mt-10 space-y-4">
      <button
        type="button"
        onClick={onChangePassword}
        className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-black/20 px-5 py-4 text-base text-purple-200 transition-colors hover:bg-white/10"
      >
        <KeyRound className="h-5 w-5 text-purple-300" />
        Сменить пароль
      </button>
    </nav>
  );
}
