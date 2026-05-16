import { CourseListShimmer } from "@features/courses/components/CourseListShimmer";
import { CoursesLegendList } from "@features/courses/components/CoursesLegendList";
import { CourseFiltersRow } from "@features/courses/components/CourseFiltersRow";
import { CoursesListEmpty } from "@features/courses/components/CoursesListEmpty";
import { useBookmarkStore } from "@features/courses/store/useBookmarkStore";
import { useCoursesStore } from "@features/courses/store/useCoursesStore";
import { filterCoursesByQuery } from "@features/courses/utils/mapCourses";
import { usePreferencesStore } from "@store/usePreferencesStore";
import { useNetworkStore } from "@store/useNetworkStore";
import { ApiErrorView } from "@shared/components/ApiErrorView";
import { Text } from "@shared/components/ui/text";
import { Href, router } from "expo-router";
import React, { useCallback, useEffect, useMemo } from "react";
import { View } from "react-native";

interface CoursesCatalogProps {
  searchQuery: string;
  listHeaderTop?: React.ReactElement;
  contentPaddingBottom: number;
}

export const CoursesCatalog = ({
  searchQuery,
  listHeaderTop,
  contentPaddingBottom,
}: CoursesCatalogProps) => {
  const courses = useCoursesStore((state) => state.courses);
  const isLoading = useCoursesStore((state) => state.isLoading);
  const isRefreshing = useCoursesStore((state) => state.isRefreshing);
  const isLoadingMore = useCoursesStore((state) => state.isLoadingMore);
  const isRetrying = useCoursesStore((state) => state.isRetrying);
  const isCacheHydrated = useCoursesStore((state) => state.isCacheHydrated);
  const error = useCoursesStore((state) => state.error);
  const fetchCourses = useCoursesStore((state) => state.fetchCourses);
  const loadMoreCourses = useCoursesStore((state) => state.loadMoreCourses);
  const retryCourses = useCoursesStore((state) => state.retryCourses);

  const bookmarkIds = useBookmarkStore((state) => state.bookmarkIds);
  const isBookmarksHydrated = useBookmarkStore((state) => state.isHydrated);
  const isOffline = useNetworkStore((state) => state.isOffline);

  const preferences = usePreferencesStore((state) => state.preferences);
  const isPreferencesHydrated = usePreferencesStore((state) => state.isHydrated);
  const setShowBookmarksOnly = usePreferencesStore(
    (state) => state.setShowBookmarksOnly,
  );

  useEffect(() => {
    if (!isCacheHydrated) {
      return;
    }
    if (courses.length === 0 && !error) {
      void fetchCourses();
    }
  }, [courses.length, error, fetchCourses, isCacheHydrated]);

  const filteredCourses = useMemo(() => {
    let list = filterCoursesByQuery(courses, searchQuery);
    if (preferences.showBookmarksOnly) {
      list = list.filter((course) => bookmarkIds.has(course.id));
    }
    return list;
  }, [bookmarkIds, courses, preferences.showBookmarksOnly, searchQuery]);

  const bookmarkRevision = bookmarkIds.size;

  const handleToggleBookmarksOnly = useCallback(() => {
    void setShowBookmarksOnly(!preferences.showBookmarksOnly);
  }, [preferences.showBookmarksOnly, setShowBookmarksOnly]);

  const handleSimulateError = useCallback(() => {
    void fetchCourses({ refresh: true });
  }, [fetchCourses]);

  const handleCoursePress = useCallback((courseId: number) => {
    router.push(`/(main)/course/${courseId}` as Href);
  }, []);

  const handleRefresh = useCallback(() => {
    if (isOffline) {
      return;
    }
    void fetchCourses({ refresh: true });
  }, [fetchCourses, isOffline]);

  const handleRetry = useCallback(() => {
    if (isOffline) {
      return;
    }
    void retryCourses();
  }, [isOffline, retryCourses]);

  const handleEndReached = useCallback(() => {
    if (
      searchQuery.trim().length > 0 ||
      preferences.showBookmarksOnly ||
      isOffline ||
      error
    ) {
      return;
    }
    void loadMoreCourses();
  }, [
    error,
    isOffline,
    loadMoreCourses,
    preferences.showBookmarksOnly,
    searchQuery,
  ]);

  const listHeader = useMemo(
    () => (
      <View>
        {listHeaderTop}
        <CourseFiltersRow
          showBookmarksOnly={preferences.showBookmarksOnly}
          onToggleBookmarksOnly={handleToggleBookmarksOnly}
          onSimulateError={handleSimulateError}
        />
      </View>
    ),
    [
      handleSimulateError,
      handleToggleBookmarksOnly,
      listHeaderTop,
      preferences.showBookmarksOnly,
    ],
  );

  const listEmpty = useMemo(() => {
    if (error && courses.length === 0) {
      return (
        <ApiErrorView
          error={error}
          isRetrying={isRetrying || isLoading || isRefreshing}
          onRetry={handleRetry}
        />
      );
    }

    return (
      <CoursesListEmpty
        isLoading={
          isLoading || !isBookmarksHydrated || !isPreferencesHydrated
        }
        hasSearchQuery={
          searchQuery.trim().length > 0 || preferences.showBookmarksOnly
        }
      />
    );
  }, [
    courses.length,
    error,
    handleRetry,
    isBookmarksHydrated,
    isLoading,
    isPreferencesHydrated,
    isRefreshing,
    isRetrying,
    preferences.showBookmarksOnly,
    searchQuery,
  ]);

  const showShimmer =
    (isLoading || isRetrying) && courses.length === 0 && !error;

  const showFullScreenError = error && courses.length === 0 && !showShimmer;

  if (!isCacheHydrated && courses.length === 0) {
    return <CourseListShimmer />;
  }

  if (showShimmer) {
    return <CourseListShimmer />;
  }

  if (showFullScreenError && error) {
    return (
      <View className="flex-1 px-5">
        {listHeader}
        <ApiErrorView
          error={error}
          isRetrying={isRetrying || isRefreshing}
          onRetry={handleRetry}
        />
      </View>
    );
  }

  return (
    <View className="flex-1">
      {error && courses.length > 0 ? (
        <View className="px-5 pb-2">
          <ApiErrorView
            error={error}
            isRetrying={isRetrying || isLoadingMore}
            onRetry={handleRetry}
            compact
          />
        </View>
      ) : null}

      {isOffline ? (
        <View className="px-5 pb-2">
          <Text className="text-destructive text-sm text-center">
            You are offline. Pull to refresh when back online.
          </Text>
        </View>
      ) : null}

      <CoursesLegendList
        courses={filteredCourses}
        bookmarkRevision={bookmarkRevision}
        isRefreshing={isRefreshing}
        isLoadingMore={isLoadingMore}
        listHeader={listHeader}
        listEmpty={listEmpty}
        contentPaddingBottom={contentPaddingBottom}
        onCoursePress={handleCoursePress}
        onRefresh={handleRefresh}
        onEndReached={handleEndReached}
      />
    </View>
  );
};
