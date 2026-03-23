'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCompleteExecution } from '@/app/client/hooks/use-task-executions';
import type { TaskExecutionResponse } from '@/app/api/task-executions/types';

interface TaskExecutionCardProps {
  execution: TaskExecutionResponse;
}

export function TaskExecutionCard({ execution }: TaskExecutionCardProps) {
  const completeExecution = useCompleteExecution();

  const handleComplete = () => {
    completeExecution.mutate({
      executionId: execution.id,
    });
  };

  const isCompleted = execution.status === 'COMPLETED';

  return (
    <Card className="mb-3">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-foreground">{execution.taskTitle}</h3>
            {execution.assigneeName && (
              <p className="text-sm text-muted-foreground mt-1">
                Assigned to: {execution.assigneeName}
              </p>
            )}
            {execution.isOverdue && !isCompleted && (
              <p className="text-sm text-destructive mt-1">Overdue</p>
            )}
            {isCompleted && execution.completedByName && (
              <p className="text-sm text-success mt-1">
                Completed by {execution.completedByName}
              </p>
            )}
          </div>
          {!isCompleted && (
            <Button
              onClick={handleComplete}
              disabled={completeExecution.isPending}
              size="sm"
              className="ml-4"
            >
              {completeExecution.isPending ? 'Completing...' : 'Complete'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
