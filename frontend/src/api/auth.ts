import api from './axios';

interface RegisterData {
  username: string;
  email: string;
  password: string;
  avatar?: string;
}

interface LoginData {
  email: string;
  password: string;
}

export const authApi = {
  register: (data: RegisterData) => api.post('/auth/register', data),
  login: (data: LoginData) => api.post('/auth/login', data),
};
