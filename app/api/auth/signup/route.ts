import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/app/server/auth/service';
import type { ApiResponse } from '@/app/api/types';
import type { SignupRequest, UserResponse } from '../types';

export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<UserResponse>>> {
  try {
    const body: SignupRequest = await request.json();

    if (!body.email || !body.password || !body.username) {
      return NextResponse.json(
        { error: 'Email, password, and username are required' },
        { status: 400 }
      );
    }

    const user = await AuthService.signup(body);

    return NextResponse.json({ data: user }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An error occurred';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
