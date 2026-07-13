export type StoreRole = 'ADMIN' | 'USER';

export interface StoreUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: StoreRole;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
}

export interface UpdateProfileRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}
