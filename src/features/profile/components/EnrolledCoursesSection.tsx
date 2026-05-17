import { Feather } from "@expo/vector-icons";
import { COURSE_CARD_IMAGE_URI } from "@features/courses/constants/courseImages";
import { useCoursesStore } from "@features/courses/store/useCoursesStore";
import { Text } from "@shared/components/ui/text";
import { Image } from "expo-image";
import { Href, router } from "expo-router";
import React, { useMemo } from "react";
import { FlatList, Pressable, View } from "react-native";

interface EnrolledCoursesSectionProps {
  enrolledIds: number[];
  isWide?: boolean;
}

export const EnrolledCoursesSection = ({
  enrolledIds,
  isWide,
}: EnrolledCoursesSectionProps) => {
  const catalogCourses = useCoursesStore((state) => state.courses);

  const enrolledCourses = useMemo(
    () =>
      enrolledIds.map((id) => ({
        id,
        course: catalogCourses.find((course) => course.id === id),
      })),
    [catalogCourses, enrolledIds],
  );

  if (enrolledIds.length === 0) {
    return null;
  }

  return (
    <View className={`mb-8 ${isWide ? "max-w-xl self-center w-full" : ""}`}>
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-xl font-bold text-foreground">Enrolled Courses</Text>
        <View className="bg-primary/10 px-2 py-1 rounded">
          <Text className="text-primary font-bold text-xs">
            {enrolledIds.length} ACTIVE
          </Text>
        </View>
      </View>

      <FlatList
        data={enrolledCourses}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ gap: 16 }}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push(`/(main)/course/${item.id}` as Href)}
            className="bg-muted/30 rounded-2xl overflow-hidden w-64 border border-border/50"
          >
            <Image
              source={{
                // item.course?.thumbnail || COURSE_CARD_IMAGE_URI,    
                uri: COURSE_CARD_IMAGE_URI,
              }}
              style={{ width: "100%", height: 120 }}
              contentFit="cover"
            />
            <View className="p-4 gap-2">
              <Text className="text-foreground font-bold" numberOfLines={1}>
                {item.course?.title ?? `Course #${item.id}`}
              </Text>

              {item.course ? (
                <View className="flex-row items-center gap-2">
                  <Image
                    source={{ uri: item.course.instructor.picture }}
                    style={{ width: 24, height: 24, borderRadius: 12 }}
                  />
                  <Text className="text-muted-foreground text-xs flex-1" numberOfLines={1}>
                    {item.course.instructor.name}
                  </Text>
                </View>
              ) : (
                <Text className="text-muted-foreground text-xs" numberOfLines={1}>
                  Tap to load course details
                </Text>
              )}

              {item.course ? (
                <View className="flex-row items-center justify-between mt-1">
                  <View className="flex-row items-center gap-1">
                    <Feather name="star" size={12} color="#fbbf24" />
                    <Text className="text-muted-foreground text-xs">
                      {item.course.rating}
                    </Text>
                  </View>
                  <Text className="text-primary font-bold">
                    ${item.course.price}
                  </Text>
                </View>
              ) : null}
            </View>
          </Pressable>
        )}
      />
    </View>
  );
};
