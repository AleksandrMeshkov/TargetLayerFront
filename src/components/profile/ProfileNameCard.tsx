import React from 'react';

type ProfileNameCardProps = {
  fullName: string;
  username: string;
  isEditing: boolean;
  saving: boolean;
  nameDraft: { name: string; surname: string; patronymic: string };
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSave: () => void;
  onChangeDraft: (nextDraft: { name: string; surname: string; patronymic: string }) => void;
};

export function ProfileNameCard({
  fullName,
  username,
  isEditing,
  saving,
  nameDraft,
  onStartEdit,
  onCancelEdit,
  onSave,
  onChangeDraft,
}: ProfileNameCardProps) {
  return (
    <div className="space-y-2">
      <div>
        <label className="mb-1 block text-sm font-medium text-purple-200">ФИО</label>
        {!isEditing ? (
          <input
            type="text"
            value={fullName}
            readOnly
            onClick={onStartEdit}
            className="w-full cursor-pointer rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-base text-white outline-none transition-colors hover:border-purple-400/40 sm:w-96"
          />
        ) : (
          <div className="space-y-2 sm:w-96">
            <input
              type="text"
              value={nameDraft.surname}
              onChange={(event) => onChangeDraft({ ...nameDraft, surname: event.target.value })}
              placeholder="Фамилия"
              className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-base text-white outline-none placeholder:text-purple-100/40"
            />
            <input
              type="text"
              value={nameDraft.name}
              onChange={(event) => onChangeDraft({ ...nameDraft, name: event.target.value })}
              placeholder="Имя"
              className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-base text-white outline-none placeholder:text-purple-100/40"
            />
            <input
              type="text"
              value={nameDraft.patronymic}
              onChange={(event) => onChangeDraft({ ...nameDraft, patronymic: event.target.value })}
              placeholder="Отчество (опционально)"
              className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-base text-white outline-none placeholder:text-purple-100/40"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onSave}
                disabled={saving}
                className="rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-purple-500 disabled:opacity-60"
              >
                {saving ? 'Сохранение...' : 'Сохранить'}
              </button>
              <button
                type="button"
                onClick={onCancelEdit}
                disabled={saving}
                className="rounded-lg border border-white/10 bg-black/20 px-4 py-2.5 text-sm font-semibold text-purple-200 transition-colors hover:bg-white/10 disabled:opacity-60"
              >
                Отмена
              </button>
            </div>
          </div>
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-purple-200">Никнейм</label>
        <input
          type="text"
          value={username}
          readOnly
          className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-base text-white outline-none placeholder:text-purple-100/40 sm:w-96"
        />
      </div>
    </div>
  );
}
