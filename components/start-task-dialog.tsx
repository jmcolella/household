'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useCreateExecution } from '@/app/client/hooks/use-task-executions';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const startTaskSchema = z.object({
  expectedDate: z.string().min(1, 'Date is required'),
  expectedTime: z.string().min(1, 'Time is required'),
});

type StartTaskFormValues = z.infer<typeof startTaskSchema>;

interface StartTaskDialogProps {
  taskId: number;
  taskTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StartTaskDialog({
  taskId,
  taskTitle,
  open,
  onOpenChange,
}: StartTaskDialogProps) {
  const router = useRouter();
  const createExecution = useCreateExecution();

  const form = useForm<StartTaskFormValues>({
    resolver: zodResolver(startTaskSchema),
    defaultValues: {
      expectedDate: '',
      expectedTime: '09:00',
    },
  });

  const onSubmit = async (values: StartTaskFormValues) => {
    try {
      // Combine date and time into ISO string
      const expectedCompletedAt = new Date(
        `${values.expectedDate}T${values.expectedTime}`
      ).toISOString();

      await createExecution.mutateAsync({
        taskId,
        expectedCompletedAt,
      });

      toast.success('Task started', {
        description: `${taskTitle} has been added to your task list`,
      });

      form.reset();
      onOpenChange(false);
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to start task';
      toast.error('Error', { description: message });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Start Task</DialogTitle>
          <DialogDescription>
            When do you want to complete &quot;{taskTitle}&quot;?
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="expectedDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expected Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="expectedTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expected Time</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={createExecution.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createExecution.isPending}>
                {createExecution.isPending ? 'Starting...' : 'Start Task'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
