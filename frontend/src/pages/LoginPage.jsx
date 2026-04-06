import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Loader2, Code2 } from 'lucide-react';
import { login } from '../api/authApi';
import { useAuthStore } from '../store/authStore';
import PasswordInput from '../components/PasswordInput';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

// Parse backend error into user-friendly message
const parseLoginError = (error) => {
  const apiErr = error.response?.data;

  if (!apiErr) {
    return 'Network error. Please check your connection.';
  }

  // Backend now returns JSON with message field
  if (apiErr?.message) {
    return apiErr.message;
  }

  // Fallback for old string format
  if (typeof apiErr === 'string') {
    const errStr = apiErr;

    if (errStr.includes('Invalid Credentials')) {
      return 'Invalid email or password.';
    }
    if (errStr.includes('Cannot read properties of null') || errStr.includes('null')) {
      return 'No account found with this email.';
    }

    const cleaned = errStr.replace(/^Error:\s*/i, '').trim();
    if (cleaned.includes('TypeError') || cleaned.includes('Cannot read')) {
      return 'No account found with this email.';
    }
    return cleaned || 'Login failed. Please try again.';
  }

  return 'Login failed. Please try again.';
};

const LoginPage = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const response = await login({ emailId: data.email, password: data.password });
      setAuth(response.data.user, 'cookie-auth');
      toast.success('Welcome back to WECode!');
      navigate('/');
    } catch (error) {
      console.error('Login error:', error.response?.data);
      const status = error.response?.status;
      const apiErr = error.response?.data;

      if (status === 403 && apiErr?.userId) {
        // Email not verified
        toast.error('Please verify your email first.');
        navigate('/verify-email', {
          state: { userId: apiErr.userId, email: data.email },
        });
      } else {
        toast.error(parseLoginError(error));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="auth-card w-full max-w-[440px] rounded-3xl p-8 sm:p-10 relative overflow-hidden">
        
        {/* Subtle top border highlight */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-90" />

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center gap-3 mb-4">
            <div className="p-2.5 bg-amber-50 rounded-2xl shadow-inner border border-amber-100">
              <Code2 className="w-8 h-8 text-amber-500 drop-shadow-[0_2px_4px_rgba(245,158,11,0.2)]" />
            </div>
            <span className="text-3xl font-extrabold tracking-tight text-slate-800">WECode</span>
          </div>
          <p className="text-slate-500 text-sm font-medium">Welcome back to your workspace</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-1.5 focus-within:text-amber-500 text-slate-600 transition-colors">
            <label className="text-sm font-semibold ml-1">Email</label>
            <input
              {...register('email')}
              type="email"
              placeholder="you@email.com"
              className={`w-full px-4 py-3 rounded-xl auth-input ${
                errors.email ? 'border-red-500/50 focus:border-red-500' : ''
              }`}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1 ml-1 font-medium animate-fade-in">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1.5 focus-within:text-amber-500 text-slate-600 transition-colors">
            <div className="flex items-center justify-between ml-1">
              <label className="text-sm font-semibold">Password</label>
              <Link 
                to="/forgot-password" 
                className="text-xs font-bold text-amber-500 hover:text-amber-600 transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <PasswordInput
              {...register('password')}
              placeholder="••••••••"
              error={errors.password}
              className="rounded-xl"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full auth-btn-primary py-3.5 rounded-xl mt-6 flex justify-center items-center gap-2 text-[15px] tracking-wide"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              'Sign in'
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-sm font-medium text-slate-500">
          Don't have an account?{' '}
          <Link 
            to="/register" 
            className="text-amber-500 font-bold hover:text-amber-600 transition-colors focus:outline-none focus:underline"
          >
            Register
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
