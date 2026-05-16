import { getCurrentUser } from "@features/auth/api/session";
import { LoginUser } from "@features/auth/types";
import { apiClient } from "@lib/api/axios";
import { UpdateAvatarResponse } from "../types";

export const updateAvatar = async (
  localUri: string,
  fileName?: string,
  mimeType?: string,
): Promise<LoginUser> => {
  const formData = new FormData();

  const finalFileName =
    fileName || localUri.split("/").pop() || `avatar_${Date.now()}.jpg`;

  let finalMimeType = mimeType;
  if (!finalMimeType) {
    const extension = /\.(\w+)$/.exec(finalFileName)?.[1]?.toLowerCase();
    finalMimeType =
      extension === "png"
        ? "image/png"
        : extension === "webp"
          ? "image/webp"
          : "image/jpeg";
  }

  const avatarPart = {
    uri: localUri,
    name: finalFileName,
    type: finalMimeType,
  } as unknown as Blob;

  formData.append("avatar", avatarPart);

  const response = await apiClient.patch<UpdateAvatarResponse>(
    "/users/avatar",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      transformRequest: (data) => data,
    },
  );

  const body = response.data;

  if (body.data?.avatar?.url) {
    return body.data;
  }

  const freshUser = await getCurrentUser();
  return freshUser.data;
};
