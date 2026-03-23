export interface UserDto {
  id: number;
  householdId: number;
  supabaseUserId: string;
  username: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}
