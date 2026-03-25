import { db } from '@/lib/db';
import { taskExecutions, tasks, users } from '@/lib/db/schema';
import { eq, gte, lte, sql } from 'drizzle-orm';
import type { TaskExecutionDto, ExecutionFilters } from './types';

export class TaskExecutionReader {
  static async getExecutions(
    filters: ExecutionFilters
  ): Promise<TaskExecutionDto[]> {
    let query = db
      .select({
        execution: taskExecutions,
        task: tasks,
        assignee: users,
        completedByUser: users,
      })
      .from(taskExecutions)
      .innerJoin(tasks, eq(taskExecutions.taskId, tasks.id))
      .leftJoin(users, eq(taskExecutions.assignee, users.id))
      .leftJoin(
        sql`${users} AS completed_by_user`,
        eq(taskExecutions.completedBy, sql`completed_by_user.id`)
      )
      .where(eq(tasks.householdId, filters.householdId))
      .$dynamic();

    // Apply status filter
    if (filters.status) {
      query = query.where(eq(taskExecutions.status, filters.status));
    }

    // Apply taskId filter
    if (filters.taskId !== undefined) {
      query = query.where(eq(taskExecutions.taskId, filters.taskId));
    }

    // Apply date range filters
    if (filters.startDate) {
      query = query.where(
        gte(taskExecutions.expectedCompletedAt, new Date(filters.startDate))
      );
    }

    if (filters.endDate) {
      query = query.where(
        lte(taskExecutions.expectedCompletedAt, new Date(filters.endDate))
      );
    }

    const results = await query;

    return results.map((row) => ({
      id: row.execution.id,
      taskId: row.execution.taskId,
      taskTitle: row.task.title,
      status: row.execution.status,
      assignee: row.execution.assignee,
      assigneeName: row.assignee?.username || null,
      completedAt: row.execution.completedAt,
      completedBy: row.execution.completedBy,
      completedByName: row.completedByUser?.username || null,
      completionNotes: row.execution.completionNotes,
      cancellationReason: row.execution.cancellationReason,
      expectedCompletedAt: row.execution.expectedCompletedAt,
      isOverdue:
        row.execution.status === 'OPEN' &&
        row.execution.expectedCompletedAt < new Date(),
      createdAt: row.execution.createdAt,
    }));
  }

  static async getExecutionById(id: number): Promise<TaskExecutionDto | null> {
    const results = await db
      .select({
        execution: taskExecutions,
        task: tasks,
        assignee: users,
        completedByUser: users,
      })
      .from(taskExecutions)
      .innerJoin(tasks, eq(taskExecutions.taskId, tasks.id))
      .leftJoin(users, eq(taskExecutions.assignee, users.id))
      .leftJoin(
        sql`${users} AS completed_by_user`,
        eq(taskExecutions.completedBy, sql`completed_by_user.id`)
      )
      .where(eq(taskExecutions.id, id))
      .limit(1);

    if (results.length === 0) {
      return null;
    }

    const row = results[0];
    return {
      id: row.execution.id,
      taskId: row.execution.taskId,
      taskTitle: row.task.title,
      status: row.execution.status,
      assignee: row.execution.assignee,
      assigneeName: row.assignee?.username || null,
      completedAt: row.execution.completedAt,
      completedBy: row.execution.completedBy,
      completedByName: row.completedByUser?.username || null,
      completionNotes: row.execution.completionNotes,
      cancellationReason: row.execution.cancellationReason,
      expectedCompletedAt: row.execution.expectedCompletedAt,
      isOverdue:
        row.execution.status === 'OPEN' &&
        row.execution.expectedCompletedAt < new Date(),
      createdAt: row.execution.createdAt,
    };
  }
}
