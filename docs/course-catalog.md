# Course Catalog

The assignment asks for a native course catalog. FreeAPI does not provide LMS courses directly, so the app maps public product data and random user data into a course model.

## API

`src/features/courses/api/index.ts` loads:

- `/public/randomproducts`
- `/public/randomusers`

The two responses are combined in `mapProductsToCourses`. Products become course cards. Users become instructors.

## Course List

The catalog supports:

- Initial loading with shimmer UI
- Pull to refresh
- Pagination
- Search
- Bookmark-only filter
- Cached course list
- Offline refresh guard
- Retry UI after API failures

Main files:

- `CoursesScreen.tsx`
- `CoursesCatalog.tsx`
- `CoursesLegendList.tsx`
- `useCoursesStore.ts`

## Course Details

The detail screen shows:

- Course title, category, brand, description
- Instructor image, name, and email
- Rating, price, discount, and seats
- Bookmark toggle
- Enrollment action
- Lesson completion state
- Link to the WebView lesson screen

Enrollment and bookmarks are persisted locally so the state survives app restarts.
