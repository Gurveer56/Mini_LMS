import { APP_STORAGE_KEYS } from "@lib/storage/storageKeys";
import {
  deleteAppStorage,
  getAppStorageJSON,
  setAppStorageJSON,
} from "@lib/storage/appStorage";
import { create } from "zustand";
import * as Notifications from 'expo-notifications';
import { showApiErrorToast } from '@lib/api/showApiErrorToast';

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
    } catch (error) {
      showApiErrorToast(error, { title: 'Bookmarks' });
      set({ bookmarkIds: new Set(), isHydrated: true });
    }
  },

  toggleBookmark: async (courseId: number) => {
    const next = new Set(get().bookmarkIds);
    let justAdded = false;
    if (next.has(courseId)) {
      next.delete(courseId);
    } else {
      next.add(courseId);
      justAdded = true;
    }

    set({ bookmarkIds: next });

    if (justAdded && next.size === 5) {
      void Notifications.scheduleNotificationAsync({
        content: {
          title: "You're on a roll! 🎉",
          body: "You've bookmarked 5 courses. Great job keeping track of your favorites!",
        },
        trigger: null, 
      });
    }

    try {
      if (next.size === 0) {
        await deleteAppStorage(APP_STORAGE_KEYS.courseBookmarks);
      } else {
        await persistBookmarks(next);
      }
    } catch (error) {
      showApiErrorToast(error, { title: 'Bookmarks' });
    }
  },

  isBookmarked: (courseId: number) => get().bookmarkIds.has(courseId),
}));
