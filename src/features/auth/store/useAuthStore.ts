import { getCurrentUser, logoutUser } from "@features/auth/api/session";
import { LoginUser } from "@features/auth/types";
import { clearAuthStorage } from "@lib/auth/authBridge";
import { refreshAuthTokens } from "@lib/auth/refreshTokens";
import {
  getAppStorage,
  setAppStorage,
  deleteAppStorage,
} from "@lib/storage/appStorage";
import {
  getSecureStorage,
  setSecureStorage,
} from "@lib/storage/secureStorage";
import { APP_STORAGE_KEYS, SECURE_STORAGE_KEYS } from "@lib/storage/storageKeys";
import { create } from "zustand";
import { showApiErrorToast } from "@lib/api/showApiErrorToast";

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: LoginUser | null;
  localAvatar: string | null;
  login: (
    accessToken: string,
    refreshToken: string,
    userData: LoginUser,
  ) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  updateUser: (userData: Partial<LoginUser>) => Promise<void>;
  setLocalAvatar: (uri: string | null) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  isLoading: true,
  user: null,
  localAvatar: null,

  checkAuth: async () => {
    try {
      const [token, localAvatar] = await Promise.all([
        getSecureStorage(SECURE_STORAGE_KEYS.accessToken),
        getAppStorage(APP_STORAGE_KEYS.localAvatar),
      ]);
      
      set({ localAvatar });

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
    } catch (error) {
      try {
        await refreshAuthTokens();
        const response = await getCurrentUser();
        const user = response.data;
        await setSecureStorage(SECURE_STORAGE_KEYS.user, JSON.stringify(user));
        set({
          user,
          isAuthenticated: true,
          isLoading: false,
        });
        return;
      } catch {
        // Refresh failed — fall through to logout
      }

      showApiErrorToast(error, { title: "Authentication Error" });
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
    } catch (error) {
      showApiErrorToast(error, { title: 'Logout Failed' });
    }
    await clearAuthStorage();
    await deleteAppStorage(APP_STORAGE_KEYS.localAvatar);
    set({ user: null, isAuthenticated: false, isLoading: false, localAvatar: null });
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

  setLocalAvatar: async (uri: string | null) => {
    if (uri) {
      await setAppStorage(APP_STORAGE_KEYS.localAvatar, uri);
    } else {
      await deleteAppStorage(APP_STORAGE_KEYS.localAvatar);
    }
    set({ localAvatar: uri });
  },
}));
