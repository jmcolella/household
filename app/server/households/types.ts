export interface HouseholdDto {
  id: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateHouseholdData {
  name: string;
  username: string;
  supabaseUserId: string;
  email: string;
}
