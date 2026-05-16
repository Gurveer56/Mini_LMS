import type { Course } from "@features/courses/types";

export interface CourseWebPayload {
  id: number;
  title: string;
  description: string;
  category: string;
  brand: string;
  price: number;
  rating: number;
  stock: number;
  discountPercentage: number;
  instructor: {
    name: string;
    email: string;
  };
}

export const WEBVIEW_MESSAGE_VERSION = 1 as const;

export type WebToNativeMessageType =
  | "WEBVIEW_READY"
  | "LESSON_COMPLETE"
  | "REQUEST_GO_BACK";

export type NativeToWebMessageType = "COURSE_UPDATE";

export interface WebToNativeMessage {
  type: WebToNativeMessageType;
  payload?: Record<string, unknown>;
  v: typeof WEBVIEW_MESSAGE_VERSION;
}

export interface NativeToWebMessage {
  type: NativeToWebMessageType;
  payload: CourseWebPayload;
  v: typeof WEBVIEW_MESSAGE_VERSION;
}

export const WEBVIEW_TRUSTED_BASE_URL = "https://app.local";

export const toCourseWebPayload = (course: Course): CourseWebPayload => ({
  id: course.id,
  title: course.title,
  description: course.description,
  category: course.category,
  brand: course.brand,
  price: course.price,
  rating: course.rating,
  stock: course.stock,
  discountPercentage: course.discountPercentage,
  instructor: {
    name: course.instructor.name,
    email: course.instructor.email,
  },
});
