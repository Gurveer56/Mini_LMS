# HOE Assignment App

Welcome to the HOE Assignment project! This is a modern, feature-sliced React Native application powered by Expo. It features a completely custom, sleek Dark Mode UI, built-in global notifications, and robust API interceptors.

## What's Inside?

We've architected this project using **Feature-Sliced Design**. This means the codebase is separated cleanly by features, rather than tossing everything into giant `components` or `screens` folders. 

* **`app/`**: This is strictly for **Expo Router**. No deep business logic lives here. It just defines our URLs and mounts the screens from `src`.
* **`src/features/`**: The core logic! This houses isolated modules like `auth` which contain their own `api`, `components`, `screens`, `types`, etc.
* **`src/shared/`**: Global reusable components (like our custom `<Input />` and polymorphic `<Button />`), hooks, and utilities.
* **`src/lib/`**: Global setups like our Axios instance and async storage wrappers.
* **`src/theme/`**: The global styling tokens (check out `colors.ts` for our dark theme palette).

## Getting Started

Follow these steps to get the app running on your machine:

### 1. Install Dependencies
Make sure you are in the project root, then install the packages:
```bash
npm install
```

### 2. Environment Variables
This project relies on environment variables for API connections.
* Look for or create an `.env` file in the root directory.
* Add your API URL like this:
```env
EXPO_PUBLIC_API_URL=https://api.freeapi.app/api/v1
```

*(Note: Because we prefix with `EXPO_PUBLIC_`, Expo will automatically bundle this for us!)*

### 3. Run the Development Server
You can fire up the Expo dev server with:
```bash
npx expo start
```
* **To run on Android (Emulator or physical device via USB):** press `a` or run `npx expo run:android`
* **To run on iOS (Simulator):** press `i` or run `npx expo run:ios`
* **To run on Web:** press `w`

*(Pro tip: If you change `.env` or `tsconfig.json` paths, you might need to clear your cache. Just run `npx expo start -c` to wipe it clean and restart.)*

## Key Features Implemented So Far

1. **Custom Theming**: We use a beautiful dark theme (`#09090b` backgrounds, `#ffffff` accents) injected throughout the entire app natively.
2. **Robust API Interceptors**: We use Axios to catch `401` errors, manage token refreshes automatically, and automatically attach `Bearer` tokens to every request.
3. **Advanced Error Handling**: If an API returns nested validation errors, our logic automatically digs into the response payload and extracts the exact string (like "Username must be lowercase") to show the user.
4. **Custom Toast Notifications**: We completely redesigned the default `react-native-toast-message` component to look like a premium, floating dark card with drop shadows and Feather icons.

Enjoy building!
