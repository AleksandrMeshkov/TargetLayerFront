import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { API_BASE_URL } from '../../api/apiBase/apiBase';
import { getCurrentProfile, updateUserName, updateUserProfile } from '../../api/auth/userClient';
import type { UserProfile } from '../../types/authTypes/authTypes';

function getAvatarUrl(avatarPath: string | null | undefined): string | null {
  if (!avatarPath) {
    return null;
  }

  if (avatarPath.startsWith('http')) {
    return avatarPath;
  }

  const normalizedPath = avatarPath.startsWith('/') ? avatarPath : `/${avatarPath}`;
  return `${API_BASE_URL}${normalizedPath}`;
}

function getInitials(profile: UserProfile | null): string {
  if (!profile) {
    return 'AM';
  }

  const firstNameInitial = profile.name?.[0] || '';
  const surnameInitial = profile.surname?.[0] || '';
  return `${firstNameInitial}${surnameInitial}`.toUpperCase() || 'ИФ';
}

function getFullName(profile: UserProfile | null): string {
  if (!profile) {
    return 'Имя не указано';
  }

  const parts = [profile.surname, profile.name, profile.patronymic].filter(Boolean);
  return parts.join(' ');
}

export function useProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [savingName, setSavingName] = useState(false);
  const [isNameEditing, setIsNameEditing] = useState(false);
  const [nameDraft, setNameDraft] = useState({ name: '', surname: '', patronymic: '' });
  const [error, setError] = useState<string | null>(null);
  const [showPlaceholder, setShowPlaceholder] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getCurrentProfile();
      setProfile(data);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Ошибка загрузки профиля';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  const startNameEdit = useCallback(() => {
    if (!profile) {
      return;
    }

    setNameDraft({
      name: profile.name ?? '',
      surname: profile.surname ?? '',
      patronymic: profile.patronymic ?? '',
    });
    setIsNameEditing(true);
  }, [profile]);

  const cancelNameEdit = useCallback(() => {
    setIsNameEditing(false);
  }, []);

  const saveName = useCallback(async () => {
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

      await loadProfile();
      setIsNameEditing(false);
      toast.success('ФИО успешно обновлено');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Ошибка обновления ФИО';
      toast.error(message);
    } finally {
      setSavingName(false);
    }
  }, [nameDraft, loadProfile]);

  const openFilePicker = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

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
      setShowPlaceholder(false);
      await updateUserProfile(file);
      await loadProfile();
      toast.success('Фото успешно загружено');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Ошибка загрузки фото';
      toast.error(message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [loadProfile]);

  const avatarUrl = getAvatarUrl(profile?.avatar_url);
  const initials = getInitials(profile);
  const fullName = getFullName(profile);

  return {
    profile,
    loading,
    uploading,
    savingName,
    isNameEditing,
    nameDraft,
    setNameDraft,
    error,
    showPlaceholder,
    setShowPlaceholder,
    fileInputRef,
    avatarUrl,
    initials,
    fullName,
    startNameEdit,
    cancelNameEdit,
    saveName,
    openFilePicker,
    handleFileSelect,
    setProfile,
    loadProfile,
  } as const;
}
