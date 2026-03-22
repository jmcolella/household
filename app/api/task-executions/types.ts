import type { TaskExecutionStatus } from '@/app/types/enums';

export interface TaskExecutionDto {
  id: number;
  taskId: number;
  taskTitle: string;
  status: TaskExecutionStatus;
  assignee: number | null;
  assigneeName: string | null;
  completedAt: Date | null;
  completedBy: number | null;
  completedByName: string | null;
  completionNotes: string | null;
  expectedCompletedAt: Date;
  isOverdue: boolean;
  createdAt: Date;
}

export interface CompleteExecutionRequest {
  completionNotes?: string;
}

export interface AssignExecutionRequest {
  assigneeId: number;
}

export interface CancelExecutionRequest {
  reason: string;
}
