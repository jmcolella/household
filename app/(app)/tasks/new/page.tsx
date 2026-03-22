'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateTask } from '@/app/client/hooks/use-tasks';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ErrorMessage } from '@/components/error-message';
import { BottomNav } from '@/components/bottom-nav';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewTaskPage() {
  const router = useRouter();
  const createTask = useCreateTask();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [cronSchedule, setCronSchedule] = useState('0 9 * * *'); // Default: 9 AM daily
  const [expectedDate, setExpectedDate] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createTask.mutateAsync({
        title,
        description: description || undefined,
        isRecurring,
        cronSchedule: isRecurring ? cronSchedule : undefined,
        expectedCompletedAt: !isRecurring ? expectedDate : undefined,
      });

      router.push('/tasks');
      router.refresh();
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  return (
    <div className="min-h-screen pb-20">
      <div className="p-4">
        <div className="flex items-center mb-6">
          <Link href="/tasks">
            <Button variant="ghost" size="sm" className="mr-2">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">New Task</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Create a New Task</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {createTask.error && (
                <ErrorMessage message={(createTask.error as Error).message} />
              )}

              <div>
                <label htmlFor="title" className="block text-sm font-medium mb-1">
                  Title
                </label>
                <input
                  id="title"
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Take out the trash"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium mb-1">
                  Description (optional)
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={3}
                  placeholder="Additional details..."
                />
              </div>

              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={isRecurring}
                    onChange={(e) => setIsRecurring(e.target.checked)}
                    className="rounded border-input"
                  />
                  <span className="text-sm font-medium">Recurring task</span>
                </label>
              </div>

              {isRecurring ? (
                <div>
                  <label htmlFor="schedule" className="block text-sm font-medium mb-1">
                    Schedule (cron format)
                  </label>
                  <input
                    id="schedule"
                    type="text"
                    required
                    value={cronSchedule}
                    onChange={(e) => setCronSchedule(e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="0 9 * * *"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Example: &quot;0 9 * * *&quot; = Daily at 9 AM
                  </p>
                </div>
              ) : (
                <div>
                  <label htmlFor="expectedDate" className="block text-sm font-medium mb-1">
                    Due Date
                  </label>
                  <input
                    id="expectedDate"
                    type="datetime-local"
                    required
                    value={expectedDate}
                    onChange={(e) => setExpectedDate(e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              )}

              <Button
                type="submit"
                disabled={createTask.isPending}
                className="w-full"
              >
                {createTask.isPending ? 'Creating...' : 'Create Task'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
      <BottomNav />
    </div>
  );
}
