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
        <div className="flex h-36 w-36 shrink-0 items-center justify-center rounded-full border border-purple-400/30 bg-gradient-to-br from-purple-500 to-fuchsia-500 text-6xl font-semibold text-white shadow-lg shadow-purple-500/30">
          {initials}
        </div>
      ) : (
        <img
          src={avatarUrl}
          alt="Фото профиля"
          onLoad={onImageLoad}
          onError={onImageError}
          className="h-36 w-36 shrink-0 rounded-full border border-purple-400/30 object-cover shadow-lg shadow-purple-500/30"
        />
      )}

      <button
        type="button"
        onClick={onUploadClick}
        disabled={uploading}
        className="flex items-center gap-2 text-base font-medium text-purple-200 transition-colors hover:text-purple-100 disabled:cursor-not-allowed disabled:opacity-50"
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
