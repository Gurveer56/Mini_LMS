import { CourseListItem } from "@features/courses/components/CourseListItem";
import { Course } from "@features/courses/types";
import { courseKeyExtractor } from "@features/courses/utils/courseListKeys";
import { Text } from "@shared/components/ui/text";
import { LegendList } from "@legendapp/list";
import React, { memo, useCallback } from "react";
import { ActivityIndicator, View } from "react-native";

const ESTIMATED_ITEM_SIZE = 340;

export interface CoursesLegendListProps {
  courses: Course[];
  bookmarkRevision: number;
  isRefreshing: boolean;
  isLoadingMore: boolean;
  listHeader: React.ReactElement;
  listEmpty: React.ReactElement;
  contentPaddingBottom: number;
  onCoursePress: (courseId: number) => void;
  onRefresh: () => void;
  onEndReached: () => void;
}

export const CoursesLegendList = memo(function CoursesLegendList({
  courses,
  bookmarkRevision,
  isRefreshing,
  isLoadingMore,
  listHeader,
  listEmpty,
  contentPaddingBottom,
  onCoursePress,
  onRefresh,
  onEndReached,
}: CoursesLegendListProps) {
  const keyExtractor = useCallback(
    (item: Course) => courseKeyExtractor(item),
    [],
  );

  const renderItem = useCallback(
    ({ item }: { item: Course }) => (
      <CourseListItem course={item} onPress={onCoursePress} />
    ),
    [onCoursePress],
  );

  const listFooter = useCallback(() => {
    if (!isLoadingMore) {
      return <View className="h-4" />;
    }

    return (
      <View className="py-6 items-center">
        <ActivityIndicator color="#ffffff" />
        <Text className="text-muted-foreground text-sm mt-2">
          Loading more courses...
        </Text>
      </View>
    );
  }, [isLoadingMore]);

  return (
    <LegendList
      data={courses}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      estimatedItemSize={ESTIMATED_ITEM_SIZE}
      recycleItems
      maintainVisibleContentPosition
      refreshing={isRefreshing}
      onRefresh={onRefresh}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.4}
      ListHeaderComponent={listHeader}
      ListEmptyComponent={listEmpty}
      ListFooterComponent={listFooter}
      contentContainerStyle={{
        paddingHorizontal: 24,
        paddingBottom: contentPaddingBottom,
      }}
      showsVerticalScrollIndicator={false}
      extraData={bookmarkRevision}
    />
  );
});
