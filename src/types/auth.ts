export interface Role {
  id: number;
  name: string;
  group: number;
  description: string;
  permissions: string[];
}

export interface User {
  id: number;
  username: string;
  fullName: string;
  email: string;
  dni: string;
  isActive: boolean;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

export interface LoginPayload {
  username: string;
  password: string;
}

export interface LoginResponse {
  user: User;
}

export interface ApiErrorResponse {
  message: string;
  status: number;
  data: null;
}
