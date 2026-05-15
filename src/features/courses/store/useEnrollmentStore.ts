import { APP_STORAGE_KEYS } from "@lib/storage/storageKeys";
import { getAppStorageJSON, setAppStorageJSON } from "@lib/storage/appStorage";
import { create } from "zustand";

interface EnrollmentState {
  enrolledIds: Set<number>;
  isHydrated: boolean;
  hydrate: () => Promise<void>;
  enroll: (courseId: number) => Promise<void>;
  isEnrolled: (courseId: number) => boolean;
}

export const useEnrollmentStore = create<EnrollmentState>((set, get) => ({
  enrolledIds: new Set(),
  isHydrated: false,

  hydrate: async () => {
    try {
      const stored = await getAppStorageJSON<number[]>(
        APP_STORAGE_KEYS.courseEnrollments,
      );
      set({
        enrolledIds: new Set(stored ?? []),
        isHydrated: true,
      });
    } catch {
      set({ enrolledIds: new Set(), isHydrated: true });
    }
  },

  enroll: async (courseId: number) => {
    const next = new Set(get().enrolledIds);
    next.add(courseId);
    set({ enrolledIds: next });
    try {
      await setAppStorageJSON(
        APP_STORAGE_KEYS.courseEnrollments,
        Array.from(next),
      );
    } catch {
      // Keep in-memory enrollment even if persistence fails
    }
  },

  isEnrolled: (courseId: number) => get().enrolledIds.has(courseId),
}));
