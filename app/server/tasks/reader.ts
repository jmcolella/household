import { db } from '@/lib/db';
import { tasks, reminders, users, reminderSchedules } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import type { TaskDto } from './types';

export class TaskReader {
  static async getTasksByHousehold(householdId: number): Promise<TaskDto[]> {
    const results = await db
      .select({
        task: tasks,
        reminder: reminders,
        creator: users,
        reminderSchedule: reminderSchedules,
      })
      .from(tasks)
      .leftJoin(reminders, eq(tasks.id, reminders.taskId))
      .leftJoin(reminderSchedules, eq(reminders.id, reminderSchedules.reminderId))
      .leftJoin(users, eq(tasks.createdBy, users.id))
      .where(eq(tasks.householdId, householdId));

    return results.map((row) => ({
      id: row.task.id,
      householdId: row.task.householdId,
      title: row.task.title,
      description: row.task.description,
      createdBy: row.task.createdBy,
      createdByName: row.creator?.username || 'Unknown',
      createdAt: row.task.createdAt,
      updatedAt: row.task.updatedAt,
      hasReminder: !!row.reminder,
      nextTriggerAt: row.reminder?.nextTriggerAt || null,
      cronSchedule: row.reminderSchedule?.schedule || null,
    }));
  }

  static async getTaskById(id: number): Promise<TaskDto | null> {
    const results = await db
      .select({
        task: tasks,
        reminder: reminders,
        creator: users,
        reminderSchedule: reminderSchedules,
      })
      .from(tasks)
      .leftJoin(reminders, eq(tasks.id, reminders.taskId))
      .leftJoin(reminderSchedules, eq(reminders.id, reminderSchedules.reminderId))
      .leftJoin(users, eq(tasks.createdBy, users.id))
      .where(eq(tasks.id, id))
      .limit(1);

    if (results.length === 0) {
      return null;
    }

    const row = results[0];
    return {
      id: row.task.id,
      householdId: row.task.householdId,
      title: row.task.title,
      description: row.task.description,
      createdBy: row.task.createdBy,
      createdByName: row.creator?.username || 'Unknown',
      createdAt: row.task.createdAt,
      updatedAt: row.task.updatedAt,
      hasReminder: !!row.reminder,
      nextTriggerAt: row.reminder?.nextTriggerAt || null,
      cronSchedule: row.reminderSchedule?.schedule || null,
    };
  }

  static async getTasksByHouseholdAndUser(
    householdId: number,
    userId: number
  ): Promise<TaskDto[]> {
    const results = await db
      .select({
        task: tasks,
        reminder: reminders,
        creator: users,
        reminderSchedule: reminderSchedules,
      })
      .from(tasks)
      .leftJoin(reminders, eq(tasks.id, reminders.taskId))
      .leftJoin(reminderSchedules, eq(reminders.id, reminderSchedules.reminderId))
      .leftJoin(users, eq(tasks.createdBy, users.id))
      .where(eq(tasks.householdId, householdId));

    return results.map((row) => ({
      id: row.task.id,
      householdId: row.task.householdId,
      title: row.task.title,
      description: row.task.description,
      createdBy: row.task.createdBy,
      createdByName: row.creator?.username || 'Unknown',
      createdAt: row.task.createdAt,
      updatedAt: row.task.updatedAt,
      hasReminder: !!row.reminder,
      nextTriggerAt: row.reminder?.nextTriggerAt || null,
      cronSchedule: row.reminderSchedule?.schedule || null,
    }));
  }
}
