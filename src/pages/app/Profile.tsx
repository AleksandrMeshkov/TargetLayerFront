import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ProfileActions } from '../../components/profile/ProfileActions';
import { ProfileAvatarCard } from '../../components/profile/ProfileAvatarCard';
import { ProfileMessage } from '../../components/profile/ProfileMessage';
import { ProfileNameCard } from '../../components/profile/ProfileNameCard';
import { ProfileShell } from '../../components/profile/ProfileShell';
import { useProfilePage } from '../../hooks/authHooks/useProfilePage';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const {
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
  } = useProfilePage();

  if (loading) {
    return <ProfileMessage message="Загрузка данных профиля..." />;
  }

  if (error || !profile) {
    return <ProfileMessage message={error || 'Не удалось загрузить данные профиля'} tone="error" />;
  }

  return (
    <ProfileShell title="Профиль">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
        <ProfileAvatarCard
          avatarUrl={avatarUrl}
          initials={initials}
          showPlaceholder={showPlaceholder}
          uploading={uploading}
          fileInputRef={fileInputRef}
          onUploadClick={openFilePicker}
          onFileSelect={handleFileSelect}
          onImageLoad={() => setShowPlaceholder(false)}
          onImageError={() => setShowPlaceholder(true)}
        />

        <ProfileNameCard
          fullName={fullName}
          username={profile.username || ''}
          isEditing={isNameEditing}
          saving={savingName}
          nameDraft={nameDraft}
          onStartEdit={startNameEdit}
          onCancelEdit={cancelNameEdit}
          onSave={saveName}
          onChangeDraft={setNameDraft}
        />
      </div>

      <ProfileActions onChangePassword={() => navigate('/app/change-password')} />
    </ProfileShell>
  );
};

export default Profile;
