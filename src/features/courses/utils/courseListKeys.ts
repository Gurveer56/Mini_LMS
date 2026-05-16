import { Course } from "../types";

export const getCourseItemKey = (course: Course): string => `course-${course.id}`;

export const courseKeyExtractor = (course: Course): string =>
  getCourseItemKey(course);
