export interface Role {
  id: number;
  name: string;
  group: number;
  description: string | null;
  permissions: { id: number; key: string; description: string | null }[];
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: number;
  username: string;
  fullName: string;
  email: string | null;
  dni: string | null;
  isActive: boolean;
  certificateRangeStart: number | null;
  certificateRangeEnd: number | null;
  lastCertificate: string | null;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

export interface UserPayload {
  username: string;
  password: string;
  fullName: string;
  email: string;
  dni: string;
  roleId: number;
  roleName?: string;
  certificateRangeStart?: number | null;
  certificateRangeEnd?: number | null;
}

export interface UserUpdatePayload {
  username?: string;
  password?: string;
  fullName?: string;
  email?: string;
  dni?: string;
  roleId?: number;
  certificateRangeStart?: number | null;
  certificateRangeEnd?: number | null;
}
