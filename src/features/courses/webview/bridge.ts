import { Platform } from "react-native";
import Constants from "expo-constants";
import {
  WEBVIEW_MESSAGE_VERSION,
  WEBVIEW_TRUSTED_BASE_URL,
  type CourseWebPayload,
  type NativeToWebMessage,
  type WebToNativeMessage,
  type WebToNativeMessageType,
} from "./types";

const ALLOWED_WEB_TO_NATIVE: ReadonlySet<WebToNativeMessageType> = new Set([
  "WEBVIEW_READY",
  "LESSON_COMPLETE",
  "REQUEST_GO_BACK",
]);

export interface NativeWebViewHeaders {
  "X-App-Id": string;
  "X-App-Version": string;
  "X-Platform": string;
  "X-Course-Id": string;
  "X-User-Id"?: string;
}

export const buildNativeWebViewHeaders = (params: {
  courseId: number;
  userId?: string;
}): NativeWebViewHeaders => ({
  "X-App-Id": "mini-lms",
  "X-App-Version": Constants.expoConfig?.version ?? "1.0.0",
  "X-Platform": Platform.OS,
  "X-Course-Id": String(params.courseId),
  ...(params.userId ? { "X-User-Id": params.userId } : {}),
});

export const buildInjectedContextScript = (
  headers: NativeWebViewHeaders,
  course: CourseWebPayload,
): string => {
  const headersJson = JSON.stringify(headers);
  const courseJson = JSON.stringify(course);

  return `
    (function () {
      window.__NATIVE_HEADERS__ = ${headersJson};
      window.__COURSE_PAYLOAD__ = ${courseJson};
    })();
    true;
  `;
};

export const buildNativeToWebScript = (
  message: NativeToWebMessage,
): string => {
  const serialized = JSON.stringify(message);
  return `
    (function () {
      window.dispatchEvent(new MessageEvent('message', { data: ${serialized} }));
    })();
    true;
  `;
};

export const createNativeToWebMessage = (
  payload: CourseWebPayload,
): NativeToWebMessage => ({
  type: "COURSE_UPDATE",
  payload,
  v: WEBVIEW_MESSAGE_VERSION,
});

export const parseWebToNativeMessage = (
  raw: string,
): WebToNativeMessage | null => {
  try {
    const parsed = JSON.parse(raw) as Partial<WebToNativeMessage>;
    if (
      !parsed ||
      typeof parsed.type !== "string" ||
      parsed.v !== WEBVIEW_MESSAGE_VERSION
    ) {
      return null;
    }

    if (!ALLOWED_WEB_TO_NATIVE.has(parsed.type as WebToNativeMessageType)) {
      return null;
    }

    if (
      parsed.payload !== undefined &&
      (typeof parsed.payload !== "object" || parsed.payload === null)
    ) {
      return null;
    }

    return {
      type: parsed.type as WebToNativeMessageType,
      payload: parsed.payload,
      v: WEBVIEW_MESSAGE_VERSION,
    };
  } catch {
    return null;
  }
};

export const isAllowedWebViewNavigation = (url: string): boolean => {
  if (!url || url === "about:blank") {
    return true;
  }

  try {
    const parsed = new URL(url);
    return (
      parsed.protocol === "file:" ||
      (parsed.protocol === "https:" &&
        parsed.hostname === new URL(WEBVIEW_TRUSTED_BASE_URL).hostname)
    );
  } catch {
    return false;
  }
};
