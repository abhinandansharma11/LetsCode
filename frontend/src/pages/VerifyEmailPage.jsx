import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Mail, ArrowLeft, Loader2 } from 'lucide-react';
import { verifyEmail, resendOtp as resendOtpApi } from '../api/authApi';
import OtpInput from '../components/OtpInput';

const VerifyEmailPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);

  const userId = location.state?.userId;
  const email = location.state?.email;

  useEffect(() => {
    if (!userId || !email) {
      navigate('/register');
    }
  }, [userId, email, navigate]);

  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const maskEmail = (email) => {
    if (!email) return '';
    const [name, domain] = email.split('@');
    if (name.length <= 2) return `${name[0]}***@${domain}`;
    return `${name[0]}${'*'.repeat(name.length - 2)}${name[name.length - 1]}@${domain}`;
  };

  const handleVerify = async (e) => {
    if (e) e.preventDefault();
    if (otp.length !== 6) return;

    setIsLoading(true);
    try {
      await verifyEmail({ userId, otp });
      toast.success('Email verified successfully! You can now log in.');
      navigate('/login');
    } catch (error) {
      const status = error.response?.status;

      if (status === 410) {
        toast.error('OTP has expired. Please request a new one.');
      } else if (status === 400) {
        toast.error('Invalid OTP. Please try again.');
      } else {
        toast.error('Verification failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;

    try {
      await resendOtpApi({ userId, type: 'email' });
      toast.success('OTP resent to your email.');
      setResendTimer(60);
    } catch (error) {
      const status = error.response?.status;

      if (status === 429) {
        toast.error('Please wait before requesting a new OTP.');
        setResendTimer(30);
      } else if (status === 404) {
        toast.error('User not found. Please register again.');
        navigate('/register');
      } else if (status === 503) {
        toast.error('Failed to send email. Please try again later.');
      } else {
        toast.error('Failed to resend OTP. Please try again.');
      }
    }
  };

  if (!userId || !email) return null;

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
              <Mail className="w-7 h-7 text-amber-500 drop-shadow-[0_2px_4px_rgba(245,158,11,0.2)]" />
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-800">Verify Email</h2>
          </div>
          <p className="text-slate-500 text-sm font-medium">
            We've sent a 6-digit verification code to <span className="font-bold text-slate-700">{maskEmail(email)}</span>.
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-6">
          <OtpInput length={6} onChange={(val) => setOtp(val)} />
          
          <button
            type="submit"
            disabled={isLoading || otp.length !== 6}
            className="w-full auth-btn-primary py-3.5 rounded-xl mt-6 flex justify-center items-center gap-2 text-[15px] tracking-wide"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              'Verify Account'
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-sm font-medium text-slate-500">
          Didn't receive the code?{' '}
          <button
            onClick={handleResend}
            disabled={resendTimer > 0}
            className={`font-bold transition-colors focus:outline-none ${
              resendTimer > 0 ? 'text-slate-400 cursor-not-allowed' : 'text-amber-500 hover:text-amber-600 focus:underline'
            }`}
          >
            {resendTimer > 0 ? `Resend code in ${resendTimer}s` : 'Resend now'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
