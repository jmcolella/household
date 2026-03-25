import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { TaskExecutionService } from '@/app/server/task-executions/service';
import { UserService } from '@/app/server/users/service';
import type { TaskExecutionDto } from '@/app/server/task-executions/types';
import type { ApiResponse } from '../../types';
import type {
  TaskExecutionResponse,
  CompleteExecutionRequest,
  AssignExecutionRequest,
  CancelExecutionRequest,
} from '../types';

// Helper: Transform server TaskExecutionDto to API TaskExecutionResponse
function toTaskExecutionResponse(execution: TaskExecutionDto): TaskExecutionResponse {
  return {
    ...execution,
    completedAt: execution.completedAt?.toISOString() ?? null,
    expectedCompletedAt: execution.expectedCompletedAt.toISOString(),
    createdAt: execution.createdAt.toISOString(),
  };
}

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function PATCH(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse<ApiResponse<TaskExecutionResponse>>> {
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

    const userId = dbUser.id;
    const params = await context.params;
    const executionId = parseInt(params.id);

    if (isNaN(executionId)) {
      return NextResponse.json(
        { error: 'Invalid execution ID' },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Validate action exists
    if (!body || typeof body.action !== 'string') {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    const { action } = body;
    let execution: TaskExecutionDto;

    switch (action) {
      case 'complete': {
        const { completionNotes } = body;
        execution = await TaskExecutionService.completeExecution(
          executionId,
          userId,
          { completionNotes }
        );
        break;
      }

      case 'assign': {
        const { assigneeId } = body;
        if (!assigneeId) {
          return NextResponse.json(
            { error: 'Assignee ID is required' },
            { status: 400 }
          );
        }
        execution = await TaskExecutionService.assignExecution(
          executionId,
          { assigneeId }
        );
        break;
      }

      case 'cancel': {
        const { reason } = body;
        execution = await TaskExecutionService.cancelExecution(
          executionId,
          { reason }
        );
        break;
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action. Must be one of: complete, assign, cancel' },
          { status: 400 }
        );
    }

    // Transform to API response format
    const response = toTaskExecutionResponse(execution);

    return NextResponse.json({ data: response });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An error occurred';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
