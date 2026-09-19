import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { loginSchema, validateForm } from '../utils/validation';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Client-side Zod validation
    const validation = validateForm(loginSchema, { email, password });
    if (!validation.success) {
      toast.error(validation.error);
      return;
    }

    setLoading(true);

    try {
      // Connect to Node.js Backend API
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password,
      });

      // Save the JWT token securely in localStorage
      localStorage.setItem('token', response.data.token);
      
      toast.success('Welcome back!');

      // Redirect user to the dashboard upon success
      navigate('/dashboard');
    } catch (err) {
      // Handle incorrect email/password errors from backend
      const errorMessage = err.response?.data?.message || 'Invalid email or password. Please try again.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900 px-4">
      <div className="w-full max-w-md rounded-lg bg-gray-800 p-8 shadow-lg border border-gray-700">
        
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-blue-500">LifeFlow</h1>
          <p className="mt-2 text-sm text-gray-400">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300">Email Address</label>
            <input
              type="email"
              required
              className="mt-1 w-full rounded-md border border-gray-600 bg-gray-700 p-2.5 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-300">Password</label>
              <Link to="/forgot-password" className="text-xs text-blue-400 hover:text-blue-300 hover:underline">
                Forgot Password?
              </Link>
            </div>
            <input
              type="password"
              required
              className="mt-1 w-full rounded-md border border-gray-600 bg-gray-700 p-2.5 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-blue-600 p-2.5 text-white font-semibold hover:bg-blue-700 transition duration-200 disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-400">
          Don't have an account?{' '}
          <a href="/register" className="text-blue-500 hover:underline">
            Register here
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;