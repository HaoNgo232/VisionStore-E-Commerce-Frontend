/**
 * User Types
 * User profile and related types
 */

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  dateOfBirth?: string;
  gender?: "male" | "female" | "other";
  role: UserRole;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = "customer" | "admin" | "staff";

/**
 * Update profile request
 */
export interface UpdateProfileRequest {
  name?: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  dateOfBirth?: string;
  gender?: "male" | "female" | "other";
}

/**
 * Change password request
 */
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * User preferences/settings
 */
export interface UserPreferences {
  userId: string;
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  newsletter: boolean;
  language: string;
  timezone: string;
}
