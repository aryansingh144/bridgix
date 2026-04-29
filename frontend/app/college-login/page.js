'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import api, { TOKEN_KEY } from '../../lib/api';
import { setAuth } from '../../store/slices/userSlice';

export default function CollegeLoginPage() {
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
      if (data.user?.role !== 'college') {
        setServerError('This account is not a college admin. Use the regular login.');
        return;
      }
      window.localStorage.setItem(TOKEN_KEY, data.token);
      dispatch(setAuth({ user: data.user }));
      router.push('/college-dashboard');
    } catch (err) {
      setServerError(err.response?.data?.error || err.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafb]">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <Link href="/" className="flex items-center gap-2 mb-8 justify-center">
          <div className="w-8 h-8 bg-[#2BC0B4] rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">B</span>
          </div>
          <span className="text-xl font-bold text-[#1a1a2e]">Bridgix</span>
        </Link>

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-[#e8faf9] rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-3xl">🏛️</span>
          </div>
          <h1 className="text-2xl font-bold text-[#1a1a2e]">College Admin Login</h1>
          <p className="text-gray-500 text-sm mt-1">Access your institutional dashboard</p>
        </div>

        {serverError && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">College Email</label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm({...form, email: e.target.value})}
              placeholder="admin@college.edu.in"
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

          <button type="submit" disabled={submitting} className="btn-primary w-full py-3 disabled:opacity-50">
            {submitting ? 'Signing in…' : 'Login to Dashboard'}
          </button>
        </form>

        <div className="mt-4 p-3 rounded-lg bg-[#e8faf9] border border-[#2BC0B4]/30 text-xs text-gray-700">
          <p className="font-semibold text-[#1a9e93] mb-1">Demo college admin</p>
          <p><span className="font-mono">admin@iitd.ac.in</span> / <span className="font-mono font-semibold">password123</span></p>
        </div>

        <p className="text-center text-sm text-gray-500 mt-5">
          Not registered yet?{' '}
          <Link href="/register-college" className="text-[#2BC0B4] font-semibold hover:underline">Register College</Link>
        </p>
        <p className="text-center text-sm text-gray-500 mt-2">
          Student or Alumni?{' '}
          <Link href="/login" className="text-[#2BC0B4] font-semibold hover:underline">Login here</Link>
        </p>
      </div>
    </div>
  );
}
