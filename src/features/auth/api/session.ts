import { api } from "@lib/api/axios";
import { CurrentUserResponse } from "../types";

export const getCurrentUser = async () => {
  const response = await api.get<CurrentUserResponse>("/users/current-user");
  return response.data;
};

export const logoutUser = async () => {
  const response = await api.post("/users/logout");
  return response.data;
};
