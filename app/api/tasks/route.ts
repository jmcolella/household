import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { TaskService } from '@/app/server/tasks/service';
import { UserService } from '@/app/server/users/service';
import type { TaskDto } from '@/app/server/tasks/types';
import type { ApiResponse } from '../types';
import type { CreateTaskRequest, TaskResponse } from './types';

// Helper: Transform server TaskDto to API TaskResponse
function toTaskResponse(task: TaskDto): TaskResponse {
  return {
    ...task,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
    nextTriggerAt: task.nextTriggerAt?.toISOString() ?? null,
  };
}

export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResponse<TaskResponse[]>>> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user via UserService
    const dbUser = await UserService.getUserBySupabaseId(user.id);

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const householdId = dbUser.householdId;

    // Call Service instead of Reader directly
    const tasks = await TaskService.getTasksByHousehold(householdId);

    // Transform to API response format
    const response = tasks.map(toTaskResponse);

    return NextResponse.json({ data: response });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An error occurred';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<TaskResponse>>> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user via UserService
    const dbUser = await UserService.getUserBySupabaseId(user.id);

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const householdId = dbUser.householdId;
    const userId = dbUser.id;

    const body: CreateTaskRequest = await request.json();

    // Validate request
    if (!body.title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    if (body.isRecurring && !body.cronSchedule) {
      return NextResponse.json(
        { error: 'Cron schedule is required for recurring tasks' },
        { status: 400 }
      );
    }

    if (!body.isRecurring && !body.expectedCompletedAt) {
      return NextResponse.json(
        { error: 'Expected completion date is required for one-time tasks' },
        { status: 400 }
      );
    }

    // Call Service with CreateTaskData
    const task = await TaskService.createTask(householdId, userId, body);

    // Transform to API response format
    const response = toTaskResponse(task);

    return NextResponse.json({ data: response }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An error occurred';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
