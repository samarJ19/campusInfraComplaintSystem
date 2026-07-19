export interface LoginRequest {
  email: string;

  password: string;
}

export interface RegisterRequest {
  name: string;

  email: string;

  password: string;

  enrollmentNumber?: string;
}

export type UserRole = "STUDENT" | "FACULTY" | "MAINTENANCE" | "ADMIN";

export type Department =
  | "ELECTRICAL"
  | "WATER"
  | "SANITIZATION"
  | "INTERNET"
  | "INFRASTRUCTURE"
  | "GENERAL";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  enrollmentNumber?: string | null;
  department?: Department | null;
  createdAt: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user: User;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface SignupPayload {
  name: string;
  email: string;
  password: string;
  enrollmentNumber?: string;
}
