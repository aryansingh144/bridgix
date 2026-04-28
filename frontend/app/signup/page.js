'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import api, { TOKEN_KEY } from '../../lib/api';
import { setAuth } from '../../store/slices/userSlice';

export default function SignupPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student'
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const errs = {};
    if (!form.name) errs.name = 'Full name is required';
    if (!form.email) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email';
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 8) errs.password = 'Password must be at least 8 characters';
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setServerError(null);
    setSubmitting(true);
    try {
      const { data } = await api.post('/api/auth/signup', {
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role
      });
      window.localStorage.setItem(TOKEN_KEY, data.token);
      dispatch(setAuth({ user: data.user }));
      router.push('/home');
    } catch (e) {
      setServerError(e.response?.data?.error || e.message || 'Signup failed');
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

          <h1 className="text-2xl font-bold text-[#1a1a2e] mb-1">Create your account</h1>
          <p className="text-gray-500 text-sm mb-6">Join thousands of students and alumni</p>

          {serverError && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full name</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm({...form, name: e.target.value})}
                placeholder="Your name"
                className={`input-field ${errors.name ? 'border-red-400' : ''}`}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">I am a…</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { v: 'student', label: 'Student' },
                  { v: 'alumni', label: 'Alumni' }
                ].map(opt => (
                  <button
                    key={opt.v}
                    type="button"
                    onClick={() => setForm({...form, role: opt.v})}
                    className={`py-2 rounded-lg text-sm font-medium border transition-all ${
                      form.role === opt.v
                        ? 'bg-[#2BC0B4] border-[#2BC0B4] text-white'
                        : 'border-gray-200 text-gray-600 hover:border-[#2BC0B4]/40'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

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
              <label className="block text-sm font-medium text-gray-700 mb-1">Create Password</label>
              <input
                type="password"
                value={form.password}
                onChange={e => setForm({...form, password: e.target.value})}
                placeholder="Min. 8 characters"
                className={`input-field ${errors.password ? 'border-red-400' : ''}`}
              />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <input
                type="password"
                value={form.confirmPassword}
                onChange={e => setForm({...form, confirmPassword: e.target.value})}
                placeholder="Re-enter password"
                className={`input-field ${errors.confirmPassword ? 'border-red-400' : ''}`}
              />
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full py-3 disabled:opacity-50"
            >
              {submitting ? 'Creating account…' : 'Sign Up'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-5">
            Already have an account?{' '}
            <Link href="/login" className="text-[#2BC0B4] font-semibold hover:underline">Login</Link>
          </p>
        </div>
      </div>

      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-[#2BC0B4] to-[#1a9e93] items-center justify-center p-12">
        <div className="text-white text-center max-w-md">
          <div className="w-48 h-48 mx-auto mb-8 bg-white/20 rounded-full flex items-center justify-center">
            <span className="text-8xl">🎓</span>
          </div>
          <h2 className="text-3xl font-bold mb-4">Start Your Journey</h2>
          <p className="text-white/80 leading-relaxed">
            Join Bridgix and connect with alumni mentors and students building their careers together.
          </p>
        </div>
      </div>
    </div>
  );
}
