import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { BookOpen, Mail, Lock } from 'lucide-react';

const Login = () => {
  const { login, user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const emailInputRef = useRef(null);

  useEffect(() => {
    if (emailInputRef.current) emailInputRef.current.focus();
  }, []);

  // Redirect if user is already authenticated
  useEffect(() => {
    if (user) {
      navigate('/blogs');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    setError('');
    setLoading(true);

    const result = await login(email.trim(), password);
    setLoading(false);

    if (result.success) {
      toast.success('Logged in successfully! Welcome to BlogSphere.');
      navigate('/blogs');
    } else {
      setError(result.error);
      toast.error(result.error);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-55 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-white border border-gray-150 rounded-3xl p-6 sm:p-8 shadow-sm animate-fade-in">
        
        {/* Header */}
        <div className="flex flex-col items-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-150">
            <BookOpen className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-center text-3xl font-black tracking-tight text-gray-950">
            Sign in to BlogSphere
          </h2>
          <p className="mt-1.5 text-center text-sm font-semibold text-gray-400">
            Or{' '}
            <Link to="/register" className="font-bold text-indigo-600 hover:text-indigo-700 hover:underline">
              create a new author account
            </Link>
          </p>
        </div>

        {/* Error Alert Box */}
        {error && (
          <div className="rounded-xl border border-red-100 bg-red-50/50 p-3.5 text-center shadow-sm">
            <p className="text-xs font-bold text-red-750">{error}</p>
          </div>
        )}

        {/* Form */}
        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          
          {/* Email */}
          <div>
            <label htmlFor="log-email" className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-450 mb-1.5">
              <Mail className="h-3.5 w-3.5 text-gray-400" />
              <span>Email Address</span>
            </label>
            <input
              id="log-email"
              ref={emailInputRef}
              type="email"
              required
              disabled={loading}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. author@blogsphere.com"
              className="w-full rounded-xl border border-gray-250 px-3.5 py-2.5 text-sm font-medium outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all text-gray-800"
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="log-pass" className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-455 mb-1.5">
              <Lock className="h-3.5 w-3.5 text-gray-400" />
              <span>Password</span>
            </label>
            <input
              id="log-pass"
              type="password"
              required
              disabled={loading}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-gray-250 px-3.5 py-2.5 text-sm font-medium outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all text-gray-850"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white shadow-md shadow-indigo-100 hover:bg-indigo-700 transition-colors btn-active-press disabled:bg-indigo-400 flex items-center justify-center gap-2"
          >
            <span>{loading ? 'Signing In...' : 'Sign In'}</span>
          </button>

        </form>

      </div>
    </div>
  );
};

export default Login;
