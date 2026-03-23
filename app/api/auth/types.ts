// API request types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  username: string;
}

// API response types
export interface UserResponse {
  id: string;
  email: string;
  username?: string;
}
