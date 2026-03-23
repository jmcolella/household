import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/app/server/auth/service';
import type { ApiResponse } from '@/app/api/types';

export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<{ success: boolean }>>> {
  try {
    await AuthService.logout();
    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An error occurred';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
