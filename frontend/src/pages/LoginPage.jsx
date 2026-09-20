import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Calendar, Lock, Mail, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Demo credential autofill helper
  const handleQuickFill = (roleEmail) => {
    setEmail(roleEmail);
    setPassword('password123');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const loggedUser = await login(email, password);

      // Check for redirect param
      const searchParams = new URLSearchParams(location.search);
      const redirectUrl = searchParams.get('redirect');

      if (redirectUrl) {
        navigate(redirectUrl);
      } else {
        if (loggedUser.role === 'ADMIN') {
          navigate('/admin/dashboard');
        } else if (loggedUser.role === 'ORGANIZER') {
          navigate('/organizer/dashboard');
        } else {
          navigate('/student/dashboard');
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50">
        
        {/* Header */}
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-brand-600 text-white flex items-center justify-center mx-auto mb-4 shadow-md shadow-brand-500/20">
            <Calendar className="w-6 h-6" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Welcome back
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-500">
            Sign in to access your campus event portal and registrations
          </p>
        </div>

        {/* Quick Demo Login Picker */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
          <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-600 mb-2.5">
            <Sparkles className="w-3.5 h-3.5 text-brand-600" />
            <span>Quick Demo Logins (Password: password123)</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickFill('student1@campus.edu')}
              className="py-1.5 px-2 bg-white hover:bg-brand-50 hover:text-brand-700 hover:border-brand-200 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 shadow-sm transition-colors text-center"
            >
              Student
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('tech.club@campus.edu')}
              className="py-1.5 px-2 bg-white hover:bg-purple-50 hover:text-purple-700 hover:border-purple-200 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 shadow-sm transition-colors text-center"
            >
              Organizer
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('admin@campus.edu')}
              className="py-1.5 px-2 bg-white hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 shadow-sm transition-colors text-center"
            >
              Admin
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm rounded-xl flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Campus Email
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@campus.edu"
                className="w-full pl-11 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-md shadow-brand-500/20 transition-all flex items-center justify-center space-x-2"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          Don't have an account yet?{' '}
          <Link to="/register" className="font-bold text-brand-600 hover:text-brand-700">
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
}
