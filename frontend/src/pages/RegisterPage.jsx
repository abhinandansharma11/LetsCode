import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Loader2, Code2, ArrowLeft } from 'lucide-react';
import { register as registerApi } from '../api/authApi';
import PasswordInput from '../components/PasswordInput';
import PasswordStrength from '../components/PasswordStrength';

const registerSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters').max(20, 'Name cannot exceed 20 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Parse backend error into user-friendly message
const parseBackendError = (error) => {
  const status = error.response?.status;
  const apiErr = error.response?.data;

  // Handle 409 Conflict - email already registered
  if (status === 409) {
    return 'This email is already registered. Please login instead.';
  }

  // If no response data, return generic message
  if (!apiErr) {
    return 'Network error. Please check your connection.';
  }

  // Convert to string for parsing
  const errStr = typeof apiErr === 'string' ? apiErr : JSON.stringify(apiErr);

  // Check for duplicate email (MongoDB E11000)
  if (errStr.includes('E11000') || errStr.includes('duplicate key')) {
    if (errStr.includes('emailId') || errStr.includes('email')) {
      return 'This email is already registered. Please login instead.';
    }
    return 'This account already exists.';
  }

  // Check for validation errors from backend
  if (errStr.includes('Week Password') || errStr.includes('Weak Password')) {
    return 'Password is too weak. Include uppercase, lowercase, number, and special character.';
  }
  if (errStr.includes('Invalid Email')) {
    return 'Please enter a valid email address.';
  }
  if (errStr.includes('Some Field Missing')) {
    return 'Please fill in all required fields.';
  }

  // Check for mongoose validation errors
  if (errStr.includes('validation failed')) {
    if (errStr.includes('firstName')) {
      return 'Name must be between 3 and 20 characters.';
    }
    if (errStr.includes('emailId')) {
      return 'Please enter a valid email address.';
    }
    if (errStr.includes('password')) {
      return 'Invalid password format.';
    }
  }

  // If it's a string error with "Error: " prefix, clean it up
  if (typeof apiErr === 'string') {
    const cleaned = apiErr.replace(/^Error:\s*/i, '').trim();
    // Don't show raw MongoDB errors to user
    if (cleaned.includes('MongoServerError') || cleaned.includes('ValidationError')) {
      return 'Registration failed. Please check your details.';
    }
    return cleaned || 'Registration failed. Please try again.';
  }

  // If it has a message property
  if (apiErr?.message) {
    return apiErr.message;
  }

  return 'Registration failed. Please try again.';
};

const RegisterPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const passwordValue = watch('password', '');

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const response = await registerApi({
        firstName: data.name,
        emailId: data.email,
        password: data.password,
      });

      const userId = response.data?.userId;
      const message = response.data?.message;

      if (!userId) {
        toast.error('Registration failed. Please try again.');
        return;
      }

      toast.success(message || 'Please verify your email.');
      navigate('/verify-email', {
        state: { userId, email: data.email },
      });
    } catch (error) {
      console.error('Registration error:', error.response?.data);
      const errMsg = parseBackendError(error);
      toast.error(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[100dvh] items-center justify-center p-4">
      <div className="auth-card w-full max-w-[420px] rounded-3xl p-6 sm:p-8 relative overflow-hidden">
        
        {/* Subtle top border highlight */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-90" />

        <div className="mb-6">
          <Link to="/login" className="inline-flex items-center text-sm font-semibold text-slate-500 hover:text-amber-500 transition-colors mb-3 group">
            <ArrowLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
            Back
          </Link>
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-800">Create Account</h2>
          </div>
          <p className="text-slate-500 text-xs font-medium">Join WECode to level up your skills</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div className="space-y-1 focus-within:text-amber-500 text-slate-600 transition-colors">
            <label className="text-xs font-semibold ml-1">Full Name</label>
            <input
              {...register('name')}
              type="text"
              placeholder="John Doe"
              className={`w-full px-4 py-2.5 text-sm rounded-xl auth-input ${
                errors.name ? 'border-red-500/50 focus:border-red-500' : ''
              }`}
            />
            {errors.name && (
              <p className="text-red-500 text-[11px] mt-0.5 ml-1 font-medium animate-fade-in">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1 focus-within:text-amber-500 text-slate-600 transition-colors">
            <label className="text-xs font-semibold ml-1">Email</label>
            <input
              {...register('email')}
              type="email"
              placeholder="you@email.com"
              className={`w-full px-4 py-2.5 text-sm rounded-xl auth-input ${
                errors.email ? 'border-red-500/50 focus:border-red-500' : ''
              }`}
            />
            {errors.email && (
              <p className="text-red-500 text-[11px] mt-0.5 ml-1 font-medium animate-fade-in">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1 focus-within:text-amber-500 text-slate-600 transition-colors">
            <label className="text-xs font-semibold ml-1">Password</label>
            <PasswordInput
              {...register('password')}
              placeholder="••••••••"
              error={errors.password}
              className="rounded-xl py-2.5 text-sm"
            />
            <PasswordStrength password={passwordValue} />
          </div>

          <div className="space-y-1 focus-within:text-amber-500 text-slate-600 transition-colors pt-1">
            <label className="text-xs font-semibold ml-1">Confirm Password</label>
            <PasswordInput
              {...register('confirmPassword')}
              placeholder="••••••••"
              error={errors.confirmPassword}
              className="rounded-xl py-2.5 text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full auth-btn-primary py-3 rounded-xl mt-4 flex justify-center items-center gap-2 text-sm tracking-wide"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              'Create account'
            )}
          </button>
        </form>

        <div className="mt-5 text-center text-xs font-medium text-slate-500">
          Already have an account?{' '}
          <Link 
            to="/login" 
            className="text-amber-500 font-bold hover:text-amber-600 transition-colors focus:outline-none focus:underline"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
