import { Feather } from "@expo/vector-icons";
import { COURSE_CARD_IMAGE_URI } from "@features/courses/constants/courseImages";
import { Course } from "@features/courses/types";
import { getCourseItemKey } from "@features/courses/utils/courseListKeys";
import { Text } from "@shared/components/ui/text";
import { Image } from "expo-image";
import React, { memo, useCallback, useMemo } from "react";
import { Pressable, View } from "react-native";
import { useBookmarkStore } from "../store/useBookmarkStore";

const CARD_IMAGE_HEIGHT = 168;

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

    const salePrice = useMemo(
      () =>
        Math.max(
          0,
          course.price - course.price * (course.discountPercentage / 100),
        ),
      [course.discountPercentage, course.price],
    );

    const imageUri = COURSE_CARD_IMAGE_URI;

    return (
      <Pressable
        onPress={handlePress}
        className="mb-4 overflow-hidden rounded-lg border border-border bg-card active:opacity-95"
      >
        <View style={{ height: CARD_IMAGE_HEIGHT }} className="relative">
          <Image
            source={{ uri: imageUri }}
            style={{ width: "100%", height: CARD_IMAGE_HEIGHT }}
            contentFit="cover"
            cachePolicy="memory-disk"
            recyclingKey={`${getCourseItemKey(course)}-hero`}
            transition={200}
          />
          <View
            className="absolute inset-0"
            style={{ backgroundColor: "rgba(9, 9, 11, 0.28)" }}
          />
          <View className="absolute top-3 left-3 flex-row gap-2">
            <View className="rounded-md bg-black/55 px-2.5 py-1 border border-white/10">
              <Text className="text-foreground text-xs font-medium capitalize">
                {course.category}
              </Text>
            </View>
            <View className="rounded-md bg-black/55 px-2.5 py-1 border border-white/10 flex-row items-center gap-1">
              <Feather name="star" size={12} color="#fbbf24" />
              <Text className="text-foreground text-xs font-semibold">
                {course.rating}
              </Text>
            </View>
          </View>
          <Pressable
            onPress={(event) => {
              event.stopPropagation();
              handleBookmarkPress();
            }}
            style={{backgroundColor: isBookmarked ? "#fbbf24" : '#000000c0'}}
            hitSlop={12}
            className="absolute top-3 right-3 w-10 h-10 rounded-full  items-center justify-center"
            accessibilityRole="button"
            accessibilityLabel={
              isBookmarked ? "Remove bookmark" : "Add bookmark"
            }
          >
            <Feather
              name="bookmark"
              size={18}
              color={isBookmarked ? "#ffffff" : "#d4d4d8"}
            />
          </Pressable>
          <View className="absolute bottom-3 left-3 right-3">
            <Text
              className="text-foreground text-lg font-bold"
              numberOfLines={2}
            >
              {course.title}
            </Text>
          </View>
        </View>

        <View className="p-4 gap-3">
          <View className="flex-row items-start justify-between gap-3">
            <View className="flex-1 gap-2">
              <View className="flex-row items-center gap-2">
                {course.instructor.picture ? (
                  <Image
                    source={{ uri: course.instructor.picture }}
                    style={{ width: 28, height: 28, borderRadius: 14 }}
                    contentFit="cover"
                    cachePolicy="memory-disk"
                  />
                ) : (
                  <View className="w-7 h-7 rounded-full bg-muted items-center justify-center">
                    <Feather name="user" size={14} color="#a1a1aa" />
                  </View>
                )}
                <View className="flex-1">
                  <Text className="text-muted-foreground text-xs">
                    Instructor
                  </Text>
                  <Text
                    className="text-foreground text-sm font-medium"
                    numberOfLines={1}
                  >
                    {course.instructor.name}
                  </Text>
                </View>
              </View>
            </View>
            <View className="items-end">
              <Text className="text-foreground text-lg font-bold">
                ${salePrice.toFixed(0)}
              </Text>
              <Text className="text-muted-foreground text-xs line-through">
                ${course.price}
              </Text>
            </View>
          </View>

          <Text
            className="text-muted-foreground text-sm leading-5"
            numberOfLines={2}
          >
            {course.description}
          </Text>

          <View className="flex-row flex-wrap gap-2">
            <MetaChip icon="tag" label={course.brand} />
            <MetaChip
              icon="percent"
              label={`${course.discountPercentage}% off`}
            />
            <MetaChip icon="users" label={`${course.stock} seats`} />
          </View>
        </View>
      </Pressable>
    );
  },
  (prev, next) =>
    prev.course.id === next.course.id &&
    prev.onPress === next.onPress &&
    prev.course.title === next.course.title &&
    prev.course.thumbnail === next.course.thumbnail &&
    prev.course.rating === next.course.rating &&
    prev.course.price === next.course.price &&
    prev.course.discountPercentage === next.course.discountPercentage &&
    prev.course.instructor.name === next.course.instructor.name,
);

interface MetaChipProps {
  icon: keyof typeof Feather.glyphMap;
  label: string;
}

const MetaChip = memo(function MetaChip({ icon, label }: MetaChipProps) {
  return (
    <View className="flex-row items-center gap-1 rounded-md bg-muted/50 px-2.5 py-1">
      <Feather name={icon} size={12} color="#a1a1aa" />
      <Text className="text-muted-foreground text-xs">{label}</Text>
    </View>
  );
});
