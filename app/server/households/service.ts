import { HouseholdWriter } from './writer';
import { UserService } from '@/app/server/users/service';
import type { CreateHouseholdData } from './types';

/**
 * HouseholdService - Public interface for household domain operations.
 * Used by API routes. Wraps Reader/Writer classes.
 */
export class HouseholdService {
  /**
   * Get or create household for a user identified by Supabase user ID.
   * If user exists, returns error indicating they already have a household.
   * If user doesn't exist, creates household and user.
   */
  static async getOrCreateForUser(
    supabaseUserId: string,
    data: { name: string; username: string; email: string }
  ): Promise<
    | { success: true; householdId: number; userId: number }
    | { success: false; error: string }
  > {
    // Check if user already exists
    const existingUser = await UserService.getUserBySupabaseId(supabaseUserId);

    if (existingUser) {
      return {
        success: false,
        error: 'User already has a household',
      };
    }

    // Create new household with user
    const result = await HouseholdWriter.createHousehold({
      name: data.name,
      username: data.username,
      supabaseUserId,
      email: data.email,
    });

    return {
      success: true,
      ...result,
    };
  }

  static async createHousehold(
    data: CreateHouseholdData
  ): Promise<{ householdId: number; userId: number }> {
    return HouseholdWriter.createHousehold(data);
  }
}
