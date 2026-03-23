import { db } from '@/lib/db';
import { households, users } from '@/lib/db/schema';
import type { CreateHouseholdData } from './types';

export class HouseholdWriter {
  static async createHousehold(
    data: CreateHouseholdData
  ): Promise<{ householdId: number; userId: number }> {
    return await db.transaction(async (tx) => {
      const [household] = await tx
        .insert(households)
        .values({ name: data.name })
        .returning();

      const [user] = await tx
        .insert(users)
        .values({
          householdId: household.id,
          supabaseUserId: data.supabaseUserId,
          username: data.username,
          email: data.email,
        })
        .returning();

      return { householdId: household.id, userId: user.id };
    });
  }
}
