import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { TaskService } from '@/app/server/tasks/service';
import { UserService } from '@/app/server/users/service';
import type { ApiResponse } from '@/app/api/types';
import type { TaskResponse, UpdateTaskRequest } from '../types';

interface RouteContext {
  params: Promise<{ id: string }>;
}

function toTaskResponse(task: {
  id: number;
  householdId: number;
  title: string;
  description: string | null;
  createdBy: number;
  createdByName: string;
  createdAt: Date;
  updatedAt: Date;
  hasReminder: boolean;
  nextTriggerAt: Date | null;
  cronSchedule: string | null;
}): TaskResponse {
  return {
    id: task.id,
    householdId: task.householdId,
    title: task.title,
    description: task.description,
    createdBy: task.createdBy,
    createdByName: task.createdByName,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
    hasReminder: task.hasReminder,
    nextTriggerAt: task.nextTriggerAt ? task.nextTriggerAt.toISOString() : null,
    cronSchedule: task.cronSchedule,
  };
}

export async function GET(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse<ApiResponse<TaskResponse>>> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await UserService.getUserBySupabaseId(user.id);

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { id } = await context.params;
    const taskId = parseInt(id);

    if (isNaN(taskId)) {
      return NextResponse.json({ error: 'Invalid task ID' }, { status: 400 });
    }

    const task = await TaskService.getTaskById(taskId);

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    if (task.householdId !== dbUser.householdId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const response = toTaskResponse(task);

    return NextResponse.json({ data: response });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An error occurred';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse<ApiResponse<TaskResponse>>> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await UserService.getUserBySupabaseId(user.id);

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { id } = await context.params;
    const taskId = parseInt(id);

    if (isNaN(taskId)) {
      return NextResponse.json({ error: 'Invalid task ID' }, { status: 400 });
    }

    // Verify task exists and belongs to user's household
    const existingTask = await TaskService.getTaskById(taskId);
    if (!existingTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    if (existingTask.householdId !== dbUser.householdId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body: UpdateTaskRequest = await request.json();

    if (!body.title && body.description === undefined) {
      return NextResponse.json(
        { error: 'At least one field must be provided' },
        { status: 400 }
      );
    }

    const updatedTask = await TaskService.updateTask(taskId, {
      title: body.title,
      description: body.description,
    });

    const response = toTaskResponse(updatedTask);
    return NextResponse.json({ data: response });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An error occurred';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse<ApiResponse<void>>> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await UserService.getUserBySupabaseId(user.id);

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { id } = await context.params;
    const taskId = parseInt(id);

    if (isNaN(taskId)) {
      return NextResponse.json({ error: 'Invalid task ID' }, { status: 400 });
    }

    const task = await TaskService.getTaskById(taskId);

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    if (task.householdId !== dbUser.householdId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await TaskService.deleteTask(taskId);

    return NextResponse.json({ data: undefined }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An error occurred';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
