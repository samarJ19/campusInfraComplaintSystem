import api from "../api/axios";
import {
  type User,
  type LoginPayload,
  type AuthResponse,
  type SignupPayload,
} from "../types/auth";

export class AuthService {
  static async login(data: LoginPayload): Promise<User> {
    await api.post<AuthResponse>("/auth/login", data);
    //by treating getCurrentUser as single source of truth, we are making double API calls. Is it a good design decision? 
    return this.getCurrentUser();
  }

  static async signup(data: SignupPayload): Promise<User> {
    await api.post<AuthResponse>("/auth/signup", data);

    return this.getCurrentUser();
  }

  static async logout(): Promise<void> {
    await api.post("/auth/logout");
  }

  static async getCurrentUser(): Promise<User> {
    const response = await api.get<AuthResponse>("/auth/me");

    return response.data.user;
  }
}
