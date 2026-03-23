// Domain data model
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

// Service input types
export interface CreateTaskData {
  title: string;
  description?: string;
  isRecurring: boolean;
  cronSchedule?: string;
  expectedCompletedAt?: string;
  assignee?: number;
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
}
