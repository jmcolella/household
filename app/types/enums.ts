// Task Execution Status
export const TaskExecutionStatus = {
  OPEN: 'OPEN',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const;

export type TaskExecutionStatus = typeof TaskExecutionStatus[keyof typeof TaskExecutionStatus];

// Reminder Status
export const ReminderStatus = {
  ACTIVE: 'ACTIVE',
  PAUSED: 'PAUSED',
  DELETED: 'DELETED',
} as const;

export type ReminderStatus = typeof ReminderStatus[keyof typeof ReminderStatus];

// Validation functions
export function isValidTaskExecutionStatus(value: string): value is TaskExecutionStatus {
  return Object.values(TaskExecutionStatus).includes(value as TaskExecutionStatus);
}

export function isValidReminderStatus(value: string): value is ReminderStatus {
  return Object.values(ReminderStatus).includes(value as ReminderStatus);
}
