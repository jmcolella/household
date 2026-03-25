'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTaskById } from '@/app/client/hooks/use-tasks';
import { useTaskExecutions } from '@/app/client/hooks/use-task-executions';
import { calculateTaskStats } from '@/lib/utils/task-stats';
import { parseCronExpression, getCronDescription } from '@/lib/utils/cron-generator';
import { LoadingSpinner } from '@/components/loading-spinner';
import { ErrorMessage } from '@/components/error-message';
import { BottomNav } from '@/components/bottom-nav';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DeleteTaskDialog } from '@/components/delete-task-dialog';
import { StartTaskDialog } from '@/components/start-task-dialog';
import { ArrowLeft, Edit, Trash2, Calendar, TrendingUp, Play } from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function TaskDetailsPage({ params }: PageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const taskId = parseInt(resolvedParams.id);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [startTaskDialogOpen, setStartTaskDialogOpen] = useState(false);

  const { data: task, isLoading: taskLoading, error: taskError } = useTaskById(taskId);
  const { data: executions, isLoading: executionsLoading } = useTaskExecutions({ taskId });

  if (isNaN(taskId)) {
    return (
      <div className="min-h-screen p-4 pb-20">
        <ErrorMessage message="Invalid task ID" />
        <BottomNav />
      </div>
    );
  }

  if (taskLoading || executionsLoading) {
    return (
      <div className="min-h-screen">
        <LoadingSpinner />
        <BottomNav />
      </div>
    );
  }

  if (taskError || !task) {
    return (
      <div className="min-h-screen p-4 pb-20">
        <ErrorMessage message={taskError?.message || 'Task not found'} />
        <BottomNav />
      </div>
    );
  }

  const stats = executions ? calculateTaskStats(executions) : null;
  const isRecurring = task.hasReminder;

  const handleDeleteSuccess = () => {
    router.push('/tasks');
    router.refresh();
  };

  return (
    <>
      <div className="min-h-screen pb-20">
        <div className="p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Link href="/tasks">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <h1 className="text-2xl font-bold">Task Details</h1>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setStartTaskDialogOpen(true)}
              >
                <Play className="h-4 w-4 mr-1" />
                Start Task
              </Button>
              <Link href={`/tasks/${taskId}/edit`}>
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              </Link>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            </div>
          </div>

          {/* Task Info Card */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{task.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {task.description && (
                <div>
                  <p className="text-sm font-semibold text-muted-foreground">Description</p>
                  <p className="text-sm">{task.description}</p>
                </div>
              )}
              <div>
                <p className="text-sm font-semibold text-muted-foreground">Created By</p>
                <p className="text-sm">{task.createdByName}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-muted-foreground">Created</p>
                <p className="text-sm">
                  {new Date(task.createdAt).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Recurring Info Card (if applicable) */}
          {isRecurring && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Recurring Schedule
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {task.cronSchedule && (
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground">Schedule</p>
                    <p className="text-sm">
                      {(() => {
                        const parsed = parseCronExpression(task.cronSchedule);
                        return parsed ? getCronDescription(parsed) : task.cronSchedule;
                      })()}
                    </p>
                  </div>
                )}
                {task.nextTriggerAt && (
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground">
                      Next Execution
                    </p>
                    <p className="text-sm">
                      {new Date(task.nextTriggerAt).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Statistics Card */}
          {stats && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-2xl font-bold">{stats.totalExecutions}</p>
                    <p className="text-sm text-muted-foreground">Total Executions</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.completionRate}%</p>
                    <p className="text-sm text-muted-foreground">Completion Rate</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.completedCount}</p>
                    <p className="text-sm text-muted-foreground">Completed</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.openCount}</p>
                    <p className="text-sm text-muted-foreground">Open</p>
                  </div>
                </div>
                {stats.averageCompletionTimeHours !== null && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-muted-foreground">Avg. Completion Time</p>
                    <p className="text-lg font-semibold">
                      {stats.averageCompletionTimeHours >= 0
                        ? `${Math.abs(stats.averageCompletionTimeHours).toFixed(1)} hours late`
                        : `${Math.abs(stats.averageCompletionTimeHours).toFixed(1)} hours early`}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
        <BottomNav />
      </div>

      <DeleteTaskDialog
        taskId={taskId}
        taskTitle={task.title}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onDeleted={handleDeleteSuccess}
      />

      <StartTaskDialog
        taskId={taskId}
        taskTitle={task.title}
        open={startTaskDialogOpen}
        onOpenChange={setStartTaskDialogOpen}
      />
    </>
  );
}
