import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import { BookOpen, Mail, Lock, User } from 'lucide-react';

const Register = () => {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const usernameInputRef = useRef(null);

  useEffect(() => {
    if (usernameInputRef.current) usernameInputRef.current.focus();
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      navigate('/blogs');
    }
  }, [user, navigate]);

  const validate = () => {
    const tempErrors = {};
    if (!username.trim()) tempErrors.username = 'Username is required.';
    if (!firstName.trim()) tempErrors.first_name = 'First name is required.';
    if (!lastName.trim()) tempErrors.last_name = 'Last name is required.';
    
    if (!email.trim()) {
      tempErrors.email = 'Email address is required.';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      tempErrors.email = 'Please enter a valid email address.';
    }

    if (!password) {
      tempErrors.password = 'Password is required.';
    } else if (password.length < 6) {
      tempErrors.password = 'Password must be at least 6 characters.';
    }

    if (password !== confirmPassword) {
      tempErrors.confirm_password = 'Passwords do not match.';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    if (!validate()) return;

    setLoading(true);
    try {
      await api.post('register/', {
        username: username.trim(),
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
        password: password
      });

      toast.success('Registration successful! Please log in to your account.');
      navigate('/login');
    } catch (err) {
      console.error('Registration error:', err);
      if (err.response && err.response.data) {
        const errorData = err.response.data;
        const formattedBackendErrors = {};
        Object.keys(errorData).forEach(key => {
          formattedBackendErrors[key] = Array.isArray(errorData[key]) ? errorData[key][0] : errorData[key];
        });
        setErrors(formattedBackendErrors);
        toast.error('Registration failed. Please fix form errors.');
      } else {
        toast.error(err.message || 'Failed to complete registration.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-55 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-lg space-y-8 bg-white border border-gray-150 rounded-3xl p-6 sm:p-8 shadow-sm animate-fade-in">
        
        {/* Header */}
        <div className="flex flex-col items-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-150">
            <BookOpen className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-center text-3xl font-black tracking-tight text-gray-955">
            Create an Account
          </h2>
          <p className="mt-1.5 text-center text-sm font-semibold text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-indigo-600 hover:text-indigo-700 hover:underline">
              Sign in here
            </Link>
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          
          <div className="grid gap-4 sm:grid-cols-2">
            {/* First Name */}
            <div>
              <label htmlFor="reg-fname" className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-450 mb-1.5">
                <User className="h-3.5 w-3.5 text-gray-400" />
                <span>First Name</span>
              </label>
              <input
                id="reg-fname"
                type="text"
                disabled={loading}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Alex"
                className={`w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition-all ${
                  errors.first_name ? 'border-red-300 focus:ring-2 focus:ring-red-100' : 'border-gray-250 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'
                }`}
              />
              {errors.first_name && <p className="mt-1 text-xs text-red-500 font-semibold">{errors.first_name}</p>}
            </div>

            {/* Last Name */}
            <div>
              <label htmlFor="reg-lname" className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-450 mb-1.5">
                <User className="h-3.5 w-3.5 text-gray-400" />
                <span>Last Name</span>
              </label>
              <input
                id="reg-lname"
                type="text"
                disabled={loading}
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Rivera"
                className={`w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition-all ${
                  errors.last_name ? 'border-red-300 focus:ring-2 focus:ring-red-100' : 'border-gray-250 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'
                }`}
              />
              {errors.last_name && <p className="mt-1 text-xs text-red-500 font-semibold">{errors.last_name}</p>}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Username */}
            <div>
              <label htmlFor="reg-user" className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-450 mb-1.5">
                <User className="h-3.5 w-3.5 text-gray-400" />
                <span>Username</span>
              </label>
              <input
                id="reg-user"
                ref={usernameInputRef}
                type="text"
                disabled={loading}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="alex_rivera"
                className={`w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition-all ${
                  errors.username ? 'border-red-300 focus:ring-2 focus:ring-red-100' : 'border-gray-250 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'
                }`}
              />
              {errors.username && <p className="mt-1 text-xs text-red-500 font-semibold">{errors.username}</p>}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="reg-email" className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-455 mb-1.5">
                <Mail className="h-3.5 w-3.5 text-gray-400" />
                <span>Email Address</span>
              </label>
              <input
                id="reg-email"
                type="email"
                disabled={loading}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@blogsphere.com"
                className={`w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition-all ${
                  errors.email ? 'border-red-300 focus:ring-2 focus:ring-red-100' : 'border-gray-250 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'
                }`}
              />
              {errors.email && <p className="mt-1 text-xs text-red-500 font-semibold">{errors.email}</p>}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Password */}
            <div>
              <label htmlFor="reg-pass" className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-455 mb-1.5">
                <Lock className="h-3.5 w-3.5 text-gray-400" />
                <span>Password</span>
              </label>
              <input
                id="reg-pass"
                type="password"
                disabled={loading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition-all ${
                  errors.password ? 'border-red-300 focus:ring-2 focus:ring-red-100' : 'border-gray-250 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'
                }`}
              />
              {errors.password && <p className="mt-1 text-xs text-red-500 font-semibold">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="reg-cpass" className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-455 mb-1.5">
                <Lock className="h-3.5 w-3.5 text-gray-400" />
                <span>Confirm Password</span>
              </label>
              <input
                id="reg-cpass"
                type="password"
                disabled={loading}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition-all ${
                  errors.confirm_password ? 'border-red-300 focus:ring-2 focus:ring-red-100' : 'border-gray-250 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'
                }`}
              />
              {errors.confirm_password && <p className="mt-1 text-xs text-red-500 font-semibold">{errors.confirm_password}</p>}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white shadow-md shadow-indigo-100 hover:bg-indigo-700 transition-colors btn-active-press disabled:bg-indigo-400 flex items-center justify-center gap-2"
          >
            <span>{loading ? 'Creating Account...' : 'Register'}</span>
          </button>

        </form>

      </div>
    </div>
  );
};

export default Register;
