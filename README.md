# Mini LMS

Mini LMS is a React Native Expo assignment project for a small learning app. It includes authentication, a native course catalog, course details, enrollment state, local notifications, a WebView lesson screen, profile management, offline handling, and API error handling.

## Quick Setup

Requirements:

- Node.js 20 or newer
- npm
- Expo CLI through `npx`
- Android Studio for Android builds, or Expo Go for quick device testing /
- or Development Build installed on android device

Install dependencies:

```bash
npm install
```

Create `.env` in the project root:

```env
EXPO_PUBLIC_API_URL=https://api.freeapi.app/api/v1
```

Start the app:

```bash
npx expo start
```

Run targets:

```bash
npx expo run:android
npx expo start --web
```

If native assets or environment values look stale, restart Expo with:

```bash
npx expo start -c
```

## What Is Included

- Email/username registration and login
- Secure token storage with automatic refresh handling
- Course list built from FreeAPI products and users
- Search, bookmarks, pagination, pull to refresh, and cached course data
- Course details with instructor information and enrollment
- Profile screen with current user API, avatar picker, local stats, and logout
- Local notifications for enrollment milestone and background reminder
- WebView lesson screen using bundled HTML, headers, injected metadata, and validated messages
- Offline banner, retry states, shimmer loading, and clear error UI

## Documentation

The submission notes are split by topic:

- [Documentation Index](./docs/README.md)
- [Setup](./docs/setup.md)
- [Assignment Checklist](./docs/assignment-checklist.md)
- [Project Structure](./docs/project-structure.md)
- [Authentication](./docs/authentication.md)
- [Course Catalog](./docs/course-catalog.md)
- [WebView Integration](./docs/webview-integration.md)
- [Notifications](./docs/notifications.md)
- [State and Performance](./docs/state-performance.md)
- [Error Handling](./docs/error-handling.md)

## Main Commands

```bash
npm run start
npm run android
npm run web
npm run lint
```