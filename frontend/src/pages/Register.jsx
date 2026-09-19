import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { registerSchema, validateForm } from '../utils/validation';

const Register = () => {
  const [step, setStep] = useState('register'); // 'register' | 'otp'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  
  const navigate = useNavigate();

  // Step 1: Submit Registration details & trigger OTP email
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();

    // Client-side Zod validation
    const validation = validateForm(registerSchema, { name, email, password });
    if (!validation.success) {
      toast.error(validation.error);
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/auth/register', {
        name,
        email,
        password,
      });

      toast.success(response.data?.message || 'Verification code sent to your email!');
      setStep('otp');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Submit 6-digit OTP to verify account & receive JWT token
  const handleOtpSubmit = async (e) => {
    e.preventDefault();

    const cleanOtp = otp.trim();
    if (!cleanOtp || cleanOtp.length !== 6) {
      toast.error('Please enter the complete 6-digit verification code');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/auth/verify-otp', {
        email,
        otp: cleanOtp,
      });

      // Save token securely upon successful verification
      localStorage.setItem('token', response.data.token);
      toast.success('Registration complete! Welcome to LifeFlow.');
      navigate('/dashboard');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Invalid verification code. Please check and try again.';
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
      const response = await axios.post('http://localhost:5000/api/auth/resend-otp', { email });
      toast.success(response.data?.message || 'New verification code sent to your email.');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to resend code. Please try again.';
      toast.error(errorMessage);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-8">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 sm:p-8 shadow-sm border border-gray-200">
        
        {/* Branding Header */}
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent flex items-center justify-center gap-2">
            <span>⚡</span> LifeFlow
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            {step === 'register' ? 'Create your new account' : 'Verify your email address'}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {step === 'register' ? (
            /* Step 1: Initial Registration Form */
            <motion.form
              key="register-form"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.25 }}
              onSubmit={handleRegisterSubmit}
              className="space-y-5"
            >
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  className="w-full rounded-lg border border-gray-300 bg-white p-2.5 text-gray-900 placeholder-gray-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200 transition"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  className="w-full rounded-lg border border-gray-300 bg-white p-2.5 text-gray-900 placeholder-gray-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200 transition"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  className="w-full rounded-lg border border-gray-300 bg-white p-2.5 text-gray-900 placeholder-gray-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200 transition"
                  placeholder="Create a strong password (min. 8 chars, Aa1@)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-purple-600 p-3 text-white font-semibold hover:bg-purple-700 transition duration-200 disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Sending Verification Code...</span>
                  </>
                ) : (
                  <span>Sign Up & Verify Email</span>
                )}
              </button>

              <p className="pt-2 text-center text-sm text-gray-600">
                Already have an account?{' '}
                <a href="/login" className="text-purple-600 hover:text-purple-700 font-medium hover:underline">
                  Sign In here
                </a>
              </p>
            </motion.form>
          ) : (
            /* Step 2: OTP Verification Form */
            <motion.form
              key="otp-form"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              onSubmit={handleOtpSubmit}
              className="space-y-6"
            >
              {/* Notification Banner */}
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-3.5 text-center">
                <p className="text-xs text-purple-700">
                  We sent a 6-digit verification code to
                </p>
                <p className="text-sm font-bold text-gray-900 mt-0.5 truncate" title={email}>
                  {email}
                </p>
              </div>

              {/* OTP Code Input */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2 text-center">
                  Enter 6-Digit Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  autoFocus
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  className="w-full tracking-[0.6em] text-center font-mono text-2xl font-bold rounded-lg border border-gray-300 bg-white p-3.5 text-gray-900 placeholder-gray-300 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200 transition shadow-inner"
                  placeholder="------"
                />
                <p className="text-[11px] text-gray-500 text-center mt-2">
                  Code expires in 10 minutes.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full rounded-lg bg-purple-600 p-3 text-white font-semibold hover:bg-purple-700 transition duration-200 disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Verifying Code...</span>
                  </>
                ) : (
                  <span>Verify & Activate Account</span>
                )}
              </button>

              {/* Resend & Back Actions */}
              <div className="flex items-center justify-between text-xs text-gray-600 pt-2 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setStep('register');
                    setOtp('');
                  }}
                  className="hover:text-gray-900 transition flex items-center gap-1"
                >
                  <span>←</span> Change Email
                </button>

                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resending}
                  className="text-purple-600 hover:text-purple-700 font-semibold disabled:opacity-50 transition"
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

export default Register;