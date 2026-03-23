import { db } from '@/lib/db';
import { taskExecutions } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import type { TaskExecutionDto, CompleteExecutionData, AssignExecutionData, CancelExecutionData } from './types';
import { TaskExecutionReader } from './reader';

export class TaskExecutionWriter {
  static async completeExecution(
    executionId: number,
    userId: number,
    data: CompleteExecutionData
  ): Promise<TaskExecutionDto> {
    await db
      .update(taskExecutions)
      .set({
        status: 'COMPLETED',
        completedAt: new Date(),
        completedBy: userId,
        completionNotes: data.completionNotes || null,
      })
      .where(eq(taskExecutions.id, executionId));

    const execution = await TaskExecutionReader.getExecutionById(executionId);
    if (!execution) {
      throw new Error('Execution not found after update');
    }
    return execution;
  }

  static async assignExecution(
    executionId: number,
    data: AssignExecutionData
  ): Promise<TaskExecutionDto> {
    await db
      .update(taskExecutions)
      .set({ assignee: data.assigneeId })
      .where(eq(taskExecutions.id, executionId));

    const execution = await TaskExecutionReader.getExecutionById(executionId);
    if (!execution) {
      throw new Error('Execution not found after update');
    }
    return execution;
  }

  static async cancelExecution(
    executionId: number,
    data: CancelExecutionData
  ): Promise<TaskExecutionDto> {
    await db
      .update(taskExecutions)
      .set({
        status: 'CANCELLED',
        cancellationReason: data.reason,
      })
      .where(eq(taskExecutions.id, executionId));

    const execution = await TaskExecutionReader.getExecutionById(executionId);
    if (!execution) {
      throw new Error('Execution not found after update');
    }
    return execution;
  }
}
