import { getCurrentUser } from "@features/auth/api/session";
import { LoginUser } from "@features/auth/types";
import { api } from "@lib/api/axios";
import { Platform } from "react-native";
import { UpdateAvatarResponse } from "../types";

export const updateAvatar = async (localUri: string): Promise<LoginUser> => {
  const formData = new FormData();

  const filename = localUri.split("/").pop() || "avatar.jpg";
  const extension = /\.(\w+)$/.exec(filename)?.[1]?.toLowerCase();
  const mimeType =
    extension === "png"
      ? "image/png"
      : extension === "webp"
        ? "image/webp"
        : "image/jpeg";

  formData.append("avatar", {
    uri: localUri,
    name: filename,
    type: mimeType,
  } as unknown as Blob);

  const response = await api.patch<UpdateAvatarResponse>(
    "/users/avatar",
    formData,
  );

  const body = response.data;

  if (body.data?.avatar?.url) {
    return body.data;
  }

  const freshUser = await getCurrentUser();
  return freshUser.data;
};
