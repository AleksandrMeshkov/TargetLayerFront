import React from 'react';
import { KeyRound } from 'lucide-react';
import { ProfileThemeToggle } from './ProfileThemeToggle';

type ProfileActionsProps = {
  onChangePassword: () => void;
};

export function ProfileActions({ onChangePassword }: ProfileActionsProps) {
  return (
    <nav className="mt-10 grid gap-4 sm:grid-cols-2">
      <button
        type="button"
        onClick={onChangePassword}
        className="theme-button-secondary w-full justify-start px-5 py-4 text-base"
      >
        <KeyRound className="h-5 w-5" />
        Сменить пароль
      </button>
      <ProfileThemeToggle />
    </nav>
  );
}
