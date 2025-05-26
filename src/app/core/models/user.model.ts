
export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: 'admin' | 'staff' | 'user';
  phone_country_code?: string;
  phone_number?: string;
  street?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country_code?: string;
}

export interface AuthResponse {
  message: string;
  token_type?: string;
  access_token?: string;
  user?: User;
  expires_at?: number;
}


export interface UserUpdateData {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone_country_code?: string;
  phone_number?: string;
  street?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country_code?: string;
}


export interface ChangePasswordData {
  current_password: string;
  password: string;
  password_confirmation: string;
}
