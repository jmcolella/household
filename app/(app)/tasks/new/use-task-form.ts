import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Basic cron validation helper
const isCronValid = (cron: string): boolean => {
  const parts = cron.trim().split(/\s+/);
  return parts.length === 5;
};

export const taskSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters'),
  description: z
    .string()
    .max(1000, 'Description must be less than 1000 characters')
    .optional(),
  isRecurring: z.boolean(),
  cronSchedule: z.string().optional(),
  expectedDate: z.string().optional(),
}).refine(
  (data) => {
    // If recurring, cronSchedule is required and valid
    if (data.isRecurring) {
      return data.cronSchedule && isCronValid(data.cronSchedule);
    }
    return true;
  },
  {
    message: 'Invalid cron schedule format. Expected: "minute hour day month weekday"',
    path: ['cronSchedule'],
  }
).refine(
  (data) => {
    // If not recurring, expectedDate is required
    if (!data.isRecurring) {
      return !!data.expectedDate;
    }
    return true;
  },
  {
    message: 'Due date is required for one-time tasks',
    path: ['expectedDate'],
  }
);

export type TaskFormData = z.infer<typeof taskSchema>;

export function useTaskForm() {
  return useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      description: '',
      isRecurring: false,
      cronSchedule: '0 9 * * *',
      expectedDate: '',
    },
  });
}
