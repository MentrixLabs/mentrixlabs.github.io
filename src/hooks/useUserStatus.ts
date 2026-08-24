// src/hooks/useUserStatus.ts
import { useState, useEffect } from 'react';
import { getUserStatus } from '@/api/user';
import type { UserStatusResponse } from '@/api/types';

export const useUserStatus = () => {
  const [status, setStatus] = useState<UserStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getUserStatus();
        setStatus(data);
      } catch (err: any) {
        setError(err.message || 'Ошибка загрузки статуса');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return { status, loading, error };
};