import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const submissionApi = axios.create({
  baseURL: 'http://localhost:3000',
  withCredentials: true,
});

submissionApi.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

submissionApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const runCode = (problemId, { code, language }) =>
  submissionApi.post(`/submission/run/${problemId}`, { code, language });

export const submitCode = (problemId, { code, language }) =>
  submissionApi.post(`/submission/submit/${problemId}`, { code, language });

export const getSubmissionHistory = (problemId) =>
  submissionApi.get(`/submission/history/${problemId}`);

export default submissionApi;
