import { db } from '@/lib/db';
import { taskExecutions } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import {
  isValidTaskExecutionStatus,
  TaskExecutionStatus,
} from '@/app/types/enums';
import type { TaskExecutionDto } from './types';
import { TaskExecutionReader } from './reader';

export class TaskExecutionWriter {
  static async completeExecution(
    executionId: number,
    userId: number,
    notes?: string
  ): Promise<TaskExecutionDto> {
    const status = TaskExecutionStatus.COMPLETED;

    // Validate status
    if (!isValidTaskExecutionStatus(status)) {
      throw new Error(`Invalid status: ${status}`);
    }

    await db
      .update(taskExecutions)
      .set({
        status,
        completedAt: new Date(),
        completedBy: userId,
        completionNotes: notes || null,
        updatedAt: new Date(),
      })
      .where(eq(taskExecutions.id, executionId));

    const execution = await TaskExecutionReader.getExecutionById(executionId);
    if (!execution) {
      throw new Error('Execution not found');
    }

    return execution;
  }

  static async assignExecution(
    executionId: number,
    assigneeId: number
  ): Promise<TaskExecutionDto> {
    await db
      .update(taskExecutions)
      .set({
        assignee: assigneeId,
        updatedAt: new Date(),
      })
      .where(eq(taskExecutions.id, executionId));

    const execution = await TaskExecutionReader.getExecutionById(executionId);
    if (!execution) {
      throw new Error('Execution not found');
    }

    return execution;
  }

  static async cancelExecution(
    executionId: number,
    reason: string
  ): Promise<TaskExecutionDto> {
    const status = TaskExecutionStatus.CANCELLED;

    // Validate status
    if (!isValidTaskExecutionStatus(status)) {
      throw new Error(`Invalid status: ${status}`);
    }

    await db
      .update(taskExecutions)
      .set({
        status,
        cancellationReason: reason,
        updatedAt: new Date(),
      })
      .where(eq(taskExecutions.id, executionId));

    const execution = await TaskExecutionReader.getExecutionById(executionId);
    if (!execution) {
      throw new Error('Execution not found');
    }

    return execution;
  }
}
