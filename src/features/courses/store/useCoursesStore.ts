import { ApiErrorState, parseApiError } from "@lib/api/errors";
import { APP_STORAGE_KEYS } from "@lib/storage/storageKeys";
import {
  deleteAppStorage,
  getAppStorageJSON,
  setAppStorageJSON,
} from "@lib/storage/appStorage";
import { create } from "zustand";
import { fetchCourseCatalogPage, PAGE_SIZE } from "../api";
import { Course } from "../types";
import { mapProductsToCourses } from "../utils/mapCourses";

interface CoursesCachePayload {
  courses: Course[];
  page: number;
  hasNextPage: boolean;
  updatedAt: number;
}

interface CoursesState {
  courses: Course[];
  page: number;
  hasNextPage: boolean;
  isLoading: boolean;
  isRefreshing: boolean;
  isLoadingMore: boolean;
  isRetrying: boolean;
  isCacheHydrated: boolean;
  error: ApiErrorState | null;
  hydrateCache: () => Promise<void>;
  fetchCourses: (options?: { refresh?: boolean }) => Promise<void>;
  loadMoreCourses: () => Promise<void>;
  retryCourses: () => Promise<void>;
  clearError: () => void;
  getCourseById: (id: number) => Course | undefined;
}

const persistCourseCache = async (payload: CoursesCachePayload) => {
  await setAppStorageJSON(APP_STORAGE_KEYS.courseListCache, payload);
};

export const useCoursesStore = create<CoursesState>((set, get) => ({
  courses: [],
  page: 0,
  hasNextPage: true,
  isLoading: false,
  isRefreshing: false,
  isLoadingMore: false,
  isRetrying: false,
  isCacheHydrated: false,
  error: null,

  hydrateCache: async () => {
    try {
      const cached = await getAppStorageJSON<CoursesCachePayload>(
        APP_STORAGE_KEYS.courseListCache,
      );
      if (cached?.courses?.length) {
        set({
          courses: cached.courses,
          page: cached.page,
          hasNextPage: cached.hasNextPage,
        });
      }
    } catch {
      // Ignore corrupt cache
    } finally {
      set({ isCacheHydrated: true });
    }
  },

  clearError: () => set({ error: null }),

  fetchCourses: async (options) => {
    const isRefresh = options?.refresh ?? false;
    const { isLoadingMore, isRefreshing } = get();

    if (isLoadingMore || isRefreshing) {
      return;
    }

    set({
      isLoading: !isRefresh && get().courses.length === 0,
      isRefreshing: isRefresh,
      isRetrying: false,
      error: null,
    });

    try {
      const { usersResponse, productsResponse } = await fetchCourseCatalogPage(
        1,
        PAGE_SIZE,
      );

      const pageCourses = mapProductsToCourses(
        productsResponse.data.data,
        usersResponse.data.data,
      );

      const page = 1;
      const hasNextPage = productsResponse.data.nextPage;

      set({
        courses: pageCourses,
        page,
        hasNextPage,
        isLoading: false,
        isRefreshing: false,
        isRetrying: false,
        error: null,
      });

      await persistCourseCache({
        courses: pageCourses,
        page,
        hasNextPage,
        updatedAt: Date.now(),
      });
    } catch (error) {
      set({
        error: parseApiError(error),
        isLoading: false,
        isRefreshing: false,
        isRetrying: false,
      });
    }
  },

  loadMoreCourses: async () => {
    const { hasNextPage, isLoadingMore, isLoading, isRefreshing, page, courses } =
      get();

    if (!hasNextPage || isLoadingMore || isLoading || isRefreshing) {
      return;
    }

    const nextPage = page + 1;
    set({ isLoadingMore: true, error: null });

    try {
      const { usersResponse, productsResponse } = await fetchCourseCatalogPage(
        nextPage,
        PAGE_SIZE,
      );

      const pageCourses = mapProductsToCourses(
        productsResponse.data.data,
        usersResponse.data.data,
      );

      const existingIds = new Set(courses.map((course) => course.id));
      const merged = [
        ...courses,
        ...pageCourses.filter((course) => !existingIds.has(course.id)),
      ];

      const hasNextPageNext = productsResponse.data.nextPage;

      set({
        courses: merged,
        page: nextPage,
        hasNextPage: hasNextPageNext,
        isLoadingMore: false,
        error: null,
      });

      await persistCourseCache({
        courses: merged,
        page: nextPage,
        hasNextPage: hasNextPageNext,
        updatedAt: Date.now(),
      });
    } catch (error) {
      set({
        error: parseApiError(error),
        isLoadingMore: false,
      });
    }
  },

  retryCourses: async () => {
    const { courses } = get();
    set({ isRetrying: true, error: null });

    if (courses.length === 0) {
      await get().fetchCourses();
    } else {
      await get().fetchCourses({ refresh: true });
    }

    set({ isRetrying: false });
  },

  getCourseById: (id: number) => get().courses.find((course) => course.id === id),
}));

export const clearCourseListCache = async (): Promise<void> => {
  await deleteAppStorage(APP_STORAGE_KEYS.courseListCache);
};
