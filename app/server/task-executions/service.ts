import { TaskExecutionReader } from './reader';
import { TaskExecutionWriter } from './writer';
import { TaskService } from '@/app/server/tasks/service';
import type {
  TaskExecutionDto,
  ExecutionFilters,
  CompleteExecutionData,
  AssignExecutionData,
  CancelExecutionData,
  CreateExecutionData,
} from './types';

/**
 * TaskExecutionService - Public interface for task execution domain operations.
 * Used by API routes. Wraps Reader/Writer classes.
 */
export class TaskExecutionService {
  // Query operations
  static async getExecutions(filters: ExecutionFilters): Promise<TaskExecutionDto[]> {
    return TaskExecutionReader.getExecutions(filters);
  }

  static async getExecutionById(id: number): Promise<TaskExecutionDto | null> {
    return TaskExecutionReader.getExecutionById(id);
  }

  // Command operations
  static async completeExecution(
    executionId: number,
    userId: number,
    data: CompleteExecutionData
  ): Promise<TaskExecutionDto> {
    return TaskExecutionWriter.completeExecution(executionId, userId, data);
  }

  static async assignExecution(
    executionId: number,
    data: AssignExecutionData
  ): Promise<TaskExecutionDto> {
    return TaskExecutionWriter.assignExecution(executionId, data);
  }

  static async cancelExecution(
    executionId: number,
    data: CancelExecutionData
  ): Promise<TaskExecutionDto> {
    return TaskExecutionWriter.cancelExecution(executionId, data);
  }

  static async createExecution(
    householdId: number,
    data: CreateExecutionData
  ): Promise<TaskExecutionDto> {
    // Verify task belongs to household
    const task = await TaskService.getTaskById(data.taskId);
    if (!task) {
      throw new Error('Task not found');
    }
    if (task.householdId !== householdId) {
      throw new Error('Task does not belong to household');
    }

    return TaskExecutionWriter.createExecution(data);
  }
}
