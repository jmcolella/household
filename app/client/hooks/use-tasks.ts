'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { TaskResponse, CreateTaskRequest, UpdateTaskRequest } from '@/app/api/tasks/types';
import type { ApiResponse } from '@/app/api/types';

export function useTasks() {
  return useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const res = await fetch('/api/tasks');
      const data: ApiResponse<TaskResponse[]> = await res.json();
      if (data.error) throw new Error(data.error);
      return data.data!;
    },
  });
}

export function useTaskById(taskId: number) {
  return useQuery({
    queryKey: ['tasks', taskId],
    queryFn: async () => {
      const res = await fetch(`/api/tasks/${taskId}`);
      const data: ApiResponse<TaskResponse> = await res.json();
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
      const data: ApiResponse<TaskResponse> = await res.json();
      if (data.error) throw new Error(data.error);
      return data.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task-executions'] });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { taskId: number; data: UpdateTaskRequest }) => {
      const res = await fetch(`/api/tasks/${params.taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params.data),
      });

      const result: ApiResponse<TaskResponse> = await res.json();
      if (result.error) throw new Error(result.error);
      return result.data!;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['tasks', variables.taskId] });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskId: number) => {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      });
      const data: ApiResponse<void> = await res.json();
      if (data.error) throw new Error(data.error);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task-executions'] });
    },
  });
}
