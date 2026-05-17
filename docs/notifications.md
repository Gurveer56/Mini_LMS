# Notifications

The app uses `expo-notifications` for local notifications.

## Permission

`ensureNotificationPermission` checks the current permission and requests it when needed. If the user denies permission, the app skips scheduling and keeps running normally.

## Enrollment Milestone

When the user enrolls in the fifth unique course, `useEnrollmentStore` triggers `showFiveEnrollmentsNotification`.

Notification:

- Title: `5 courses enrolled`
- Body: `You now have 5 active course enrollments.`

## Background Reminder

`app/_layout.tsx` listens to app state changes.

- When the app goes to background, it schedules a 24-hour reminder.
- When the app becomes active, it clears scheduled reminders.

Reminder notifications are handled quietly by the notification handler so they do not behave like urgent alerts while the app is active.

