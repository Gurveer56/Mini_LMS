import { AxiosError } from "axios";

export type ApiErrorCode =
  | "NETWORK"
  | "TIMEOUT"
  | "SERVER"
  | "UNAUTHORIZED"
  | "UNKNOWN"
  | "SIMULATED";

export interface ApiErrorState {
  message: string;
  code: ApiErrorCode;
  canRetry: boolean;
  statusCode?: number;
}

const DEFAULT_MESSAGES: Record<ApiErrorCode, string> = {
  NETWORK:
    "Unable to reach the server. Check your connection and try again.",
  TIMEOUT: "The request took too long. Please try again.",
  SERVER: "Something went wrong on our end. Please try again shortly.",
  UNAUTHORIZED: "Your session has expired. Please sign in again.",
  UNKNOWN: "Something went wrong. Please try again.",
  SIMULATED: "Simulated API failure for testing. Tap Retry to load courses.",
};

export const isNetworkFailure = (error: unknown): boolean => {
  if (!error) {
    return false;
  }

  if (error instanceof AxiosError) {
    return (
      !error.response &&
      (error.code === "ERR_NETWORK" ||
        error.code === "ECONNABORTED" ||
        error.message.toLowerCase().includes("network"))
    );
  }

  return error instanceof TypeError;
};

export const isTimeoutFailure = (error: unknown): boolean => {
  if (error instanceof AxiosError) {
    return error.code === "ECONNABORTED" || error.message.includes("timeout");
  }
  return false;
};

export const parseApiError = (error: unknown): ApiErrorState => {
  if (error instanceof AxiosError) {
    if (error.message === "SIMULATED_API_ERROR") {
      return {
        message: DEFAULT_MESSAGES.SIMULATED,
        code: "SIMULATED",
        canRetry: true,
      };
    }

    if (isTimeoutFailure(error)) {
      return {
        message: DEFAULT_MESSAGES.TIMEOUT,
        code: "TIMEOUT",
        canRetry: true,
      };
    }

    if (isNetworkFailure(error)) {
      return {
        message: DEFAULT_MESSAGES.NETWORK,
        code: "NETWORK",
        canRetry: true,
      };
    }

    const status = error.response?.status;
    const responseMessage = extractResponseMessage(error);

    if (status === 401) {
      return {
        message: responseMessage ?? DEFAULT_MESSAGES.UNAUTHORIZED,
        code: "UNAUTHORIZED",
        canRetry: false,
        statusCode: status,
      };
    }

    if (status && status >= 500) {
      return {
        message: responseMessage ?? DEFAULT_MESSAGES.SERVER,
        code: "SERVER",
        canRetry: true,
        statusCode: status,
      };
    }

    return {
      message: responseMessage ?? DEFAULT_MESSAGES.UNKNOWN,
      code: "UNKNOWN",
      canRetry: true,
      statusCode: status,
    };
  }

  if (error instanceof Error && error.message === "SIMULATED_API_ERROR") {
    return {
      message: DEFAULT_MESSAGES.SIMULATED,
      code: "SIMULATED",
      canRetry: true,
    };
  }

  return {
    message: DEFAULT_MESSAGES.UNKNOWN,
    code: "UNKNOWN",
    canRetry: true,
  };
};

const extractResponseMessage = (error: AxiosError): string | null => {
  const data = error.response?.data;
  if (!data || typeof data !== "object") {
    return null;
  }

  if ("message" in data && typeof data.message === "string") {
    return data.message;
  }

  return null;
};

export const createSimulatedApiError = (): AxiosError => {
  const error = new AxiosError("SIMULATED_API_ERROR");
  error.code = "ERR_NETWORK";
  return error;
};
