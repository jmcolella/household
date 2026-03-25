'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CompleteExecutionDialog } from '@/components/complete-execution-dialog';
import { CancelExecutionDialog } from '@/components/cancel-execution-dialog';
import type { TaskExecutionResponse } from '@/app/api/task-executions/types';

interface TaskExecutionCardProps {
  execution: TaskExecutionResponse;
}

export function TaskExecutionCard({ execution }: TaskExecutionCardProps) {
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const isOpen = execution.status === 'OPEN';

  return (
    <>
      <Card className="mb-3">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <Link href={`/tasks/${execution.taskId}`}>
                <h3 className="font-semibold text-foreground hover:text-primary hover:underline cursor-pointer">
                  {execution.taskTitle}
                </h3>
              </Link>
              {execution.assigneeName && (
                <p className="text-sm text-muted-foreground mt-1">
                  Assigned to: {execution.assigneeName}
                </p>
              )}
              {execution.isOverdue && isOpen && (
                <p className="text-sm text-destructive mt-1">Overdue</p>
              )}
              {execution.status === 'COMPLETED' && execution.completedByName && (
                <p className="text-sm text-success mt-1">
                  Completed by {execution.completedByName}
                </p>
              )}
              {execution.status === 'CANCELLED' && (
                <p className="text-sm text-muted-foreground mt-1">Cancelled</p>
              )}
            </div>
            {isOpen && (
              <div className="flex gap-2 ml-4">
                <Button onClick={() => setCompleteDialogOpen(true)} size="sm">
                  Complete
                </Button>
                <Button
                  onClick={() => setCancelDialogOpen(true)}
                  size="sm"
                  variant="outline"
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <CompleteExecutionDialog
        executionId={execution.id}
        taskTitle={execution.taskTitle}
        open={completeDialogOpen}
        onOpenChange={setCompleteDialogOpen}
      />

      <CancelExecutionDialog
        executionId={execution.id}
        taskTitle={execution.taskTitle}
        open={cancelDialogOpen}
        onOpenChange={setCancelDialogOpen}
      />
    </>
  );
}
