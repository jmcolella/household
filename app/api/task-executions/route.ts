import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { TaskExecutionReader } from './reader';
import type { ApiResponse } from '../types';
import type { TaskExecutionDto } from './types';

export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResponse<TaskExecutionDto[]>>> {
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

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') || undefined;
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;

    const executions = await TaskExecutionReader.getExecutions({
      householdId,
      status: status as any,
      startDate,
      endDate,
    });

    return NextResponse.json({ data: executions });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An error occurred';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
