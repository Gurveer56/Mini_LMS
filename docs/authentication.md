# Authentication

Authentication is built around FreeAPI user endpoints and local token persistence.

## Screens

- `RegisterScreen.tsx` sends username, email, password, and role.
- `LoginScreen.tsx` signs in with username and password.
- `ProfileScreen.tsx` loads the current user and supports logout.

## Token Storage

Access token, refresh token, and user data are stored through `expo-secure-store` wrappers in `src/lib/storage/secureStorage.ts`. Sensitive values are not stored in AsyncStorage.

## Axios Flow

`src/lib/api/axios.ts` creates the shared Axios client.

Request interceptor:

- Skips auth headers for login, register, refresh token, and public routes.
- Reads the access token from SecureStore.
- Adds `Authorization: Bearer <token>` to protected requests.

Response interceptor:

- Detects `401`, `403`, expired JWT, malformed token, and similar auth errors.
- Runs one refresh request at a time.
- Queues failed requests while refresh is in progress.
- Retries queued requests with the fresh access token.
- Clears local auth and returns to unauthenticated state if refresh fails.

This keeps the user signed in when the access token expires but the refresh token is still valid.

## Profile

The profile screen calls `/users/current-user`, updates the local auth store, shows enrollment stats, allows local avatar selection, exposes developer test actions, and logs out through the auth store.
