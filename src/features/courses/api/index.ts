import { consumeDummyCourseApiError } from "@lib/api/debugErrors";
import { createSimulatedApiError } from "@lib/api/errors";
import { api } from "@lib/api/axios";
import { withRetry } from "@lib/api/retry";
import {
  PaginatedResponse,
  RandomProduct,
  RandomUser,
} from "../types";

export const PAGE_SIZE = 20;

const assertNoDummyFailure = (): void => {
  if (consumeDummyCourseApiError()) {
    throw createSimulatedApiError();
  }
};

const fetchInstructorsRequest = async (page: number, limit: number) => {
  assertNoDummyFailure();
  const response = await api.get<PaginatedResponse<RandomUser>>(
    "/public/randomusers",
    { page, limit },
  );
  return response.data;
};

const fetchCourseProductsRequest = async (page: number, limit: number) => {
  assertNoDummyFailure();
  const response = await api.get<PaginatedResponse<RandomProduct>>(
    "/public/randomproducts",
    { page, limit },
  );
  return response.data;
};

export const fetchInstructors = async (page: number, limit = PAGE_SIZE) =>
  withRetry(() => fetchInstructorsRequest(page, limit), { maxAttempts: 3 });

export const fetchCourseProducts = async (page: number, limit = PAGE_SIZE) =>
  withRetry(() => fetchCourseProductsRequest(page, limit), { maxAttempts: 3 });

export const fetchCourseCatalogPage = async (page: number, limit = PAGE_SIZE) =>
  withRetry(
    async () => {
      assertNoDummyFailure();
      const [usersResponse, productsResponse] = await Promise.all([
        fetchInstructorsRequest(page, limit),
        fetchCourseProductsRequest(page, limit),
      ]);
      return { usersResponse, productsResponse };
    },
    { maxAttempts: 3 },
  );
