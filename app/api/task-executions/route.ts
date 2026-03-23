import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { TaskExecutionService } from '@/app/server/task-executions/service';
import { UserService } from '@/app/server/users/service';
import type { TaskExecutionDto } from '@/app/server/task-executions/types';
import { isValidTaskExecutionStatus } from '@/app/types/enums';
import type { ApiResponse } from '../types';
import type { TaskExecutionResponse } from './types';

// Helper: Transform server TaskExecutionDto to API TaskExecutionResponse
function toTaskExecutionResponse(execution: TaskExecutionDto): TaskExecutionResponse {
  return {
    ...execution,
    completedAt: execution.completedAt?.toISOString() ?? null,
    expectedCompletedAt: execution.expectedCompletedAt.toISOString(),
    createdAt: execution.createdAt.toISOString(),
  };
}

export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResponse<TaskExecutionResponse[]>>> {
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

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const statusParam = searchParams.get('status');
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;

    // Validate status parameter
    const status = statusParam && isValidTaskExecutionStatus(statusParam)
      ? statusParam
      : undefined;

    // Call Service instead of Reader directly
    const executions = await TaskExecutionService.getExecutions({
      householdId,
      status,
      startDate,
      endDate,
    });

    // Transform to API response format
    const response = executions.map(toTaskExecutionResponse);

    return NextResponse.json({ data: response });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An error occurred';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
