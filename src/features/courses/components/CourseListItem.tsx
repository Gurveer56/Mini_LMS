import { Feather } from "@expo/vector-icons";
import { Course } from "@features/courses/types";
import { getCourseItemKey } from "@features/courses/utils/courseListKeys";
import { Text } from "@shared/components/ui/text";
import { Image } from "expo-image";
import React, { memo, useCallback } from "react";
import { Pressable, View } from "react-native";
import { useBookmarkStore } from "../store/useBookmarkStore";

const THUMB_SIZE = 112;

interface CourseListItemProps {
  course: Course;
  onPress: (courseId: number) => void;
}

export const CourseListItem = memo(
  function CourseListItem({ course, onPress }: CourseListItemProps) {
    const isBookmarked = useBookmarkStore((state) =>
      state.bookmarkIds.has(course.id),
    );
    const toggleBookmark = useBookmarkStore((state) => state.toggleBookmark);

    const handlePress = useCallback(() => {
      onPress(course.id);
    }, [course.id, onPress]);

    const handleBookmarkPress = useCallback(() => {
      void toggleBookmark(course.id);
    }, [course.id, toggleBookmark]);

    return (
      <Pressable
        onPress={handlePress}
        className="flex-row bg-card border border-border rounded-xl overflow-hidden mb-3 active:opacity-90"
        style={{ minHeight: THUMB_SIZE }}
      >
        <View
          style={{
            width: THUMB_SIZE,
            height: THUMB_SIZE,
            backgroundColor: "#18181b",
          }}
        >
          {course.thumbnail ? (
            <Image
              source={{ uri: 'https://img.freepik.com/free-photo/online-marketing_53876-176744.jpg?semt=ais_hybrid&w=740&q=80' }}
              style={{ width: THUMB_SIZE, height: THUMB_SIZE }}
              contentFit="cover"
              cachePolicy="memory-disk"
              recyclingKey={`${getCourseItemKey(course)}-thumb`}
              transition={200}
            />
          ) : (
            <View className="flex-1 items-center justify-center">
              <Feather name="image" size={28} color="#71717a" />
            </View>
          )}
        </View>

        <View className="flex-1 p-3 justify-between">
          <View className="flex-row items-start justify-between gap-2">
            <View className="flex-1">
              <Text
                className="text-foreground font-semibold text-base"
                numberOfLines={2}
              >
                {course.title}
              </Text>
              <View className="flex-row items-center gap-1.5 mt-1">
                {course.instructor.picture ? (
                  <Image
                    source={{ uri: course.instructor.picture }}
                    style={{ width: 18, height: 18, borderRadius: 9 }}
                    contentFit="cover"
                    cachePolicy="memory-disk"
                  />
                ) : null}
                <Text
                  className="text-muted-foreground text-xs flex-1"
                  numberOfLines={1}
                >
                  {course.instructor.name}
                </Text>
              </View>
            </View>

            <Pressable
              onPress={(event) => {
                event.stopPropagation();
                handleBookmarkPress();
              }}
              hitSlop={12}
              className="p-1"
              accessibilityRole="button"
              accessibilityLabel={
                isBookmarked ? "Remove bookmark" : "Add bookmark"
              }
            >
              <Feather
                name="bookmark"
                size={20}
                color={isBookmarked ? "#ffffff" : "#71717a"}
                style={isBookmarked ? { opacity: 1 } : { opacity: 0.7 }}
              />
            </Pressable>
          </View>

          <Text className="text-muted-foreground text-sm mt-2" numberOfLines={2}>
            {course.description}
          </Text>
        </View>
      </Pressable>
    );
  },
  (prev, next) =>
    prev.course.id === next.course.id &&
    prev.onPress === next.onPress &&
    prev.course.title === next.course.title &&
    prev.course.thumbnail === next.course.thumbnail &&
    prev.course.instructor.name === next.course.instructor.name,
);
