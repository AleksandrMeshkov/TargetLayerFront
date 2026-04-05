import React, { useState, useEffect, useRef } from 'react';
import { KeyRound, Upload, UserRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { UserProfile } from '../../api/auth';
import { getCurrentProfile, updateUserName, updateUserProfile } from '../../api/auth';
import { toast } from 'react-toastify';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [savingName, setSavingName] = useState(false);
  const [isNameEditing, setIsNameEditing] = useState(false);
  const [nameDraft, setNameDraft] = useState({ name: '', surname: '', patronymic: '' });
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getAvatarUrl = (avatarPath: string | null | undefined): string | null => {
    if (!avatarPath) return null;
    
    if (avatarPath.startsWith('http')) {
      return avatarPath;
    }
    
    const baseUrl = import.meta.env.VITE_API_BASE_URL ?? 'https://targetl.site';
    return `${baseUrl}${avatarPath.startsWith('/') ? '' : '/'}${avatarPath}`;
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await getCurrentProfile();
        console.log('Профиль загружен с /api/v1/user/me:', data);
        console.log('Все поля профиля:', Object.keys(data));
        setProfile(data);
        setError(null);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Ошибка загрузки профиля';
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const getInitials = () => {
    if (!profile) return 'AM';
    const firstNameInitial = profile.name?.[0] || '';
    const surnameInitial = profile.surname?.[0] || '';
    return `${firstNameInitial}${surnameInitial}`.toUpperCase();
  };

  const getFullName = () => {
    if (!profile) return 'Alexander Meshkov';
    const parts = [profile.surname, profile.name, profile.patronymic].filter(Boolean);
    return parts.join(' ');
  };

  const handleStartNameEdit = () => {
    if (!profile) return;
    setNameDraft({
      name: profile.name ?? '',
      surname: profile.surname ?? '',
      patronymic: profile.patronymic ?? '',
    });
    setIsNameEditing(true);
  };

  const handleCancelNameEdit = () => {
    setIsNameEditing(false);
  };

  const handleSaveName = async () => {
    if (!nameDraft.name.trim() || !nameDraft.surname.trim()) {
      toast.error('Имя и фамилия обязательны для заполнения');
      return;
    }

    try {
      setSavingName(true);
      await updateUserName({
        name: nameDraft.name.trim(),
        surname: nameDraft.surname.trim(),
        patronymic: nameDraft.patronymic.trim() || undefined,
      });

      const freshProfile = await getCurrentProfile();
      setProfile(freshProfile);
      setIsNameEditing(false);
      toast.success('ФИО успешно обновлено');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Ошибка обновления ФИО';
      toast.error(message);
    } finally {
      setSavingName(false);
    }
  };

  const handleUploadPhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log('Выбран файл:', { name: file.name, type: file.type, size: file.size });

    // Проверяем тип файла
    if (!file.type.startsWith('image/')) {
      toast.error('Пожалуйста, выберите изображение');
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('Размер файла не должен превышать 5MB');
      return;
    }

    try {
      setUploading(true);
      console.log('Начинаем загрузку файла...');
      const updatedProfile = await updateUserProfile(file);
      console.log('Загрузка завершена, новый профиль:', updatedProfile);
      console.log('Все поля профиля:', Object.keys(updatedProfile));
      console.log('URL аватара:', updatedProfile.avatar_url);
      
      const freshProfile = await getCurrentProfile();
      console.log('Свежий профиль с /api/v1/user/me:', freshProfile);
      console.log('Avatar в свежем профиле:', freshProfile.avatar_url);
      
      setProfile(freshProfile);
      toast.success('Фото успешно загружено');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Ошибка загрузки фото';
      console.error('Ошибка при загрузке:', message);
      toast.error(message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  if (loading) {
    return (
      <section className="space-y-6">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8">
          <div className="mb-8 flex items-center gap-3">
            <UserRound className="h-8 w-8 text-purple-400" />
            <h1 className="text-3xl font-bold">Профиль</h1>
          </div>
          <p className="text-sm text-purple-100/60">Загрузка данных профиля...</p>
        </div>
      </section>
    );
  }

  if (error || !profile) {
    return (
      <section className="space-y-6">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8">
          <div className="mb-8 flex items-center gap-3">
            <UserRound className="h-8 w-8 text-purple-400" />
            <h1 className="text-3xl font-bold">Профиль</h1>
          </div>
          <p className="text-sm text-red-400">{error || 'Не удалось загрузить данные профиля'}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8">
        <div className="mb-8 flex items-center gap-3">
          <UserRound className="h-8 w-8 text-purple-400" />
          <h1 className="text-3xl font-bold">Профиль</h1>
        </div>

        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          {(() => {
            const avatarUrl = getAvatarUrl(profile.avatar_url);
            return avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Фото профиля"
                onError={(e) => {
                  console.error('Ошибка загрузки изображения:', e);
                  e.currentTarget.style.display = 'none';
                }}
                className="h-24 w-24 shrink-0 rounded-full border border-purple-400/30 object-cover shadow-lg shadow-purple-500/30"
              />
            ) : (
              <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full border border-purple-400/30 bg-gradient-to-br from-purple-500 to-fuchsia-500 text-4xl font-semibold text-white shadow-lg shadow-purple-500/30">
                {getInitials()}
              </div>
            );
          })()}

          <div className="space-y-3">
            <button
              type="button"
              onClick={handleUploadPhotoClick}
              disabled={uploading}
              className="flex items-center gap-2 text-sm font-medium text-purple-200 transition-colors hover:text-purple-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Upload className="h-4 w-4" />
              {uploading ? 'Загрузка...' : 'Загрузить фото'}
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              disabled={uploading}
            />

            <div className="space-y-2">
              <div>
                <label className="block text-xs font-medium text-purple-200 mb-1">ФИО</label>
                {!isNameEditing ? (
                  <input
                    type="text"
                    value={getFullName()}
                    readOnly
                    onClick={handleStartNameEdit}
                    className="w-full cursor-pointer rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-white outline-none transition-colors hover:border-purple-400/40 sm:w-80"
                  />
                ) : (
                  <div className="space-y-2 sm:w-80">
                    <input
                      type="text"
                      value={nameDraft.surname}
                      onChange={(e) => setNameDraft((prev) => ({ ...prev, surname: e.target.value }))}
                      placeholder="Фамилия"
                      className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-white outline-none placeholder:text-purple-100/40"
                    />
                    <input
                      type="text"
                      value={nameDraft.name}
                      onChange={(e) => setNameDraft((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="Имя"
                      className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-white outline-none placeholder:text-purple-100/40"
                    />
                    <input
                      type="text"
                      value={nameDraft.patronymic}
                      onChange={(e) => setNameDraft((prev) => ({ ...prev, patronymic: e.target.value }))}
                      placeholder="Отчество (опционально)"
                      className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-white outline-none placeholder:text-purple-100/40"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleSaveName}
                        disabled={savingName}
                        className="rounded-lg bg-purple-600 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-purple-500 disabled:opacity-60"
                      >
                        {savingName ? 'Сохранение...' : 'Сохранить'}
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelNameEdit}
                        disabled={savingName}
                        className="rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-xs font-semibold text-purple-200 transition-colors hover:bg-white/10 disabled:opacity-60"
                      >
                        Отмена
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-purple-200 mb-1">Никнейм</label>
                <input
                  type="text"
                  value={profile.username || ''}
                  readOnly
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-white outline-none placeholder:text-purple-100/40 sm:w-80"
                />
              </div>
            </div>
          </div>
        </div>

        <nav className="mt-10 space-y-4">
          <button
            type="button"
            onClick={() => navigate('/app/change-password')}
            className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-purple-200 transition-colors hover:bg-white/10"
          >
            <KeyRound className="h-4 w-4 text-purple-300" />
            Сменить пароль
          </button>
        </nav>
      </div>
    </section>
  );
};

export default Profile;
