# Assignment Checklist

| Area | Status | Where to check |
| --- | --- | --- |
| User registration | Done | `src/features/auth/screens/RegisterScreen.tsx` |
| User login | Done | `src/features/auth/screens/LoginScreen.tsx` |
| Token storage | Done | `src/lib/storage/secureStorage.ts` |
| Token refresh | Done | `src/lib/api/axios.ts`, `src/lib/auth/refreshTokens.ts` |
| Profile screen | Done | `src/features/profile/screens/ProfileScreen.tsx` |
| Avatar picker | Done | `src/features/profile/screens/ProfileScreen.tsx` |
| Native course list | Done | `src/features/courses/components/CoursesCatalog.tsx` |
| Pagination | Done | `src/features/courses/store/useCoursesStore.ts` |
| Search and filters | Done | `src/features/courses/components/CourseSearchHeader.tsx`, `CourseFiltersRow.tsx` |
| Course details | Done | `src/features/courses/screens/CourseDetailScreen.tsx` |
| Enrollment | Done | `src/features/courses/store/useEnrollmentStore.ts` |
| Bookmarks | Done | `src/features/courses/store/useBookmarkStore.ts` |
| Local notifications | Done | `src/lib/notifications/courseNotifications.ts`, `app/_layout.tsx` |
| WebView content screen | Done | `src/features/courses/screens/CourseContentWebViewScreen.tsx` |
| Native to web headers | Done | `src/features/courses/webview/bridge.ts` |
| Web to native messages | Done | `assets/webview/course-content.html`, `bridge.ts` |
| Network error handling | Done | `src/lib/api/errors.ts`, `src/shared/components/ApiErrorView.tsx` |
| Offline state | Done | `src/store/useNetworkStore.ts`, `src/shared/components/OfflineBanner.tsx` |
| List optimization | Done | `@legendapp/list` in `CoursesLegendList.tsx` |
| Documentation | Done | `README.md` and `docs/` |

The course data is mapped from FreeAPI public products and users because the assignment needs a course experience, while the public API gives generic sample data. The mapping is isolated in `src/features/courses/utils/mapCourses.ts`.
