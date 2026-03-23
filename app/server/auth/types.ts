export interface UserDto {
  id: string;
  email: string;
  username?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface SignupData {
  email: string;
  password: string;
  username: string;
}
