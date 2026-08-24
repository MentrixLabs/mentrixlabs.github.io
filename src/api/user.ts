// src/api/user.ts
import client from './client';
import type { UserStatusResponse } from './types';

/**
 * Получить статус текущего пользователя (план, использование, лимиты)
 */
export const getUserStatus = async (): Promise<UserStatusResponse> => {
  const response = await client.get<UserStatusResponse>('/user/status');
  return response.data;
};