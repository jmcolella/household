import { TaskReader } from './reader';
import { TaskWriter } from './writer';
import type { TaskDto, CreateTaskData, UpdateTaskData } from './types';

/**
 * TaskService - Public interface for task domain operations.
 * Used by API routes. Wraps Reader/Writer classes.
 */
export class TaskService {
  // Query operations
  static async getTasksByHousehold(householdId: number): Promise<TaskDto[]> {
    return TaskReader.getTasksByHousehold(householdId);
  }

  static async getTaskById(id: number): Promise<TaskDto | null> {
    return TaskReader.getTaskById(id);
  }

  static async getTasksByHouseholdAndUser(
    householdId: number,
    userId: number
  ): Promise<TaskDto[]> {
    return TaskReader.getTasksByHouseholdAndUser(householdId, userId);
  }

  // Command operations
  static async createTask(
    householdId: number,
    userId: number,
    data: CreateTaskData
  ): Promise<TaskDto> {
    return TaskWriter.createTask(householdId, userId, data);
  }

  static async updateTask(
    taskId: number,
    data: UpdateTaskData
  ): Promise<TaskDto> {
    return TaskWriter.updateTask(taskId, data);
  }

  static async deleteTask(taskId: number): Promise<void> {
    return TaskWriter.deleteTask(taskId);
  }
}
