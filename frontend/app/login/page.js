'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import api, { TOKEN_KEY } from '../../lib/api';
import { setAuth } from '../../store/slices/userSlice';

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.email) errs.email = 'Email is required';
    if (!form.password) errs.password = 'Password is required';
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setErrors({});
    setServerError(null);
    setSubmitting(true);
    try {
      const { data } = await api.post('/api/auth/login', form);
      window.localStorage.setItem(TOKEN_KEY, data.token);
      dispatch(setAuth({ user: data.user }));
      router.push('/home');
    } catch (e) {
      setServerError(e.response?.data?.error || e.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="flex-1 flex items-center justify-center bg-white px-8 py-12">
        <div className="w-full max-w-sm">
          <Link href="/" className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-[#2BC0B4] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">B</span>
            </div>
            <span className="text-xl font-bold text-[#1a1a2e]">Bridgix</span>
          </Link>

          <h1 className="text-2xl font-bold text-[#1a1a2e] mb-1">Welcome back!</h1>
          <p className="text-gray-500 text-sm mb-6">Sign in to continue your journey</p>

          {serverError && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm({...form, email: e.target.value})}
                placeholder="you@example.com"
                className={`input-field ${errors.email ? 'border-red-400' : ''}`}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <button type="button" className="text-xs text-[#2BC0B4] hover:underline">Forgot Password?</button>
              </div>
              <input
                type="password"
                value={form.password}
                onChange={e => setForm({...form, password: e.target.value})}
                placeholder="Enter your password"
                className={`input-field ${errors.password ? 'border-red-400' : ''}`}
              />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full py-3 disabled:opacity-50"
            >
              {submitting ? 'Signing in…' : 'Login'}
            </button>
          </form>

          <div className="mt-4 p-3 rounded-lg bg-[#e8faf9] border border-[#2BC0B4]/30 text-xs text-gray-700">
            <p className="font-semibold text-[#1a9e93] mb-1">Demo accounts</p>
            <p>Any seeded user works with password <span className="font-mono font-semibold">password123</span> — e.g. <span className="font-mono">aryan.singh@example.com</span> (student) or <span className="font-mono">mohit.singh@example.com</span> (alumni).</p>
          </div>

          <p className="text-center text-sm text-gray-500 mt-5">
            New user?{' '}
            <Link href="/signup" className="text-[#2BC0B4] font-semibold hover:underline">Register</Link>
          </p>
          <p className="text-center text-sm text-gray-500 mt-2">
            College admin?{' '}
            <Link href="/college-login" className="text-[#2BC0B4] font-semibold hover:underline">College Login</Link>
          </p>
        </div>
      </div>

      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-[#2BC0B4] to-[#1a9e93] items-center justify-center p-12">
        <div className="text-white text-center max-w-md">
          <div className="w-48 h-48 mx-auto mb-8 bg-white/20 rounded-full flex items-center justify-center">
            <span className="text-8xl">🏫</span>
          </div>
          <h2 className="text-3xl font-bold mb-4">Welcome Back!</h2>
          <p className="text-white/80 leading-relaxed mb-8">
            Your network is waiting. Connect with mentors, explore opportunities, and continue building your career.
          </p>
        </div>
      </div>
    </div>
  );
}
