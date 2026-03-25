import { db } from '@/lib/db';
import { tasks, taskExecutions, reminders, reminderSchedules, users } from '@/lib/db/schema';
import { TaskExecutionStatus, ReminderStatus } from '@/app/types/enums';
import { eq } from 'drizzle-orm';
import type { CreateTaskData, UpdateTaskData, TaskDto } from './types';
import { TaskReader } from './reader';

export class TaskWriter {
  static async createTask(
    householdId: number,
    userId: number,
    data: CreateTaskData
  ): Promise<TaskDto> {
    const taskId = await db.transaction(async (tx) => {
      // 1. Insert task
      const [task] = await tx
        .insert(tasks)
        .values({
          householdId,
          title: data.title,
          description: data.description || null,
          createdBy: userId,
        })
        .returning();

      if (data.isRecurring && data.cronSchedule) {
        // 2. Create reminder for recurring task
        const nextTriggerAt = calculateNextTrigger(data.cronSchedule);

        const [reminder] = await tx
          .insert(reminders)
          .values({
            taskId: task.id,
            status: ReminderStatus.ACTIVE,
            nextTriggerAt,
          })
          .returning();

        // 3. Create schedule
        await tx.insert(reminderSchedules).values({
          reminderId: reminder.id,
          creationOrderId: 1,
          schedule: data.cronSchedule,
          createdBy: userId,
        });
      } else if (data.expectedCompletedAt) {
        // One-time task: create execution
        await tx.insert(taskExecutions).values({
          taskId: task.id,
          status: TaskExecutionStatus.OPEN,
          expectedCompletedAt: new Date(data.expectedCompletedAt),
          assignee: data.assignee || null,
        });
      }

      return task.id;
    });

    // Fetch complete task with all joined data
    const taskDto = await TaskReader.getTaskById(taskId);
    if (!taskDto) {
      throw new Error('Failed to fetch created task');
    }

    return taskDto;
  }

  static async updateTask(
    taskId: number,
    data: UpdateTaskData
  ): Promise<TaskDto> {
    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (data.title !== undefined) {
      updateData.title = data.title;
    }
    if (data.description !== undefined) {
      updateData.description = data.description;
    }

    await db
      .update(tasks)
      .set(updateData)
      .where(eq(tasks.id, taskId));

    const taskDto = await TaskReader.getTaskById(taskId);
    if (!taskDto) {
      throw new Error('Task not found');
    }

    return taskDto;
  }

  static async deleteTask(taskId: number): Promise<void> {
    await db.delete(tasks).where(eq(tasks.id, taskId));
  }
}

// Helper function to calculate next trigger time from cron schedule
// This is a simplified version - in production, use a library like 'cron-parser'
function calculateNextTrigger(cronSchedule: string): Date {
  // For now, just return a date 1 day in the future
  // TODO: Implement proper cron parsing
  const now = new Date();
  now.setDate(now.getDate() + 1);
  now.setHours(9, 0, 0, 0);
  return now;
}
