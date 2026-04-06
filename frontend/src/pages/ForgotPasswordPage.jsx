import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Loader2, KeyRound, ArrowLeft } from 'lucide-react';
import { forgotPassword } from '../api/authApi';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const response = await forgotPassword(data);
      const userId = response.data?.userId;

      // Only navigate if userId exists (email was found)
      if (userId) {
        toast.success('OTP sent to your email.');
        navigate('/verify-reset-otp', {
          state: { userId, email: data.email },
        });
      } else {
        // Email not found in database
        toast.error('User doesn\'t exist.');
      }
    } catch (error) {
      const apiErr = error.response?.data;
      const errMsg = apiErr?.message || apiErr?.error || (typeof apiErr === 'string' ? apiErr : 'Something went wrong. Please try again.');
      toast.error(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

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
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 bg-amber-50 rounded-2xl shadow-inner border border-amber-100 flex-shrink-0">
              <KeyRound className="w-7 h-7 text-amber-500 drop-shadow-[0_2px_4px_rgba(245,158,11,0.2)]" />
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-800">Reset Password</h2>
          </div>
          <p className="text-slate-500 text-sm font-medium">
            Enter your email address and we'll send you a 6-digit OTP to reset your password.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-1.5 focus-within:text-amber-500 text-slate-600 transition-colors">
            <label className="text-sm font-semibold ml-1">Email address</label>
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

          <button
            type="submit"
            disabled={isLoading}
            className="w-full auth-btn-primary py-3.5 rounded-xl mt-6 flex justify-center items-center gap-2 text-[15px] tracking-wide"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              'Send Reset OTP'
            )}
          </button>
        </form>

      </div>
    </div>
  );
};

export default ForgotPasswordPage;
