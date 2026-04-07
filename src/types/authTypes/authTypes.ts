export type AuthTokens = {
  access_token: string;
  refresh_token?: string | null;
  token_type: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  username: string;
  name: string;
  surname: string;
  patronymic?: string;
  email: string;
  password: string;
};

export type UpdateNamePayload = {
  name: string;
  surname: string;
  patronymic?: string;
};

export type ChangePasswordPayload = {
  old_password: string;
  new_password: string;
  confirm_password: string;
};

export type ChangePasswordResponse = {
  message: string;
  detail?: string;
};

export type UserProfile = {
  id?: string;
  user_id?: number;
  name: string;
  surname: string;
  patronymic?: string | null;
  email?: string;
  avatar_url?: string | null;
  username?: string;
  created_at?: string;
  updated_at?: string;
};

export type SearchUser = {
  user_id: number;
  username: string;
  name: string;
  surname: string;
  patronymic?: string | null;
  avatar_url?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type UserSearchResponse = {
  users: SearchUser[];
  total: number;
};

export type TeamItem = {
  team_id: number;
  name: string;
  created_at: string;
};

export type MyTeamsResponse = {
  teams: TeamItem[];
  total: number;
};

export type CreateTeamPayload = {
  name: string;
};

export type RenameTeamPayload = {
  name: string;
};

export type ApiStatusResponse = {
  status?: string;
  message?: string;
  detail?: string;
};

export type TeamInviteEmailResponse = {
  status: string;
  email: string;
  team_id: number;
  expires_at: string;
};

export type TeamMemberItem = {
  id: number;
  team_id: number;
  user_id: number;
  team_role_id: number;
  joined_at: string;
};

export type TeamMembersResponse = {
  users: TeamMemberItem[];
  total: number;
};
