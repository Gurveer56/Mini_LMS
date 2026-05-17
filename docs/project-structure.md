# Project Structure

The project keeps routing thin and feature code inside `src`.

```text
app/
  Expo Router routes only

src/features/
  auth/
  courses/
  home/
  profile/

src/lib/
  api/
  auth/
  notifications/
  storage/

src/shared/
  reusable UI and shared components

src/store/
  app-wide network and preference state

assets/
  images, videos, and WebView HTML
```

## Routing

`app/` contains route files such as:

- `app/(auth)/login.tsx`
- `app/(main)/(tabs)/home.tsx`
- `app/(main)/course/[id].tsx`
- `app/(main)/course/[id]/content.tsx`

Each route mounts a screen from `src/features`. This keeps business logic out of the router layer.

## Feature Folders

Each feature owns its screens, API calls, local components, stores, and types. For example, courses contain catalog API calls, course mapping, course screens, list components, WebView bridge code, and course-related Zustand stores.
