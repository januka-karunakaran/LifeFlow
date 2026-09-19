import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { forgotPasswordSchema, resetPasswordSchema, validateForm } from '../utils/validation';

const ForgotPassword = () => {
  const [step, setStep] = useState('request'); // 'request' | 'reset'
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const navigate = useNavigate();

  // Step 1: Request Password Reset OTP
  const handleRequestOtp = async (e) => {
    e.preventDefault();

    // Validate email with Zod
    const validation = validateForm(forgotPasswordSchema, { email });
    if (!validation.success) {
      toast.error(validation.error);
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/auth/forgot-password', {
        email: email.trim(),
      });

      toast.success(response.data?.message || 'Password reset code sent to your email!');
      setStep('reset');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to send reset code. Please check your email.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Reset Password with OTP and New Password
  const handleResetPassword = async (e) => {
    e.preventDefault();

    const cleanOtp = otp.trim();

    // Confirm passwords match
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match. Please re-enter.');
      return;
    }

    // Client-side Zod strict validation
    const validation = validateForm(resetPasswordSchema, {
      email: email.trim(),
      otp: cleanOtp,
      newPassword,
    });

    if (!validation.success) {
      toast.error(validation.error);
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/auth/reset-password', {
        email: email.trim(),
        otp: cleanOtp,
        newPassword,
      });

      toast.success(response.data?.message || 'Password reset successful! Please sign in.');
      navigate('/login');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Password reset failed. Please verify your OTP.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP handler
  const handleResendOtp = async () => {
    if (!email || resending) return;
    setResending(true);

    try {
      const response = await axios.post('http://localhost:5000/api/auth/forgot-password', {
        email: email.trim(),
      });
      toast.success(response.data?.message || 'A fresh reset code has been sent to your email.');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to resend reset code. Please try again.';
      toast.error(errorMessage);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900 px-4 py-8">
      <div className="w-full max-w-md rounded-xl bg-gray-800 p-6 sm:p-8 shadow-2xl border border-gray-700">
        
        {/* Branding Header */}
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-blue-500 flex items-center justify-center gap-2">
            <span>⚡</span> LifeFlow
          </h1>
          <p className="mt-1 text-sm text-gray-400">
            {step === 'request' ? 'Reset your account password' : 'Enter verification code & new password'}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {step === 'request' ? (
            /* Step 1: Request OTP Form */
            <motion.form
              key="request-form"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.25 }}
              onSubmit={handleRequestOtp}
              className="space-y-5"
            >
              <div className="bg-gray-750 p-4 rounded-lg border border-gray-700 text-xs text-gray-300 leading-relaxed">
                Enter your registered email address below. We'll send you a 6-digit verification code to reset your password.
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  autoFocus
                  className="w-full rounded-lg border border-gray-600 bg-gray-700 p-2.5 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none transition"
                  placeholder="Enter your registered email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-blue-600 p-3 text-white font-semibold hover:bg-blue-700 transition duration-200 disabled:opacity-50 flex items-center justify-center gap-2 shadow-md hover:shadow-blue-600/25"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Sending Reset Code...</span>
                  </>
                ) : (
                  <span>Send Reset Code</span>
                )}
              </button>

              <div className="text-center pt-2">
                <Link to="/login" className="text-sm text-blue-400 hover:text-blue-300 font-medium hover:underline inline-flex items-center gap-1">
                  <span>←</span> Back to Sign In
                </Link>
              </div>
            </motion.form>
          ) : (
            /* Step 2: Enter OTP & New Password Form */
            <motion.form
              key="reset-form"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              onSubmit={handleResetPassword}
              className="space-y-4"
            >
              {/* Notification Banner */}
              <div className="bg-blue-950/40 border border-blue-500/40 rounded-lg p-3 text-center">
                <p className="text-xs text-blue-300">
                  Reset code sent to
                </p>
                <p className="text-sm font-bold text-white mt-0.5 truncate" title={email}>
                  {email}
                </p>
              </div>

              {/* 6-Digit OTP Code Input */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5 text-center">
                  Enter 6-Digit Reset Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  autoFocus
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  className="w-full tracking-[0.5em] text-center font-mono text-xl font-bold rounded-lg border border-gray-600 bg-gray-750 p-2.5 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none transition shadow-inner"
                  placeholder="------"
                />
              </div>

              {/* New Password Input */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">
                    New Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[11px] text-blue-400 hover:text-blue-300"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="w-full rounded-lg border border-gray-600 bg-gray-700 p-2.5 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none transition text-sm"
                  placeholder="Min. 8 chars (1 uppercase, 1 number, 1 special)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>

              {/* Confirm New Password Input */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
                  Confirm New Password
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="w-full rounded-lg border border-gray-600 bg-gray-700 p-2.5 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none transition text-sm"
                  placeholder="Re-enter your new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full rounded-lg bg-emerald-600 p-3 text-white font-semibold hover:bg-emerald-700 transition duration-200 disabled:opacity-50 flex items-center justify-center gap-2 shadow-md hover:shadow-emerald-600/25 mt-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Resetting Password...</span>
                  </>
                ) : (
                  <span>Set New Password</span>
                )}
              </button>

              {/* Resend & Back Actions */}
              <div className="flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-gray-700/60">
                <button
                  type="button"
                  onClick={() => {
                    setStep('request');
                    setOtp('');
                  }}
                  className="hover:text-white transition flex items-center gap-1"
                >
                  <span>←</span> Change Email
                </button>

                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resending}
                  className="text-blue-400 hover:text-blue-300 font-semibold disabled:opacity-50 transition"
                >
                  {resending ? 'Sending...' : 'Resend Code'}
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ForgotPassword;
