# WebView Integration

The WebView lesson screen is opened from course details with **View course content (WebView)**.

## Files

| File | Purpose |
| --- | --- |
| `assets/webview/course-content.html` | Bundled HTML lesson view |
| `src/features/courses/webview/types.ts` | Sanitized course payload types |
| `src/features/courses/webview/bridge.ts` | Headers, injected script, navigation rules, message parser |
| `src/features/courses/webview/useCourseWebViewSource.ts` | Resolves the local HTML asset and attaches headers |
| `src/features/courses/screens/CourseContentWebViewScreen.tsx` | Native WebView screen and message handling |

## Native To Web

The native side passes non-sensitive metadata through headers:

```ts
{
  "X-App-Id": "mini-lms",
  "X-App-Version": "1.0.0",
  "X-Platform": Platform.OS,
  "X-Course-Id": String(course.id),
  "X-User-Id": userId
}
```

The HTML page cannot read its own request headers, so the same safe metadata is also injected into `window.__NATIVE_HEADERS__` before content loads. Tokens are never sent to the WebView.

## Web To Native

The HTML posts JSON messages through `ReactNativeWebView.postMessage`.

Accepted messages:

- `WEBVIEW_READY`
- `LESSON_COMPLETE`
- `REQUEST_GO_BACK`

`parseWebToNativeMessage` rejects malformed JSON, unknown message types, and unsupported versions.

## Safety

- The page is bundled with the app.
- Navigation is restricted with an allowlist.
- Cookies and DOM storage are disabled.
- Only sanitized course fields are injected.
- WebView errors show a retry screen.
