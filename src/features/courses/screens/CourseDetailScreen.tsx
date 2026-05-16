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
        // Keep the existing "Course not found" fallback if the selected ID fails.
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
        <View style={{ paddingTop: insets.top }}>
          <Image
            source={{
              // API thumbnails are unreliable for this demo. Restore the API
              // thumbnail if testers ask to validate product images.
              // uri: course.thumbnail || COURSE_CARD_IMAGE_URI,
              uri: COURSE_CARD_IMAGE_URI,
            }}
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
                {course.category} - {course.brand}
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
            <InfoPill label="Rating" value={`${course.rating} stars`} />
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

          <View className="flex-row items-center gap-3 bg-muted/30 rounded-xl p-3">
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
              <Text>View course content (WebView)</Text>
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
