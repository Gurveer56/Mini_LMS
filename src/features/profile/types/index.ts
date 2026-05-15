import { LoginUser } from "@features/auth/types";

export type { UserStats } from "@features/auth/types";

export interface UpdateAvatarResponse {
  data: LoginUser;
  message: string;
  success: boolean;
  statusCode?: number;
}
