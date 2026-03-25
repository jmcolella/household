import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

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
  frequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY']).optional(),
  time: z.string().optional(),
  dayOfWeek: z.number().min(0).max(6).optional(),
  dayOfMonth: z.number().min(1).max(31).optional(),
  expectedDate: z.string().optional(),
}).refine(
  (data) => {
    // If recurring, require frequency and time
    if (data.isRecurring) {
      if (!data.frequency || !data.time) {
        return false;
      }
      // If weekly, require dayOfWeek
      if (data.frequency === 'WEEKLY' && data.dayOfWeek === undefined) {
        return false;
      }
      // If monthly, require dayOfMonth
      if (data.frequency === 'MONTHLY' && data.dayOfMonth === undefined) {
        return false;
      }
      return true;
    }
    return true;
  },
  {
    message: 'Please complete all recurring schedule fields',
    path: ['frequency'],
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
      frequency: 'DAILY',
      time: '09:00',
      dayOfWeek: undefined,
      dayOfMonth: undefined,
      expectedDate: '',
    },
  });
}
