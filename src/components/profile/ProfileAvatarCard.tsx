import React from 'react';
import { Upload } from 'lucide-react';

type ProfileAvatarCardProps = {
  avatarUrl: string | null;
  initials: string;
  showPlaceholder: boolean;
  uploading: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onUploadClick: () => void;
  onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onImageLoad: () => void;
  onImageError: (event: React.SyntheticEvent<HTMLImageElement>) => void;
};

export function ProfileAvatarCard({
  avatarUrl,
  initials,
  showPlaceholder,
  uploading,
  fileInputRef,
  onUploadClick,
  onFileSelect,
  onImageLoad,
  onImageError,
}: ProfileAvatarCardProps) {
  return (
    <div className="space-y-3">
      {showPlaceholder || !avatarUrl ? (
        <div className="flex h-36 w-36 shrink-0 items-center justify-center rounded-full border border-[rgb(var(--border-color))] bg-gradient-to-br from-purple-500 to-fuchsia-500 text-6xl font-semibold text-white shadow-lg shadow-purple-500/30">
          {initials}
        </div>
      ) : (
        <img
          src={avatarUrl}
          alt="Фото профиля"
          onLoad={onImageLoad}
          onError={onImageError}
          className="h-36 w-36 shrink-0 rounded-full border border-[rgb(var(--border-color))] object-cover shadow-lg shadow-purple-500/30"
        />
      )}

      <button
        type="button"
        onClick={onUploadClick}
        disabled={uploading}
        className="theme-button-secondary px-0 py-0 text-base font-medium"
      >
        <Upload className="h-5 w-5" />
        {uploading ? 'Загрузка...' : 'Загрузить фото'}
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={onFileSelect}
        className="hidden"
        disabled={uploading}
      />
    </div>
  );
}
