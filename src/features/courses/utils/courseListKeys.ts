import { Course } from "../types";

/** Stable list keys for LegendList / keyExtractor */
export const getCourseItemKey = (course: Course): string => `course-${course.id}`;

export const courseKeyExtractor = (course: Course): string =>
  getCourseItemKey(course);
