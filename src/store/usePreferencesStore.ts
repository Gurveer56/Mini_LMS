import { APP_STORAGE_KEYS } from "@lib/storage/storageKeys";
import {
  getAppStorageJSON,
  setAppStorageJSON,
} from "@lib/storage/appStorage";
import { create } from "zustand";

export interface UserPreferences {
  showBookmarksOnly: boolean;
  lastCoursesSearch: string;
  showHomeApiErrorTester: boolean;
  disableEnrollmentActions: boolean;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  showBookmarksOnly: false,
  lastCoursesSearch: "",
  showHomeApiErrorTester: false,
  disableEnrollmentActions: false,
};

interface PreferencesState {
  preferences: UserPreferences;
  isHydrated: boolean;
  hydrate: () => Promise<void>;
  setShowBookmarksOnly: (value: boolean) => Promise<void>;
  setLastCoursesSearch: (query: string) => Promise<void>;
  setShowHomeApiErrorTester: (value: boolean) => Promise<void>;
  setDisableEnrollmentActions: (value: boolean) => Promise<void>;
  resetPreferences: () => Promise<void>;
}

const persistPreferences = async (preferences: UserPreferences) => {
  await setAppStorageJSON(APP_STORAGE_KEYS.userPreferences, preferences);
};

export const usePreferencesStore = create<PreferencesState>((set, get) => ({
  preferences: DEFAULT_PREFERENCES,
  isHydrated: false,

  hydrate: async () => {
    try {
      const stored = await getAppStorageJSON<UserPreferences>(
        APP_STORAGE_KEYS.userPreferences,
      );
      set({
        preferences: { ...DEFAULT_PREFERENCES, ...stored },
        isHydrated: true,
      });
    } catch {
      set({ preferences: DEFAULT_PREFERENCES, isHydrated: true });
    }
  },

  setShowBookmarksOnly: async (value: boolean) => {
    const preferences = {
      ...get().preferences,
      showBookmarksOnly: value,
    };
    set({ preferences });
    try {
      await persistPreferences(preferences);
    } catch {}
  },

  setLastCoursesSearch: async (query: string) => {
    const preferences = {
      ...get().preferences,
      lastCoursesSearch: query,
    };
    set({ preferences });
    try {
      await persistPreferences(preferences);
    } catch {}
  },

  setShowHomeApiErrorTester: async (value: boolean) => {
    const preferences = {
      ...get().preferences,
      showHomeApiErrorTester: value,
    };
    set({ preferences });
    try {
      await persistPreferences(preferences);
    } catch {}
  },

  setDisableEnrollmentActions: async (value: boolean) => {
    const preferences = {
      ...get().preferences,
      disableEnrollmentActions: value,
    };
    set({ preferences });
    try {
      await persistPreferences(preferences);
    } catch {}
  },

  resetPreferences: async () => {
    set({ preferences: DEFAULT_PREFERENCES });
    try {
      await persistPreferences(DEFAULT_PREFERENCES);
    } catch {}
  },
}));
