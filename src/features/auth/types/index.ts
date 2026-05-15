export interface RegisterRequest {
  email: string;
  password?: string;
  role?: string;
  username: string;
}

export interface RegisterResponse {
  data: any;
  message: string;
  success: boolean;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginUser {
  _id: string;
  username: string;
  email: string;
  role: string;
  isEmailVerified: boolean;
  loginType: string;
  avatar: {
    _id: string;
    url: string;
    localPath: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface LoginResponse {
  data: {
    accessToken: string;
    refreshToken: string;
    user: LoginUser;
  };
  message: string;
  statusCode: number;
  success: boolean;
}

export interface UserStats {
  enrolledCourses: number;
  progressPercent: number;
}

export interface CurrentUserResponse {
  data: LoginUser & {
    stats?: {
      enrolledCourses?: number;
      progress?: number;
      progressPercent?: number;
    };
  };
  message: string;
  statusCode: number;
  success: boolean;
}
