import type { TaskExecutionResponse } from '@/app/api/task-executions/types';

export interface TaskStats {
  totalExecutions: number;
  completedCount: number;
  openCount: number;
  cancelledCount: number;
  completionRate: number; // 0-100
  averageCompletionTimeHours: number | null;
}

export function calculateTaskStats(executions: TaskExecutionResponse[]): TaskStats {
  const completed = executions.filter((e) => e.status === 'COMPLETED');
  const open = executions.filter((e) => e.status === 'OPEN');
  const cancelled = executions.filter((e) => e.status === 'CANCELLED');

  const total = executions.length;
  const completedCount = completed.length;
  const completionRate = total > 0 ? (completedCount / total) * 100 : 0;

  // Calculate average time between expected and actual completion (for completed tasks)
  let averageCompletionTimeHours: number | null = null;

  if (completed.length > 0) {
    const timeDifferences = completed
      .filter((e) => e.completedAt)
      .map((e) => {
        const expected = new Date(e.expectedCompletedAt);
        const actual = new Date(e.completedAt!);
        return (actual.getTime() - expected.getTime()) / (1000 * 60 * 60); // hours
      });

    if (timeDifferences.length > 0) {
      const sum = timeDifferences.reduce((a, b) => a + b, 0);
      averageCompletionTimeHours = sum / timeDifferences.length;
    }
  }

  return {
    totalExecutions: total,
    completedCount,
    openCount: open.length,
    cancelledCount: cancelled.length,
    completionRate: Math.round(completionRate),
    averageCompletionTimeHours,
  };
}
