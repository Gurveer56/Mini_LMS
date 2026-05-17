# Error Handling

Error handling is centralized where possible and kept visible in the UI.

## API Errors

`src/lib/api/errors.ts` normalizes Axios and unknown errors into a shape the UI can render. It handles:

- Timeout
- Network failure
- HTTP status codes
- API messages
- Validation errors

`ApiErrorView` shows retry actions and clear messages.

## Retry

`src/lib/api/retry.ts` wraps unstable course requests with retry attempts. Course list fetching uses this helper for public product and user APIs.

## Offline

`useNetworkStore` watches connectivity through NetInfo. The root layout shows `OfflineBanner`, and course refresh/load-more actions avoid new requests while offline.

## WebView Errors

The WebView screen handles:

- Missing local HTML asset
- WebView render errors
- HTTP errors
- Missing course data
- Invalid messages from the web page

When the WebView fails, the user gets a retry button instead of a blank screen.
