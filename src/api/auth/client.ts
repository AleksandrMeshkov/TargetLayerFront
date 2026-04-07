import { requestAuth } from './requestAuth';
import type { AuthTokens, LoginPayload, RegisterPayload } from '../../types/authTypes/authTypes';

export async function loginUser(payload: LoginPayload): Promise<AuthTokens> {
  return requestAuth<AuthTokens, LoginPayload>('/api/v1/auth/login', payload);
}

export async function registerUser(payload: RegisterPayload): Promise<AuthTokens> {
  return requestAuth<AuthTokens, RegisterPayload>('/api/v1/auth/register', payload);
}

export async function logoutUser(): Promise<void> {
  await requestAuth<{ message: string }, undefined>('/api/v1/auth/logout');
}
