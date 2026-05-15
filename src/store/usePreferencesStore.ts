import { APP_STORAGE_KEYS } from "@lib/storage/storageKeys";
import {
  getAppStorageJSON,
  setAppStorageJSON,
} from "@lib/storage/appStorage";
import { create } from "zustand";

export interface UserPreferences {
  showBookmarksOnly: boolean;
  lastCoursesSearch: string;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  showBookmarksOnly: false,
  lastCoursesSearch: "",
};

interface PreferencesState {
  preferences: UserPreferences;
  isHydrated: boolean;
  hydrate: () => Promise<void>;
  setShowBookmarksOnly: (value: boolean) => Promise<void>;
  setLastCoursesSearch: (query: string) => Promise<void>;
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
    } catch {
      // Keep in-memory preference
    }
  },

  setLastCoursesSearch: async (query: string) => {
    const preferences = {
      ...get().preferences,
      lastCoursesSearch: query,
    };
    set({ preferences });
    try {
      await persistPreferences(preferences);
    } catch {
      // Keep in-memory preference
    }
  },

  resetPreferences: async () => {
    set({ preferences: DEFAULT_PREFERENCES });
    try {
      await persistPreferences(DEFAULT_PREFERENCES);
    } catch {
      // Keep in-memory preference
    }
  },
}));
