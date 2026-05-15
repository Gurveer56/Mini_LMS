import { APP_STORAGE_KEYS } from "@lib/storage/storageKeys";
import {
  deleteAppStorage,
  getAppStorageJSON,
  setAppStorageJSON,
} from "@lib/storage/appStorage";
import { create } from "zustand";

interface BookmarkState {
  bookmarkIds: Set<number>;
  isHydrated: boolean;
  hydrate: () => Promise<void>;
  toggleBookmark: (courseId: number) => Promise<void>;
  isBookmarked: (courseId: number) => boolean;
}

const persistBookmarks = async (ids: Set<number>) => {
  await setAppStorageJSON(
    APP_STORAGE_KEYS.courseBookmarks,
    Array.from(ids),
  );
};

export const useBookmarkStore = create<BookmarkState>((set, get) => ({
  bookmarkIds: new Set(),
  isHydrated: false,

  hydrate: async () => {
    try {
      const stored = await getAppStorageJSON<number[]>(
        APP_STORAGE_KEYS.courseBookmarks,
      );
      set({
        bookmarkIds: new Set(stored ?? []),
        isHydrated: true,
      });
    } catch {
      set({ bookmarkIds: new Set(), isHydrated: true });
    }
  },

  toggleBookmark: async (courseId: number) => {
    const next = new Set(get().bookmarkIds);
    if (next.has(courseId)) {
      next.delete(courseId);
    } else {
      next.add(courseId);
    }

    set({ bookmarkIds: next });

    try {
      if (next.size === 0) {
        await deleteAppStorage(APP_STORAGE_KEYS.courseBookmarks);
      } else {
        await persistBookmarks(next);
      }
    } catch {
      // Keep in-memory state even if persistence fails
    }
  },

  isBookmarked: (courseId: number) => get().bookmarkIds.has(courseId),
}));
