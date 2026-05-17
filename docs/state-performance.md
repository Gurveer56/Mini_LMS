# State And Performance

State is handled with Zustand. Each store has a clear job instead of one large global store.

## Stores

| Store | Purpose |
| --- | --- |
| `useAuthStore` | User, tokens, auth status, local avatar |
| `useCoursesStore` | Course list, pagination, cache, loading and error state |
| `useCourseDetailStore` | Selected course and lesson completion |
| `useEnrollmentStore` | Enrolled course IDs |
| `useBookmarkStore` | Bookmarked course IDs |
| `usePreferencesStore` | Search/filter and developer preferences |
| `useNetworkStore` | Online/offline status |

## Persistence

- Tokens use SecureStore.
- Course cache, enrollments, bookmarks, preferences, and local avatar use AsyncStorage wrappers.
- App bootstrap hydrates state before showing the main router.

## List Performance

The course list uses `@legendapp/list` for smoother rendering with larger datasets. Pagination avoids loading all pages at once, and the list does not fetch more while search, bookmark-only mode, offline state, or an API error is active.

## UI Loading States

The app uses shimmer rows for first load, compact retry blocks when cached data exists, and full retry states when no data can be shown.
