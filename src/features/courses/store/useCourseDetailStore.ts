import { Course } from "@features/courses/types";
import { APP_STORAGE_KEYS } from "@lib/storage/storageKeys";
import { getAppStorageJSON, setAppStorageJSON } from "@lib/storage/appStorage";
import { create } from "zustand";

interface CourseDetailState {
  selectedCourse: Course | null;
  completedLessonCourseIds: Set<number>;
  isHydrated: boolean;
  hydrate: () => Promise<void>;
  setSelectedCourse: (course: Course) => void;
  clearSelectedCourse: () => void;
  markLessonComplete: (courseId: number) => Promise<void>;
  isLessonComplete: (courseId: number) => boolean;
}

const persistCompletedLessons = async (courseIds: Set<number>) => {
  await setAppStorageJSON(
    APP_STORAGE_KEYS.courseLessonCompletions,
    Array.from(courseIds),
  );
};

export const useCourseDetailStore = create<CourseDetailState>((set, get) => ({
  selectedCourse: null,
  completedLessonCourseIds: new Set(),
  isHydrated: false,

  hydrate: async () => {
    try {
      const stored = await getAppStorageJSON<number[]>(
        APP_STORAGE_KEYS.courseLessonCompletions,
      );
      set({
        completedLessonCourseIds: new Set(stored ?? []),
        isHydrated: true,
      });
    } catch {
      set({ completedLessonCourseIds: new Set(), isHydrated: true });
    }
  },

  setSelectedCourse: (course) => set({ selectedCourse: course }),

  clearSelectedCourse: () => set({ selectedCourse: null }),

  markLessonComplete: async (courseId) => {
    const next = new Set(get().completedLessonCourseIds);
    next.add(courseId);
    set({ completedLessonCourseIds: next });
    try {
      await persistCompletedLessons(next);
    } catch {}
  },

  isLessonComplete: (courseId) =>
    get().completedLessonCourseIds.has(courseId),
}));
