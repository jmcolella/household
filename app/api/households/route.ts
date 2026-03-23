import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { HouseholdService } from '@/app/server/households/service';
import type { ApiResponse } from '../types';

interface CreateHouseholdRequest {
  name: string;
  username: string;
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<{ householdId: number; userId: number }>>> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: CreateHouseholdRequest = await request.json();

    if (!body.name || !body.username) {
      return NextResponse.json(
        { error: 'Name and username are required' },
        { status: 400 }
      );
    }

    // Use service to check and create household
    const result = await HouseholdService.getOrCreateForUser(user.id, {
      name: body.name,
      username: body.username,
      email: user.email!,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { data: { householdId: result.householdId, userId: result.userId } },
      { status: 201 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An error occurred';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
