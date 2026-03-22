'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { TaskDto, CreateTaskRequest } from '@/app/api/tasks/types';
import type { ApiResponse } from '@/app/api/types';

export function useTasks() {
  return useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const res = await fetch('/api/tasks');
      const data: ApiResponse<TaskDto[]> = await res.json();
      if (data.error) throw new Error(data.error);
      return data.data!;
    },
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: CreateTaskRequest) => {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });
      const data: ApiResponse<TaskDto> = await res.json();
      if (data.error) throw new Error(data.error);
      return data.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task-executions'] });
    },
  });
}
