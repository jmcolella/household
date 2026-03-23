import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import type { UserDto } from './types';

export class UserReader {
  static async getUserBySupabaseId(supabaseUserId: string): Promise<UserDto | null> {
    const results = await db
      .select()
      .from(users)
      .where(eq(users.supabaseUserId, supabaseUserId))
      .limit(1);

    return results.length > 0 ? results[0] : null;
  }

  static async getUserById(id: number): Promise<UserDto | null> {
    const results = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    return results.length > 0 ? results[0] : null;
  }
}
