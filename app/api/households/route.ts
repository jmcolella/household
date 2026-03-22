import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { households, users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
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

    console.log('users', users);

    // Check if user already has a household
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.supabaseUserId, user.id))
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: 'User already has a household' },
        { status: 400 }
      );
    }

    // Create household and user in transaction
    const result = await db.transaction(async (tx) => {
      const [household] = await tx
        .insert(households)
        .values({
          name: body.name,
        })
        .returning();

      const [dbUser] = await tx
        .insert(users)
        .values({
          householdId: household.id,
          supabaseUserId: user.id,
          username: body.username,
          email: user.email!,
        })
        .returning();

      return {
        householdId: household.id,
        userId: dbUser.id,
      };
    });

    return NextResponse.json({ data: result }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An error occurred';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
