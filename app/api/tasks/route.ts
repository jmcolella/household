import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { TaskReader } from './reader';
import { TaskWriter } from './writer';
import type { ApiResponse } from '../types';
import type { TaskDto, CreateTaskRequest } from './types';

export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResponse<TaskDto[]>>> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's household from database
    const dbUser = await db
      .select()
      .from(users)
      .where(eq(users.supabaseUserId, user.id))
      .limit(1);

    if (dbUser.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const householdId = dbUser[0].householdId;
    const taskList = await TaskReader.getTasksByHousehold(householdId);

    return NextResponse.json({ data: taskList });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An error occurred';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<TaskDto>>> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's household and ID from database
    const dbUser = await db
      .select()
      .from(users)
      .where(eq(users.supabaseUserId, user.id))
      .limit(1);

    if (dbUser.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const householdId = dbUser[0].householdId;
    const userId = dbUser[0].id;

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

    const task = await TaskWriter.createTask(householdId, userId, body);

    return NextResponse.json({ data: task }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An error occurred';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
