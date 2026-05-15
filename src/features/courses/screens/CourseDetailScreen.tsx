import { Feather } from "@expo/vector-icons";
import { useBookmarkStore } from "@features/courses/store/useBookmarkStore";
import { useCoursesStore } from "@features/courses/store/useCoursesStore";
import { useEnrollmentStore } from "@features/courses/store/useEnrollmentStore";
import { Button } from "@shared/components/ui/button";
import { Text } from "@shared/components/ui/text";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export const CourseDetailScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const courseId = Number(id);
  const insets = useSafeAreaInsets();

  const course = useCoursesStore((state) => state.getCourseById(courseId));
  const hydrateBookmarks = useBookmarkStore((state) => state.hydrate);
  const hydrateEnrollments = useEnrollmentStore((state) => state.hydrate);
  const isBookmarked = useBookmarkStore((state) =>
    state.bookmarkIds.has(courseId),
  );
  const toggleBookmark = useBookmarkStore((state) => state.toggleBookmark);
  const isEnrolled = useEnrollmentStore((state) =>
    state.enrolledIds.has(courseId),
  );
  const enroll = useEnrollmentStore((state) => state.enroll);

  const [isEnrolling, setIsEnrolling] = useState(false);
  const [enrollSuccess, setEnrollSuccess] = useState(false);

  useEffect(() => {
    void hydrateBookmarks();
    void hydrateEnrollments();
  }, [hydrateBookmarks, hydrateEnrollments]);

  useEffect(() => {
    if (isEnrolled) {
      setEnrollSuccess(true);
    }
  }, [isEnrolled]);

  const handleToggleBookmark = useCallback(async () => {
    const wasBookmarked = isBookmarked;
    await toggleBookmark(courseId);
    Toast.show({
      type: "success",
      text1: wasBookmarked ? "Bookmark removed" : "Bookmark saved",
      text2: wasBookmarked
        ? "Course removed from your bookmarks."
        : "Course saved to local storage.",
    });
  }, [courseId, isBookmarked, toggleBookmark]);

  const handleEnroll = useCallback(async () => {
    if (isEnrolled || isEnrolling) {
      return;
    }

    setIsEnrolling(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
      await enroll(courseId);
      setEnrollSuccess(true);
      Toast.show({
        type: "success",
        text1: "Enrolled successfully",
        text2: `You are now enrolled in ${course?.title ?? "this course"}.`,
      });
    } finally {
      setIsEnrolling(false);
    }
  }, [course?.title, courseId, enroll, isEnrolled, isEnrolling]);

  const enrollLabel = useMemo(() => {
    if (isEnrolling) {
      return "Enrolling...";
    }
    if (enrollSuccess || isEnrolled) {
      return "Enrolled";
    }
    return "Enroll";
  }, [enrollSuccess, isEnrolled, isEnrolling]);

  if (!course) {
    return (
      <View
        className="flex-1 bg-background items-center justify-center px-6"
        style={{ paddingTop: insets.top }}
      >
        <Text className="text-foreground text-lg font-semibold text-center">
          Course not found
        </Text>
        <Button className="mt-4" onPress={() => router.back()}>
          <Text>Go back</Text>
        </Button>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        contentContainerStyle={{
          paddingBottom: insets.bottom + 24,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ paddingTop: insets.top }}>
          {/* <Image
            source={{ uri: course.thumbnail }}
            style={{ width: "100%", height: 220, backgroundColor: "#ffffffa5" }}
            contentFit="cover"
          /> */}
          <Image
            source={{ uri: 'https://img.freepik.com/free-photo/online-marketing_53876-176744.jpg?semt=ais_hybrid&w=740&q=80' }}
            style={{ width: "100%", height: 220, backgroundColor: "#ffffffa5" }}
            contentFit="cover"
          />
        </View>

        <View className="px-6 pt-4 gap-4">
          <View className="flex-row items-start justify-between gap-3">
            <View className="flex-1">
              <Text className="text-2xl font-bold text-foreground">
                {course.title}
              </Text>
              <Text className="text-muted-foreground mt-1 capitalize">
                {course.category} · {course.brand}
              </Text>
            </View>

            <Pressable
              onPress={() => void handleToggleBookmark()}
              className="w-11 h-11 rounded-full bg-muted items-center justify-center"
              accessibilityRole="button"
              accessibilityLabel={
                isBookmarked ? "Remove bookmark" : "Add bookmark"
              }
            >
              <Feather
                name="bookmark"
                size={22}
                color={isBookmarked ? "#ffffff" : "#a1a1aa"}
              />
            </Pressable>
          </View>

          <View className="flex-row items-center gap-3 bg-muted/30 rounded-xl p-3">
            <Image
              source={{ uri: course.instructor.picture }}
              style={{ width: 48, height: 48, borderRadius: 24 }}
              contentFit="cover"
            />
            <View className="flex-1">
              <Text className="text-muted-foreground text-xs">Instructor</Text>
              <Text className="text-foreground font-semibold">
                {course.instructor.name}
              </Text>
              <Text className="text-muted-foreground text-sm">
                {course.instructor.email}
              </Text>
            </View>
          </View>

          <View className="flex-row flex-wrap gap-3">
            <InfoPill label="Rating" value={`${course.rating} ★`} />
            <InfoPill label="Price" value={`$${course.price}`} />
            <InfoPill label="Discount" value={`${course.discountPercentage}%`} />
            <InfoPill label="Seats" value={`${course.stock} left`} />
          </View>

          <View>
            <Text className="text-lg font-semibold text-foreground mb-2">
              About this course
            </Text>
            <Text className="text-muted-foreground leading-6">
              {course.description}
            </Text>
          </View>

          {/* {course.images.length > 1 ? (
            <View>
              <Text className="text-lg font-semibold text-foreground mb-3">
                Gallery
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {course.images.map((uri) => (
                  <Image
                    key={uri}
                    source={{ uri }}
                    style={{
                      width: 140,
                      height: 100,
                      borderRadius: 12,
                      marginRight: 12,
                    }}
                    contentFit="cover"
                  />
                ))}
              </ScrollView>
            </View>
          ) : null} */}

        </View>
      </ScrollView>

      <View
        className="px-6 pt-3 border-t border-border bg-background"
        style={{ paddingBottom: insets.bottom + 12 }}
      >
        <Button
          className="w-full"
          onPress={() => void handleEnroll()}
          disabled={isEnrolling || enrollSuccess || isEnrolled}
          variant={enrollSuccess || isEnrolled ? "secondary" : "default"}
        >
          {isEnrolling ? (
            <View className="flex-row items-center gap-2">
              <ActivityIndicator size="small" color="#09090b" />
              <Text>{enrollLabel}</Text>
            </View>
          ) : (
            <View className="flex-row items-center gap-2">
              {enrollSuccess || isEnrolled ? (
                <Feather name="check-circle" size={18} color="#fafafa" />
              ) : null}
              <Text>{enrollLabel}</Text>
            </View>
          )}
        </Button>
      </View>
    </View>
  );
};

interface InfoPillProps {
  label: string;
  value: string;
}

const InfoPill = React.memo(function InfoPill({ label, value }: InfoPillProps) {
  return (
    <View className="bg-muted/40 rounded-lg px-3 py-2 min-w-[46%] flex-grow">
      <Text className="text-muted-foreground text-xs">{label}</Text>
      <Text className="text-foreground font-semibold">{value}</Text>
    </View>
  );
});
