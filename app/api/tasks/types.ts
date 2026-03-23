// API request types
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

// API response types
export interface TaskResponse {
  id: number;
  householdId: number;
  title: string;
  description: string | null;
  createdBy: number;
  createdByName: string;
  createdAt: string;  // ISO string for JSON serialization
  updatedAt: string;  // ISO string
  hasReminder: boolean;
  nextTriggerAt: string | null;  // ISO string
}
