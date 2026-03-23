import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/app/server/auth/service';
import type { ApiResponse } from '@/app/api/types';
import type { LoginRequest, UserResponse } from '../types';

export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<UserResponse>>> {
  try {
    const body: LoginRequest = await request.json();

    if (!body.email || !body.password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const user = await AuthService.login(body);

    return NextResponse.json({ data: user });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An error occurred';
    return NextResponse.json({ error: message }, { status: 401 });
  }
}
