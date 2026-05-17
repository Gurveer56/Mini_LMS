import { Feather } from "@expo/vector-icons";
import { fetchRandomProductById, fetchRandomUserById } from "@features/courses/api";
import { COURSE_CARD_IMAGE_URI } from "@features/courses/constants/courseImages";
import { useCourseDetailStore } from "@features/courses/store/useCourseDetailStore";
import { useBookmarkStore } from "@features/courses/store/useBookmarkStore";
import { useCoursesStore } from "@features/courses/store/useCoursesStore";
import { useEnrollmentStore } from "@features/courses/store/useEnrollmentStore";
import { Course } from "@features/courses/types";
import { mapProductAndInstructorToCourse } from "@features/courses/utils/mapCourses";
import { Button } from "@shared/components/ui/button";
import { Text } from "@shared/components/ui/text";
import { usePreferencesStore } from "@store/usePreferencesStore";
import { Image } from "expo-image";
import { Href, router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export const CourseDetailScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const courseId = Number(id);
  const insets = useSafeAreaInsets();

  const cachedCourse = useCoursesStore((state) => state.getCourseById(courseId));
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
  const unenroll = useEnrollmentStore((state) => state.unenroll);
  const setSelectedCourse = useCourseDetailStore(
    (state) => state.setSelectedCourse,
  );
  const isLessonComplete = useCourseDetailStore((state) =>
    state.completedLessonCourseIds.has(courseId),
  );
  const showDevUnenrollAction = usePreferencesStore(
    (state) => state.preferences.disableEnrollmentActions,
  );

  const [remoteCourse, setRemoteCourse] = useState<Course | null>(null);
  const [isLoadingCourse, setIsLoadingCourse] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [enrollSuccess, setEnrollSuccess] = useState(false);

  const course = cachedCourse ?? remoteCourse;
  const discountedPrice = useMemo(() => {
    if (!course) {
      return 0;
    }
    return Math.max(
      0,
      course.price - course.price * (course.discountPercentage / 100),
    );
  }, [course]);

  useEffect(() => {
    void hydrateBookmarks();
    void hydrateEnrollments();
  }, [hydrateBookmarks, hydrateEnrollments]);

  useEffect(() => {
    if (cachedCourse || !Number.isFinite(courseId)) {
      return;
    }

    let isMounted = true;
    setIsLoadingCourse(true);

    const fetchSelectedCourse = async () => {
      try {
        const [product, instructor] = await Promise.all([
          fetchRandomProductById(courseId),
          fetchRandomUserById(courseId),
        ]);

        if (isMounted) {
          setRemoteCourse(mapProductAndInstructorToCourse(product, instructor));
        }
      } catch {
      } finally {
        if (isMounted) {
          setIsLoadingCourse(false);
        }
      }
    };

    void fetchSelectedCourse();

    return () => {
      isMounted = false;
    };
  }, [cachedCourse, courseId]);

  useEffect(() => {
    if (course) {
      setSelectedCourse(course);
    }
  }, [course, setSelectedCourse]);

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
  }, [
    course?.title,
    courseId,
    enroll,
    isEnrolled,
    isEnrolling,
  ]);

  const handleUnenroll = useCallback(async () => {
    if (!__DEV__ || !isEnrolled) {
      return;
    }

    try {
      await unenroll(courseId);
      setEnrollSuccess(false);
      Toast.show({
        type: "info",
        text1: "Unenrolled (Dev Mode)",
        text2: `Successfully unenrolled from ${course?.title ?? "this course"}.`,
      });
    } catch {
      Toast.show({
        type: "error",
        text1: "Unenroll Failed",
        text2: "Something went wrong while unenrolling.",
      });
    }
  }, [course?.title, courseId, isEnrolled, unenroll]);

  const enrollLabel = useMemo(() => {
    if (isEnrolling) {
      return "Enrolling...";
    }
    if (enrollSuccess || isEnrolled) {
      return "Enrolled";
    }
    return "Enroll";
  }, [enrollSuccess, isEnrolled, isEnrolling]);

  if (isLoadingCourse && !course) {
    return (
      <View
        className="flex-1 bg-background items-center justify-center px-6"
        style={{ paddingTop: insets.top }}
      >
        <ActivityIndicator size="large" color="#ffffff" />
        <Text className="text-muted-foreground mt-3">Loading course...</Text>
      </View>
    );
  }

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
          paddingBottom: insets.bottom + 96,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ paddingTop: insets.top }} className="relative">
          <Image
            source={{
              uri: COURSE_CARD_IMAGE_URI,
            }}
            style={{ width: "100%", height: 220, backgroundColor: "#ffffffa5" }}
            contentFit="cover"
          />
          <View style={StyleSheet.absoluteFill} className="bg-black/25" />
          <View
            className="absolute left-6 right-6 flex-row items-center justify-between"
            style={{ top: insets.top + 12 }}
          >
            <Pressable
              onPress={() => router.back()}
              className="w-11 h-11 rounded-full bg-black/55 border border-white/15 items-center justify-center"
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <Feather name="chevron-left" size={24} color="#fafafa" />
            </Pressable>
            <Pressable
              onPress={() => void handleToggleBookmark()}
              className="w-11 h-11 rounded-full bg-black/55 border border-white/15 items-center justify-center"
              accessibilityRole="button"
              accessibilityLabel={
                isBookmarked ? "Remove bookmark" : "Add bookmark"
              }
            >
              <Feather
                name="bookmark"
                size={21}
                color={isBookmarked ? "#ffffff" : "#d4d4d8"}
              />
            </Pressable>
          </View>
          <View className="absolute bottom-4 left-6 right-6">
            <View className="self-start rounded-md bg-black/55 px-2.5 py-1 border border-white/10 mb-2">
              <Text className="text-foreground text-xs font-medium capitalize">
                {course.category}
              </Text>
            </View>
            <Text className="text-foreground text-3xl font-bold" numberOfLines={2}>
              {course.title}
            </Text>
          </View>
        </View>

        <View className="px-6 pt-4 gap-4">
          <View className="flex-row flex-wrap items-center gap-2">
            <InfoChip icon="star" label={`${course.rating} rating`} />
            <InfoChip icon="briefcase" label={course.brand} />
            <InfoChip icon="users" label={`${course.stock} seats left`} />
          </View>

          <View className="flex-row items-center justify-between gap-4 rounded-lg border border-border bg-card p-4">
            <View>
              <Text className="text-muted-foreground text-xs">Course price</Text>
              <View className="flex-row items-end gap-2">
                <Text className="text-foreground text-2xl font-bold">
                  ${discountedPrice.toFixed(0)}
                </Text>
                <Text className="text-muted-foreground text-sm line-through mb-1">
                  ${course.price}
                </Text>
              </View>
            </View>
            <View className="rounded-md bg-primary px-3 py-1.5">
              <Text className="text-primary-foreground text-sm font-bold">
                {course.discountPercentage}% off
              </Text>
            </View>
          </View>

          <View className="flex-row items-center gap-3 rounded-lg border border-border bg-card p-4">
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
              <Text className="text-muted-foreground text-sm" numberOfLines={1}>
                {course.instructor.email}
              </Text>
            </View>
          </View>

          <View className="rounded-lg border border-border bg-card p-4">
            <Text className="text-lg font-semibold text-foreground mb-2">
              About this course
            </Text>
            <Text className="text-muted-foreground leading-6">
              {course.description}
            </Text>
          </View>

          <View className="flex-row items-center gap-3 rounded-lg border border-border bg-card p-4">
            <View className="w-10 h-10 rounded-full bg-muted items-center justify-center">
              <Feather
                name={isLessonComplete ? "check-circle" : "clock"}
                size={20}
                color={isLessonComplete ? "#22c55e" : "#a1a1aa"}
              />
            </View>
            <View className="flex-1">
              <Text className="text-foreground font-semibold">
                {isLessonComplete ? "Lesson completed" : "Lesson not complete"}
              </Text>
              <Text className="text-muted-foreground text-sm">
                {isLessonComplete
                  ? "Your progress is saved on this device."
                  : "Open the WebView lesson and mark it complete."}
              </Text>
            </View>
          </View>

          <Button
            variant="secondary"
            className="w-full"
            onPress={() =>
              router.push(`/(main)/course/${courseId}/content` as Href)
            }
          >
            <View className="flex-row items-center justify-center gap-2">
              <Feather name="book-open" size={18} color="#fafafa" />
              <Text>Open course content</Text>
            </View>
          </Button>

          {__DEV__ && showDevUnenrollAction && (isEnrolled || enrollSuccess) && (
            <Button
              variant="outline"
              className="w-full border-destructive/30"
              onPress={() => void handleUnenroll()}
            >
              <View className="flex-row items-center justify-center gap-2">
                <Feather name="trash-2" size={18} color="#ef4444" />
                <Text className="text-destructive">Unenroll (Dev Tool)</Text>
              </View>
            </Button>
          )}
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

interface InfoChipProps {
  icon: keyof typeof Feather.glyphMap;
  label: string;
}

const InfoChip = React.memo(function InfoChip({ icon, label }: InfoChipProps) {
  return (
    <View className="flex-row items-center gap-1.5 rounded-md bg-muted/50 px-2.5 py-1.5">
      <Feather name={icon} size={13} color="#a1a1aa" />
      <Text className="text-muted-foreground text-xs">{label}</Text>
    </View>
  );
});
