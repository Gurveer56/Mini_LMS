import { api } from '@lib/api/axios';
import { RegisterRequest, RegisterResponse, LoginRequest, LoginResponse } from '../types';

export const registerUser = async (data: RegisterRequest) => {
  const response = await api.post<RegisterResponse>('/users/register', data);
  return response.data;
};

export const loginUser = async (data: LoginRequest) => {
  const response = await api.post<LoginResponse>('/users/login', data);
  return response.data;
};
