'use client';

import { useRouter } from 'next/navigation';
import { useCreateTask } from '@/app/client/hooks/use-tasks';
import { useTaskForm, type TaskFormData } from '@/app/(app)/tasks/new/use-task-form';
import { generateCronExpression, getCronDescription } from '@/lib/utils/cron-generator';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BottomNav } from '@/components/bottom-nav';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewTaskPage() {
  const router = useRouter();
  const createTask = useCreateTask();
  const form = useTaskForm();

  const isRecurring = form.watch('isRecurring');
  const frequency = form.watch('frequency');
  const time = form.watch('time');
  const dayOfWeek = form.watch('dayOfWeek');
  const dayOfMonth = form.watch('dayOfMonth');

  const onSubmit = async (data: TaskFormData) => {
    try {
      let cronSchedule: string | undefined;

      if (data.isRecurring && data.frequency && data.time) {
        cronSchedule = generateCronExpression({
          frequency: data.frequency,
          time: data.time,
          dayOfWeek: data.dayOfWeek,
          dayOfMonth: data.dayOfMonth,
        });
      }

      await createTask.mutateAsync({
        title: data.title,
        description: data.description || undefined,
        isRecurring: data.isRecurring,
        cronSchedule,
        expectedCompletedAt: !data.isRecurring ? data.expectedDate : undefined,
      });

      router.push('/tasks');
      router.refresh();
    } catch {
      if (createTask.error) {
        form.setError('root', {
          type: 'manual',
          message: createTask.error.message,
        });
      }
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
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {form.formState.errors.root && (
                  <div className="rounded-md bg-error/10 border border-error p-3">
                    <p className="text-sm text-error">{form.formState.errors.root.message}</p>
                  </div>
                )}

                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input type="text" placeholder="Take out the trash" {...field} />
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
                          placeholder="Additional details..."
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isRecurring"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="!mt-0">Recurring task</FormLabel>
                    </FormItem>
                  )}
                />

                {isRecurring ? (
                  <>
                    <FormField
                      control={form.control}
                      name="frequency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Frequency</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select frequency" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="DAILY">Daily</SelectItem>
                              <SelectItem value="WEEKLY">Weekly</SelectItem>
                              <SelectItem value="MONTHLY">Monthly</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="time"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Time</FormLabel>
                          <FormControl>
                            <Input type="time" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {frequency === 'WEEKLY' && (
                      <FormField
                        control={form.control}
                        name="dayOfWeek"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Day of Week</FormLabel>
                            <Select
                              onValueChange={(value) => field.onChange(parseInt(value))}
                              value={field.value?.toString()}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select day" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="0">Sunday</SelectItem>
                                <SelectItem value="1">Monday</SelectItem>
                                <SelectItem value="2">Tuesday</SelectItem>
                                <SelectItem value="3">Wednesday</SelectItem>
                                <SelectItem value="4">Thursday</SelectItem>
                                <SelectItem value="5">Friday</SelectItem>
                                <SelectItem value="6">Saturday</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    {frequency === 'MONTHLY' && (
                      <FormField
                        control={form.control}
                        name="dayOfMonth"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Day of Month</FormLabel>
                            <Select
                              onValueChange={(value) => field.onChange(parseInt(value))}
                              value={field.value?.toString()}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select day" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {Array.from({ length: 31 }, (_, i) => (
                                  <SelectItem key={i + 1} value={(i + 1).toString()}>
                                    {i + 1}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    {frequency && time && (
                      <div className="rounded-md bg-muted p-3">
                        <p className="text-sm text-muted-foreground">
                          {getCronDescription({
                            frequency,
                            time,
                            dayOfWeek,
                            dayOfMonth,
                          })}
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <FormField
                    control={form.control}
                    name="expectedDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Due Date</FormLabel>
                        <FormControl>
                          <Input type="datetime-local" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <Button
                  type="submit"
                  disabled={form.formState.isSubmitting || createTask.isPending}
                  className="w-full"
                >
                  {form.formState.isSubmitting || createTask.isPending ? 'Creating...' : 'Create Task'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
      <BottomNav />
    </div>
  );
}
