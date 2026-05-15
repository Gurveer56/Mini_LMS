import { useEnrollmentStore } from "@features/courses/store/useEnrollmentStore";
import { UserStats } from "@features/auth/types";
import { useEffect, useMemo } from "react";

const PROGRESS_TARGET_COURSES = 10;

export const useProfileStats = (): UserStats & { isHydrated: boolean } => {
  const enrolledIds = useEnrollmentStore((state) => state.enrolledIds);
  const hydrate = useEnrollmentStore((state) => state.hydrate);
  const isHydrated = useEnrollmentStore((state) => state.isHydrated);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  return useMemo(() => {
    const enrolledCourses = enrolledIds.size;
    const progressPercent =
      enrolledCourses === 0
        ? 0
        : Math.min(
            100,
            Math.round((enrolledCourses / PROGRESS_TARGET_COURSES) * 100),
          );

    return {
      enrolledCourses,
      progressPercent,
      isHydrated,
    };
  }, [enrolledIds, isHydrated]);
};
