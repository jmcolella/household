export interface TaskDto {
  id: number;
  householdId: number;
  title: string;
  description: string | null;
  createdBy: number;
  createdByName: string;
  createdAt: Date;
  updatedAt: Date;
  hasReminder: boolean;
  nextTriggerAt: Date | null;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  isRecurring: boolean;
  cronSchedule?: string;
  expectedCompletedAt?: string;
  assignee?: number;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
}
