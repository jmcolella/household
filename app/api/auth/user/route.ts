import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/app/server/auth/service';
import type { ApiResponse } from '@/app/api/types';
import type { UserResponse } from '../types';

export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResponse<UserResponse | null>>> {
  try {
    const user = await AuthService.getCurrentUser();
    return NextResponse.json({ data: user });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An error occurred';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
