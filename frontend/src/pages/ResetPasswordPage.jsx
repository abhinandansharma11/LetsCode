import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Loader2, KeyRound, ArrowLeft } from 'lucide-react';
import { resetPassword as resetPasswordApi } from '../api/authApi';
import PasswordInput from '../components/PasswordInput';
import PasswordStrength from '../components/PasswordStrength';

const resetPasswordSchema = z.object({
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const ResetPasswordPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const resetToken = location.state?.resetToken;

  useEffect(() => {
    if (!resetToken) {
      navigate('/forgot-password');
    }
  }, [resetToken, navigate]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
  });

  const passwordValue = watch('newPassword', '');

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await resetPasswordApi({
        resetToken,
        newPassword: data.newPassword
      });
      toast.success('Password reset! Please login.');
      navigate('/login');
    } catch (error) {
      const status = error.response?.status;
      const apiErr = error.response?.data;

      if (status === 410) {
        // Token expired
        toast.error('Reset link has expired. Please request a new one.');
        navigate('/forgot-password');
      } else if (status === 400) {
        toast.error(apiErr?.message || 'Invalid request. Please try again.');
      } else {
        toast.error('Failed to reset password. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!resetToken) return null;

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="auth-card w-full max-w-[440px] rounded-3xl p-8 sm:p-10 relative overflow-hidden">
        
        {/* Subtle top border highlight */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-90" />

        <div className="mb-8">
          <Link to="/login" className="inline-flex items-center text-sm font-semibold text-slate-500 hover:text-amber-500 transition-colors mb-4 group">
            <ArrowLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
            Back to login
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-amber-50 rounded-2xl shadow-inner border border-amber-100 flex-shrink-0">
              <KeyRound className="w-7 h-7 text-amber-500 drop-shadow-[0_2px_4px_rgba(245,158,11,0.2)]" />
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-800">New Password</h2>
          </div>
          <p className="text-slate-500 text-sm font-medium">Create a new secure password for your account.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-1.5 focus-within:text-amber-500 text-slate-600 transition-colors">
            <label className="text-sm font-semibold ml-1">New Password</label>
            <PasswordInput
              {...register('newPassword')}
              placeholder="••••••••"
              error={errors.newPassword}
              className="rounded-xl"
            />
            <PasswordStrength password={passwordValue} />
          </div>

          <div className="space-y-1.5 focus-within:text-amber-500 text-slate-600 transition-colors pt-2">
            <label className="text-sm font-semibold ml-1">Confirm New Password</label>
            <PasswordInput
              {...register('confirmPassword')}
              placeholder="••••••••"
              error={errors.confirmPassword}
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
              'Reset Password'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
