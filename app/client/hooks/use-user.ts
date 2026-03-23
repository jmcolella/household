'use client';

import { useQuery } from '@tanstack/react-query';
import type { UserResponse } from '@/app/api/auth/types';
import type { ApiResponse } from '@/app/api/types';

export function useGetUser() {
  return useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const res = await fetch('/api/auth/user');
      const data: ApiResponse<UserResponse | null> = await res.json();
      if (data.error) throw new Error(data.error);
      return data.data;
    },
  });
}
