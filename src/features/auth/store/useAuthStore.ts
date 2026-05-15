import { getCurrentUser, logoutUser } from "@features/auth/api/session";
import { LoginUser } from "@features/auth/types";
import { clearAuthStorage } from "@lib/auth/authBridge";
import {
  getSecureStorage,
  setSecureStorage,
} from "@lib/storage/secureStorage";
import { SECURE_STORAGE_KEYS } from "@lib/storage/storageKeys";
import { create } from "zustand";

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: LoginUser | null;
  login: (
    accessToken: string,
    refreshToken: string,
    userData: LoginUser,
  ) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  updateUser: (userData: Partial<LoginUser>) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  isLoading: true,
  user: null,

  checkAuth: async () => {
    try {
      const token = await getSecureStorage(SECURE_STORAGE_KEYS.accessToken);

      if (!token) {
        set({ user: null, isAuthenticated: false, isLoading: false });
        return;
      }

      const cachedUser = await getSecureStorage(SECURE_STORAGE_KEYS.user);
      if (cachedUser) {
        set({
          user: JSON.parse(cachedUser) as LoginUser,
          isAuthenticated: true,
        });
      }

      const response = await getCurrentUser();
      const user = response.data;

      await setSecureStorage(SECURE_STORAGE_KEYS.user, JSON.stringify(user));
      set({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch {
      await clearAuthStorage();
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  login: async (
    accessToken: string,
    refreshToken: string,
    userData: LoginUser,
  ) => {
    await setSecureStorage(SECURE_STORAGE_KEYS.accessToken, accessToken);
    await setSecureStorage(SECURE_STORAGE_KEYS.refreshToken, refreshToken);
    await setSecureStorage(SECURE_STORAGE_KEYS.user, JSON.stringify(userData));
    set({ user: userData, isAuthenticated: true, isLoading: false });
  },

  logout: async () => {
    try {
      await logoutUser();
    } catch {
      // Clear local session even if the server logout fails
    }
    await clearAuthStorage();
    set({ user: null, isAuthenticated: false, isLoading: false });
  },

  updateUser: async (userData: Partial<LoginUser>) => {
    const currentUser = get().user;
    if (currentUser) {
      const updatedUser = { ...currentUser, ...userData };
      await setSecureStorage(
        SECURE_STORAGE_KEYS.user,
        JSON.stringify(updatedUser),
      );
      set({ user: updatedUser });
    }
  },
}));
