'use client';

import { useTaskExecutions } from '@/app/client/hooks/use-task-executions';
import { TaskExecutionCard } from '@/components/task-execution-card';
import { LoadingSpinner } from '@/components/loading-spinner';
import { ErrorMessage } from '@/components/error-message';
import { EmptyState } from '@/components/empty-state';
import { BottomNav } from '@/components/bottom-nav';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function DashboardPage() {
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  const {
    data: todayTasks,
    isLoading: loadingToday,
    error: todayError,
  } = useTaskExecutions({
    status: 'OPEN',
    startDate: today,
    endDate: today,
  });

  const {
    data: overdueTasks,
    isLoading: loadingOverdue,
    error: overdueError,
  } = useTaskExecutions({
    status: 'OPEN',
    endDate: yesterday,
  });

  if (loadingToday || loadingOverdue) {
    return (
      <div className="min-h-screen">
        <LoadingSpinner />
        <BottomNav />
      </div>
    );
  }

  if (todayError || overdueError) {
    return (
      <div className="min-h-screen p-4 pb-20">
        <ErrorMessage
          message={
            (todayError as Error)?.message ||
            (overdueError as Error)?.message ||
            'Failed to load tasks'
          }
        />
        <BottomNav />
      </div>
    );
  }

  const hasNoTasks = !todayTasks?.length && !overdueTasks?.length;

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
            title="No tasks yet"
            description="Create your first task to get started"
            action={
              <Link href="/tasks/new">
                <Button>Create Task</Button>
              </Link>
            }
          />
        ) : (
          <>
            {overdueTasks && overdueTasks.length > 0 && (
              <section className="mb-6">
                <h2 className="text-xl font-semibold text-destructive mb-3">
                  Overdue ({overdueTasks.length})
                </h2>
                {overdueTasks.map((task) => (
                  <TaskExecutionCard key={task.id} execution={task} />
                ))}
              </section>
            )}

            <section>
              <h2 className="text-xl font-semibold mb-3">
                Today ({todayTasks?.length || 0})
              </h2>
              {todayTasks && todayTasks.length > 0 ? (
                todayTasks.map((task) => (
                  <TaskExecutionCard key={task.id} execution={task} />
                ))
              ) : (
                <EmptyState
                  title="No tasks for today"
                  description="You're all caught up!"
                />
              )}
            </section>
          </>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
