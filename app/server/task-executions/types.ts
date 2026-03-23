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

export interface ExecutionFilters {
  householdId: number;
  status?: TaskExecutionStatus;
  startDate?: string;
  endDate?: string;
}

export interface CompleteExecutionData {
  completionNotes?: string;
}

export interface AssignExecutionData {
  assigneeId: number;
}

export interface CancelExecutionData {
  reason: string;
}
