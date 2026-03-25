'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { TaskExecutionResponse, CreateExecutionRequest } from '@/app/api/task-executions/types';
import type { ApiResponse } from '@/app/api/types';
import type { TaskExecutionStatus } from '@/app/types/enums';

interface UseTaskExecutionsOptions {
  status?: TaskExecutionStatus;
  startDate?: string;
  endDate?: string;
  taskId?: number;
}

export function useTaskExecutions(options?: UseTaskExecutionsOptions) {
  const params = new URLSearchParams();
  if (options?.status) params.append('status', options.status);
  if (options?.startDate) params.append('startDate', options.startDate);
  if (options?.endDate) params.append('endDate', options.endDate);
  if (options?.taskId) params.append('taskId', options.taskId.toString());

  return useQuery({
    queryKey: ['task-executions', options],
    queryFn: async () => {
      const url = `/api/task-executions${params.toString() ? `?${params.toString()}` : ''}`;
      const res = await fetch(url);
      const data: ApiResponse<TaskExecutionResponse[]> = await res.json();
      if (data.error) throw new Error(data.error);
      return data.data!;
    },
  });
}

interface CompleteExecutionOptions {
  executionId: number;
  completionNotes?: string;
}

export function useCompleteExecution() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ executionId, completionNotes }: CompleteExecutionOptions) => {
      const res = await fetch(`/api/task-executions/${executionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'complete', completionNotes }),
      });
      const data: ApiResponse<TaskExecutionResponse> = await res.json();
      if (data.error) throw new Error(data.error);
      return data.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-executions'] });
    },
  });
}

interface AssignExecutionOptions {
  executionId: number;
  assigneeId: number;
}

export function useAssignExecution() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ executionId, assigneeId }: AssignExecutionOptions) => {
      const res = await fetch(`/api/task-executions/${executionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'assign', assigneeId }),
      });
      const data: ApiResponse<TaskExecutionResponse> = await res.json();
      if (data.error) throw new Error(data.error);
      return data.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-executions'] });
    },
  });
}

interface CancelExecutionOptions {
  executionId: number;
  reason?: string;
}

export function useCancelExecution() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ executionId, reason }: CancelExecutionOptions) => {
      const res = await fetch(`/api/task-executions/${executionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel', reason }),
      });
      const data: ApiResponse<TaskExecutionResponse> = await res.json();
      if (data.error) throw new Error(data.error);
      return data.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-executions'] });
    },
  });
}

export function useCreateExecution() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateExecutionRequest) => {
      const res = await fetch('/api/task-executions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result: ApiResponse<TaskExecutionResponse> = await res.json();
      if (result.error) throw new Error(result.error);
      return result.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-executions'] });
    },
  });
}
