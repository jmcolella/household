'use client';

import { useTasks } from '@/app/client/hooks/use-tasks';
import { LoadingSpinner } from '@/components/loading-spinner';
import { ErrorMessage } from '@/components/error-message';
import { EmptyState } from '@/components/empty-state';
import { BottomNav } from '@/components/bottom-nav';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { Plus } from 'lucide-react';

export default function TasksPage() {
  const { data: tasks, isLoading, error } = useTasks();

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
        <ErrorMessage message={(error as Error).message || 'Failed to load tasks'} />
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      <div className="p-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Tasks</h1>
          <Link href="/tasks/new">
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" />
              New Task
            </Button>
          </Link>
        </div>

        {tasks && tasks.length === 0 ? (
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
          <div className="space-y-3">
            {tasks?.map((task) => (
              <Card key={task.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{task.title}</h3>
                      {task.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {task.description}
                        </p>
                      )}
                      {task.hasReminder && (
                        <p className="text-sm text-primary mt-2">
                          Recurring task
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
