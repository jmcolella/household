import { UserReader } from './reader';
import type { UserDto } from './types';

/**
 * UserService - Public interface for user domain operations.
 * Used by API routes and other services.
 */
export class UserService {
  static async getUserBySupabaseId(supabaseUserId: string): Promise<UserDto | null> {
    return UserReader.getUserBySupabaseId(supabaseUserId);
  }

  static async getUserById(id: number): Promise<UserDto | null> {
    return UserReader.getUserById(id);
  }
}
