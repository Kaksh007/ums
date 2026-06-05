export type Role = 'Admin' | 'Supervisor' | 'Worker';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt?: string;
}

export interface CapturedImage {
  id: string;
  owner: string;
  ownerName: string;
  ownerRole: Role;
  url: string;
  publicId: string;
  bytes?: number;
  width?: number;
  height?: number;
  format?: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
