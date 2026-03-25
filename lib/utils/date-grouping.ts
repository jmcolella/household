import type { TaskExecutionResponse } from '@/app/api/task-executions/types';

export interface GroupedExecutions {
  overdue: TaskExecutionResponse[];
  today: TaskExecutionResponse[];
  upcoming: TaskExecutionResponse[]; // today+1 to today+7
  later: TaskExecutionResponse[]; // beyond today+7
}

export function groupExecutionsByDate(
  executions: TaskExecutionResponse[]
): GroupedExecutions {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const weekFromNow = new Date(today);
  weekFromNow.setDate(weekFromNow.getDate() + 7);

  const groups: GroupedExecutions = {
    overdue: [],
    today: [],
    upcoming: [],
    later: [],
  };

  executions.forEach((execution) => {
    const expectedDate = new Date(execution.expectedCompletedAt);
    expectedDate.setHours(0, 0, 0, 0);

    if (expectedDate < today) {
      groups.overdue.push(execution);
    } else if (expectedDate.getTime() === today.getTime()) {
      groups.today.push(execution);
    } else if (expectedDate > today && expectedDate <= weekFromNow) {
      groups.upcoming.push(execution);
    } else {
      groups.later.push(execution);
    }
  });

  return groups;
}
