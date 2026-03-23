import { createClient } from '@/lib/supabase/server';
import type { UserDto, LoginData, SignupData } from './types';

export class AuthService {
  static async login(data: LoginData): Promise<UserDto> {
    const supabase = await createClient();
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error || !authData.user) {
      throw new Error(error?.message || 'Login failed');
    }

    return {
      id: authData.user.id,
      email: authData.user.email!,
      username: authData.user.user_metadata?.username,
    };
  }

  static async signup(data: SignupData): Promise<UserDto> {
    const supabase = await createClient();
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: { username: data.username },
      },
    });

    if (error || !authData.user) {
      throw new Error(error?.message || 'Signup failed');
    }

    return {
      id: authData.user.id,
      email: authData.user.email!,
      username: authData.user.user_metadata?.username,
    };
  }

  static async logout(): Promise<void> {
    const supabase = await createClient();
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error(error.message);
    }
  }

  static async getCurrentUser(): Promise<UserDto | null> {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) {
      throw new Error(error.message);
    }

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email!,
      username: user.user_metadata?.username,
    };
  }
}
