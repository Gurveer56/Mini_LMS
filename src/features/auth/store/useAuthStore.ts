import { create } from 'zustand';
import { getData, setData, deleteData } from '@lib/storage/secureStorage';
import { LoginUser } from '@features/auth/types';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: LoginUser | null;
  login: (accessToken: string, refreshToken: string, userData: LoginUser) => Promise<void>;
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
      const token = await getData('accessToken');
      const userData = await getData('user');

      if (token && userData) {
        set({ user: JSON.parse(userData), isAuthenticated: true, isLoading: false });
      } else {
        set({ user: null, isAuthenticated: false, isLoading: false });
      }
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  login: async (accessToken: string, refreshToken: string, userData: LoginUser) => {
    await setData('accessToken', accessToken);
    await setData('refreshToken', refreshToken);
    await setData('user', JSON.stringify(userData));
    set({ user: userData, isAuthenticated: true });
  },

  logout: async () => {
    await deleteData('accessToken');
    await deleteData('refreshToken');
    await deleteData('user');
    set({ user: null, isAuthenticated: false });
  },

  updateUser: async (userData: Partial<LoginUser>) => {
    const currentUser = get().user;
    if (currentUser) {
      const updatedUser = { ...currentUser, ...userData };
      await setData('user', JSON.stringify(updatedUser));
      set({ user: updatedUser });
    }
  }
}));
