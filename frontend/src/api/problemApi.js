import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const problemApi = axios.create({
  baseURL: 'http://localhost:3000',
  withCredentials: true,
});

// Intercept 401 errors and logout
problemApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Get all problems
export const getAllProblems = () => problemApi.get('/problem/getAllProblem');

// Get problems solved by current user
export const getSolvedProblems = () => problemApi.get('/problem/problemSolvedByUser');

// Get problem by ID
export const getProblemById = (id) => problemApi.get(`/problem/problemById/${id}`);

// Create a new problem (admin only)
export const createProblem = (problemData) => problemApi.post('/problem/create', problemData);

// Update a problem (admin only)
export const updateProblem = (id, problemData) => problemApi.put(`/problem/update/${id}`, problemData);

// Delete a problem (admin only)
export const deleteProblem = (id) => problemApi.delete(`/problem/delete/${id}`);

// Run code against visible test cases
export const runCode = (id, code, language) =>
  problemApi.post(`/submission/run/${id}`, { code, language });

// Submit code against hidden test cases
export const submitCode = (id, code, language) =>
  problemApi.post(`/submission/submit/${id}`, { code, language });

export default problemApi;
