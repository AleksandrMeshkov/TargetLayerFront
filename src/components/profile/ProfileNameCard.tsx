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
        <label className="theme-label mb-1">ФИО</label>
        {!isEditing ? (
          <input
            type="text"
            value={fullName}
            readOnly
            onClick={onStartEdit}
            className="theme-input w-full cursor-pointer sm:w-96"
          />
        ) : (
          <div className="space-y-2 sm:w-96">
            <input
              type="text"
              value={nameDraft.surname}
              onChange={(event) => onChangeDraft({ ...nameDraft, surname: event.target.value })}
              placeholder="Фамилия"
              className="theme-input"
            />
            <input
              type="text"
              value={nameDraft.name}
              onChange={(event) => onChangeDraft({ ...nameDraft, name: event.target.value })}
              placeholder="Имя"
              className="theme-input"
            />
            <input
              type="text"
              value={nameDraft.patronymic}
              onChange={(event) => onChangeDraft({ ...nameDraft, patronymic: event.target.value })}
              placeholder="Отчество (опционально)"
              className="theme-input"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onSave}
                disabled={saving}
                className="theme-button-primary"
              >
                {saving ? 'Сохранение...' : 'Сохранить'}
              </button>
              <button
                type="button"
                onClick={onCancelEdit}
                disabled={saving}
                className="theme-button-secondary"
              >
                Отмена
              </button>
            </div>
          </div>
        )}
      </div>

      <div>
        <label className="theme-label mb-1">Никнейм</label>
        <input
          type="text"
          value={username}
          readOnly
          className="theme-input w-full sm:w-96"
        />
      </div>
    </div>
  );
}
