import { Asset } from "expo-asset";
import { useEffect, useState } from "react";
import type { WebViewSource } from "react-native-webview/lib/WebViewTypes";
import {
  buildInjectedContextScript,
  buildNativeWebViewHeaders,
  type NativeWebViewHeaders,
} from "./bridge";
import { WEBVIEW_TRUSTED_BASE_URL, type CourseWebPayload } from "./types";

const HTML_MODULE = require("../../../../assets/webview/course-content.html");

const FALLBACK_HTML = `<!DOCTYPE html>
<html><body style="background:#09090b;color:#fafafa;font-family:sans-serif;padding:16px">
<p>Course template could not be loaded from assets.</p>
<script>
window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({ type: "WEBVIEW_READY", payload: {}, v: 1 }));
</script>
</body></html>`;

export interface CourseWebViewSourceState {
  source: WebViewSource | null;
  headers: NativeWebViewHeaders | null;
  injectedJavaScriptBeforeContentLoaded: string;
  isLoading: boolean;
  loadWarning: string | null;
}

export const useCourseWebViewSource = (
  course: CourseWebPayload | null,
  userId?: string,
): CourseWebViewSourceState => {
  const [source, setSource] = useState<WebViewSource | null>(null);
  const [headers, setHeaders] = useState<NativeWebViewHeaders | null>(null);
  const [injectedJavaScriptBeforeContentLoaded, setInjectedScript] =
    useState("true;");
  const [isLoading, setIsLoading] = useState(true);
  const [loadWarning, setLoadWarning] = useState<string | null>(null);

  useEffect(() => {
    if (!course) {
      setSource(null);
      setHeaders(null);
      setIsLoading(false);
      setLoadWarning("Course not found");
      return;
    }

    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      setLoadWarning(null);

      const nativeHeaders = buildNativeWebViewHeaders({
        courseId: course.id,
        userId,
      });

      const injected = buildInjectedContextScript(nativeHeaders, course);

      try {
        const asset = Asset.fromModule(HTML_MODULE);
        await asset.downloadAsync();

        const uri = asset.localUri ?? asset.uri;
        if (!uri) {
          throw new Error("Could not resolve bundled course HTML.");
        }

        if (cancelled) {
          return;
        }

        setHeaders(nativeHeaders);
        setInjectedScript(injected);
        setSource({
          uri,
          headers: nativeHeaders,
        });
      } catch {
        if (cancelled) {
          return;
        }

        setHeaders(nativeHeaders);
        setInjectedScript(injected);
        setSource({
          html: FALLBACK_HTML,
          baseUrl: WEBVIEW_TRUSTED_BASE_URL,
          headers: nativeHeaders,
        });
        setLoadWarning(
          "Using inline fallback HTML. Bundled template could not be resolved.",
        );
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [course, userId]);

  return {
    source,
    headers,
    injectedJavaScriptBeforeContentLoaded,
    isLoading,
    loadWarning,
  };
};
