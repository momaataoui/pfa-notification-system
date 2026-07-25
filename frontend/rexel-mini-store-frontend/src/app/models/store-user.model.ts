export type StoreRole = 'ADMIN' | 'USER';

export interface StoreUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  role: StoreRole;
}

export interface UpdateProfileRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}
