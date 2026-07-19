import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

import { AuthService } from "../services/auth.service";
import {
  type User,
  type LoginPayload,
  type SignupPayload,
} from "../types/auth";

interface AuthContextType {
  user: User | null;
  loading: boolean;

  login: (data: LoginPayload) => Promise<void>;

  signup: (data: SignupPayload) => Promise<void>;

  logout: () => Promise<void>;

  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const currentUser = await AuthService.getCurrentUser();

      setUser(currentUser);
    } catch {
      //why have we not handled the error here?
      setUser(null);
    }
  };

  const login = async (data: LoginPayload) => {
    await AuthService.login(data);
    await refreshUser();
  };

  const signup = async (data: SignupPayload) => {
    await AuthService.signup(data);

    await refreshUser();
  };

  const logout = async () => {
    await AuthService.logout();

    setUser(null);
  };

  useEffect(() => {
    refreshUser().finally(() => setLoading(false));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
