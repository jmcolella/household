import type { TaskExecutionStatus } from '@/app/types/enums';

// API response types
export interface TaskExecutionResponse {
  id: number;
  taskId: number;
  taskTitle: string;
  status: TaskExecutionStatus;
  assignee: number | null;
  assigneeName: string | null;
  completedAt: string | null;  // ISO string
  completedBy: number | null;
  completedByName: string | null;
  completionNotes: string | null;
  cancellationReason: string | null;
  expectedCompletedAt: string;  // ISO string
  isOverdue: boolean;
  createdAt: string;  // ISO string
}

// API request types
export interface CompleteExecutionRequest {
  action: 'complete';
  completionNotes?: string;
}

export interface AssignExecutionRequest {
  action: 'assign';
  assigneeId: number;
}

export interface CancelExecutionRequest {
  action: 'cancel';
  reason?: string;
}

export interface CreateExecutionRequest {
  taskId: number;
  expectedCompletedAt: string; // ISO string
  assignee?: number;
}
