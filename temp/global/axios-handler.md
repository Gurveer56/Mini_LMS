# Axios Token Refresh Handler Documentation

This document explains the logic implemented in `src/lib/api/axios.ts` for handling seamless authentication using Access and Refresh tokens.

## Overview

The handler uses **Axios Interceptors** to manage authentication state automatically:
1. **Request Interceptor**: Injects the `accessToken` from secure storage into the `Authorization` header of every request.
2. **Response Interceptor**: Monitors responses for `401 Unauthorized` errors, which trigger the refresh flow.

## The Refresh Flow Logic

### 1. Detection
When a request fails with a `401` status code, the interceptor checks if it has already tried to refresh (`originalRequest._retry`).

### 2. Queueing (Race Condition Handling)
If multiple requests fail simultaneously:
- The **first** request sets `isRefreshing = true` and initiates the refresh API call.
- All **subsequent** requests are added to a `failedQueue`. They return a `Promise` that remains pending until the refresh completes.

### 3. Token Refresh
The handler calls the `/users/refresh-token` endpoint using the stored `refreshToken`.
- **On Success**:
    - The new `accessToken` and `refreshToken` are saved to secure storage.
    - The `failedQueue` is processed: all pending promises are resolved with the new token, and their original requests are re-executed.
    - The initial failed request is also re-executed with the new token.
- **On Failure**:
    - The `failedQueue` is rejected.
    - All local auth data is cleared (`accessToken`, `refreshToken`, `user`).
    - The user is effectively logged out.

## Implementation Details

- **`isRefreshing`**: A boolean flag to prevent multiple simultaneous refresh calls.
- **`failedQueue`**: An array of objects containing `resolve` and `reject` functions for pending requests.
- **`processQueue()`**: A helper function to clear the queue once the refresh process ends.

## Key Benefits
- **Zero-Latency for User**: The user never sees a 401 error or a logout if the refresh token is still valid.
- **Efficiency**: Only one API call is made to refresh tokens even if 10 requests fail at the exact same moment.
- **Security**: Uses `expo-secure-store` for sensitive token storage.
