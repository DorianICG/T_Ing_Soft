import { Request } from 'express';
import { AuthenticatedRequest } from '../../auth/middlewares/auth.middleware';

export interface UserProfileResponse {
  id: number;
  rut: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
}

export interface UpdateProfileRequest {
  email?: string;
  phone?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export type AuthenticatedUserRequest = AuthenticatedRequest;