import { isNetworkFailure, isTimeoutFailure, parseApiError } from "./errors";

export interface RetryOptions {
  maxAttempts?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  shouldRetry?: (error: unknown, attempt: number) => boolean;
}

const defaultShouldRetry = (error: unknown): boolean => {
  const parsed = parseApiError(error);
  if (parsed.code === "UNAUTHORIZED" || parsed.code === "SIMULATED") {
    return false;
  }
  return (
    isNetworkFailure(error) ||
    isTimeoutFailure(error) ||
    parsed.code === "SERVER" ||
    parsed.code === "UNKNOWN"
  );
};

const wait = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

export const withRetry = async <T>(
  operation: () => Promise<T>,
  options: RetryOptions = {},
): Promise<T> => {
  const maxAttempts = options.maxAttempts ?? 3;
  const initialDelayMs = options.initialDelayMs ?? 800;
  const maxDelayMs = options.maxDelayMs ?? 4000;
  const shouldRetry = options.shouldRetry ?? defaultShouldRetry;

  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      const isLastAttempt = attempt >= maxAttempts;

      if (isLastAttempt || !shouldRetry(error, attempt)) {
        throw error;
      }

      const delay = Math.min(
        maxDelayMs,
        initialDelayMs * Math.pow(2, attempt - 1),
      );
      await wait(delay);
    }
  }

  throw lastError;
};
