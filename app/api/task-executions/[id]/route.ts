import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { TaskExecutionWriter } from '../writer';
import type { ApiResponse } from '../../types';
import type {
  TaskExecutionDto,
  CompleteExecutionRequest,
  AssignExecutionRequest,
  CancelExecutionRequest,
} from '../types';

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function PATCH(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse<ApiResponse<TaskExecutionDto>>> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from database
    const dbUser = await db
      .select()
      .from(users)
      .where(eq(users.supabaseUserId, user.id))
      .limit(1);

    if (dbUser.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userId = dbUser[0].id;
    const params = await context.params;
    const executionId = parseInt(params.id);

    if (isNaN(executionId)) {
      return NextResponse.json(
        { error: 'Invalid execution ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { action } = body;

    let execution: TaskExecutionDto;

    switch (action) {
      case 'complete': {
        const { completionNotes } = body as CompleteExecutionRequest;
        execution = await TaskExecutionWriter.completeExecution(
          executionId,
          userId,
          completionNotes
        );
        break;
      }

      case 'assign': {
        const { assigneeId } = body as AssignExecutionRequest;
        if (!assigneeId) {
          return NextResponse.json(
            { error: 'Assignee ID is required' },
            { status: 400 }
          );
        }
        execution = await TaskExecutionWriter.assignExecution(
          executionId,
          assigneeId
        );
        break;
      }

      case 'cancel': {
        const { reason } = body as CancelExecutionRequest;
        if (!reason) {
          return NextResponse.json(
            { error: 'Cancellation reason is required' },
            { status: 400 }
          );
        }
        execution = await TaskExecutionWriter.cancelExecution(
          executionId,
          reason
        );
        break;
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action. Must be one of: complete, assign, cancel' },
          { status: 400 }
        );
    }

    return NextResponse.json({ data: execution });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An error occurred';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
