/** AsyncStorage keys (non-sensitive app data) */
export const APP_STORAGE_KEYS = {
  courseBookmarks: "course_bookmarks",
  courseEnrollments: "course_enrollments",
  courseListCache: "course_list_cache",
  userPreferences: "user_preferences",
} as const;

/** SecureStore keys (auth tokens & user snapshot) */
export const SECURE_STORAGE_KEYS = {
  accessToken: "accessToken",
  refreshToken: "refreshToken",
  user: "user",
} as const;
