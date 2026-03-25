'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useTaskById, useUpdateTask } from '@/app/client/hooks/use-tasks';
import { LoadingSpinner } from '@/components/loading-spinner';
import { ErrorMessage } from '@/components/error-message';
import { BottomNav } from '@/components/bottom-nav';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

const editTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().max(1000, 'Description too long').optional(),
});

type EditTaskFormValues = z.infer<typeof editTaskSchema>;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditTaskPage({ params }: PageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const taskId = parseInt(resolvedParams.id);

  const { data: task, isLoading, error } = useTaskById(taskId);
  const updateTask = useUpdateTask();

  const form = useForm<EditTaskFormValues>({
    resolver: zodResolver(editTaskSchema),
    values: task
      ? {
          title: task.title,
          description: task.description || '',
        }
      : undefined,
  });

  const onSubmit = async (values: EditTaskFormValues) => {
    try {
      await updateTask.mutateAsync({
        taskId,
        data: {
          title: values.title,
          description: values.description || undefined,
        },
      });

      toast.success('Task updated', {
        description: 'Your changes have been saved',
      });

      router.push(`/tasks/${taskId}`);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to update task';
      toast.error('Error', { description: message });
    }
  };

  if (isNaN(taskId)) {
    return (
      <div className="min-h-screen p-4 pb-20">
        <ErrorMessage message="Invalid task ID" />
        <BottomNav />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <LoadingSpinner />
        <BottomNav />
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="min-h-screen p-4 pb-20">
        <ErrorMessage message={error?.message || 'Task not found'} />
        <BottomNav />
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen pb-20">
        <div className="p-4">
          {/* Header */}
          <div className="flex items-center gap-2 mb-6">
            <Link href={`/tasks/${taskId}`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">Edit Task</h1>
          </div>

          {/* Form */}
          <Card>
            <CardHeader>
              <CardTitle>Task Details</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter task title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description (optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter task description"
                            rows={4}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-2 justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push(`/tasks/${taskId}`)}
                      disabled={updateTask.isPending}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={updateTask.isPending}>
                      {updateTask.isPending ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Warning about recurring tasks */}
          {task.hasReminder && (
            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-md">
              <p className="text-sm text-amber-800">
                <strong>Note:</strong> This is a recurring task. Editing the
                title or description will not affect the schedule or existing
                executions.
              </p>
            </div>
          )}
        </div>
        <BottomNav />
      </div>
    </>
  );
}
