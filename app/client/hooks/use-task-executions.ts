'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { TaskExecutionDto } from '@/app/api/task-executions/types';
import type { ApiResponse } from '@/app/api/types';
import type { TaskExecutionStatus } from '@/app/types/enums';

interface UseTaskExecutionsOptions {
  status?: TaskExecutionStatus;
  startDate?: string;
  endDate?: string;
}

export function useTaskExecutions(options?: UseTaskExecutionsOptions) {
  const params = new URLSearchParams();
  if (options?.status) params.append('status', options.status);
  if (options?.startDate) params.append('startDate', options.startDate);
  if (options?.endDate) params.append('endDate', options.endDate);

  return useQuery({
    queryKey: ['task-executions', options],
    queryFn: async () => {
      const url = `/api/task-executions${params.toString() ? `?${params.toString()}` : ''}`;
      const res = await fetch(url);
      const data: ApiResponse<TaskExecutionDto[]> = await res.json();
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
      const data: ApiResponse<TaskExecutionDto> = await res.json();
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
      const data: ApiResponse<TaskExecutionDto> = await res.json();
      if (data.error) throw new Error(data.error);
      return data.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-executions'] });
    },
  });
}
