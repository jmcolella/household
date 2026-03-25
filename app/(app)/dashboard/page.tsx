'use client';

import { useTaskExecutions } from '@/app/client/hooks/use-task-executions';
import { groupExecutionsByDate } from '@/lib/utils/date-grouping';
import { ExecutionGroup } from '@/components/execution-group';
import { LoadingSpinner } from '@/components/loading-spinner';
import { ErrorMessage } from '@/components/error-message';
import { EmptyState } from '@/components/empty-state';
import { BottomNav } from '@/components/bottom-nav';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function DashboardPage() {
  const { data: executions, isLoading, error } = useTaskExecutions({
    status: 'OPEN',
  });

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <LoadingSpinner />
        <BottomNav />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-4 pb-20">
        <ErrorMessage message={error.message || 'Failed to load tasks'} />
        <BottomNav />
      </div>
    );
  }

  const hasNoTasks = !executions || executions.length === 0;

  return (
    <div className="min-h-screen pb-20">
      <div className="p-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <Link href="/tasks/new">
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" />
              New Task
            </Button>
          </Link>
        </div>

        {hasNoTasks ? (
          <EmptyState
            title="No open tasks"
            description="You're all caught up! Create a new task to get started."
            action={
              <Link href="/tasks/new">
                <Button>Create Task</Button>
              </Link>
            }
          />
        ) : (
          <>
            {(() => {
              const groups = groupExecutionsByDate(executions);
              return (
                <>
                  <ExecutionGroup
                    title="Overdue"
                    count={groups.overdue.length}
                    executions={groups.overdue}
                    defaultOpen={true}
                    variant="destructive"
                  />
                  <ExecutionGroup
                    title="Today"
                    count={groups.today.length}
                    executions={groups.today}
                    defaultOpen={true}
                  />
                  <ExecutionGroup
                    title="Upcoming (Next 7 Days)"
                    count={groups.upcoming.length}
                    executions={groups.upcoming}
                    defaultOpen={false}
                  />
                  <ExecutionGroup
                    title="Later"
                    count={groups.later.length}
                    executions={groups.later}
                    defaultOpen={false}
                    variant="secondary"
                  />
                </>
              );
            })()}
          </>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
