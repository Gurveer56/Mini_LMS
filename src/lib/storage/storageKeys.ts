export const APP_STORAGE_KEYS = {
  courseBookmarks: "course_bookmarks",
  courseEnrollments: "course_enrollments",
  courseLessonCompletions: "course_lesson_completions",
  courseListCache: "course_list_cache",
  userPreferences: "user_preferences",
  localAvatar: "local_avatar",
} as const;

export const SECURE_STORAGE_KEYS = {
  accessToken: "accessToken",
  refreshToken: "refreshToken",
  user: "user",
} as const;
