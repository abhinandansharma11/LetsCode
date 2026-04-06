import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import VerifyResetOtpPage from './pages/VerifyResetOtpPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import HomePage from './pages/HomePage';
import CodeEditorPage from './pages/CodeEditorPage';
import AdminPanel from './pages/AdminPanel';
import CreateProblem from './pages/admin/CreateProblem';
import UpdateProblem from './pages/admin/UpdateProblem';
import DeleteProblem from './pages/admin/DeleteProblem';
import VideoSolutions from './pages/admin/VideoSolutions';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const AdminRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);

  if (!isAuthenticated || user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  return children;
};

const PublicRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return children;
};

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public auth routes restricted for logged-in users */}
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

        {/* Other public auth routes */}
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/verify-reset-otp" element={<VerifyResetOtpPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Protected Routes */}
        <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
        <Route path="/problems/:id" element={<ProtectedRoute><CodeEditorPage /></ProtectedRoute>} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />
        <Route path="/admin/create-problem" element={<AdminRoute><CreateProblem /></AdminRoute>} />
        <Route path="/admin/update-problem" element={<AdminRoute><UpdateProblem /></AdminRoute>} />
        <Route path="/admin/update-problem/:id" element={<AdminRoute><UpdateProblem /></AdminRoute>} />
        <Route path="/admin/delete-problem" element={<AdminRoute><DeleteProblem /></AdminRoute>} />
        <Route path="/admin/video-solutions" element={<AdminRoute><VideoSolutions /></AdminRoute>} />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
