# Setup

This project uses Expo Router with React Native, TypeScript, NativeWind, Zustand, Axios, Expo SecureStore, Expo Notifications, Expo Image Picker, and React Native WebView.

## 1. Install

```bash
npm install
```

## 2. Configure API

Create `.env` in the project root:

```env
EXPO_PUBLIC_API_URL=https://api.freeapi.app/api/v1
```

The app falls back to the same URL in `src/lib/api/axios.ts`, but keeping the value in `.env` makes the setup explicit.

## 3. Start Development Server

```bash
npx expo start
```

Use the Expo terminal shortcuts:

- `a` for Android
- scan the QR code for a physical device

For a native Android build:

```bash
npx expo run:android
```

## 4. Common Fixes

Clear Metro cache after changing `.env`, app config, icons, or native assets:

```bash
npx expo start -c
```

If Android still shows old app assets, rebuild the native app:

```bash
npx expo run:android
```
