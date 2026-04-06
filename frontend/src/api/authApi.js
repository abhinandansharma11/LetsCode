import axios from 'axios';
import { useAuthStore } from '../store/authStore';

export const authApi = axios.create({
  baseURL: 'http://localhost:3000',
  withCredentials: true,
});

// List of auth endpoints that should NOT trigger auto-redirect on 401
const authEndpoints = ['/user/login', '/user/register', '/user/verify-email', '/user/resend-otp', '/user/forgot-password', '/user/verify-reset-otp', '/user/reset-password'];

authApi.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestUrl = error.config?.url || '';
    const isAuthEndpoint = authEndpoints.some(endpoint => requestUrl.includes(endpoint));

    // Only auto-redirect on 401 for non-auth endpoints (protected routes)
    if (error.response && error.response.status === 401 && !isAuthEndpoint) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const register = (data) => authApi.post('/user/register', data);
export const verifyEmail = (data) => authApi.post('/user/verify-email', data);
export const resendOtp = (data) => authApi.post('/user/resend-otp', data);
export const login = (data) => authApi.post('/user/login', data);
export const forgotPassword = (data) => authApi.post('/user/forgot-password', data);
export const verifyResetOtp = (data) => authApi.post('/user/verify-reset-otp', data);
export const resetPassword = (data) => authApi.post('/user/reset-password', data);
export const logout = () => authApi.post('/user/logout');
