'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RegisterCollegePage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', aicteCode: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.email) errs.email = 'Email is required';
    if (!form.aicteCode) errs.aicteCode = 'AICTE Code is required';
    if (!form.password) errs.password = 'Password is required';
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setSubmitted(true);
    setTimeout(() => router.push('/college-dashboard'), 1500);
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

          <h1 className="text-2xl font-bold text-[#1a1a2e] mb-1">Register Your College</h1>
          <p className="text-gray-500 text-sm mb-6">Join Bridgix's network of leading institutions</p>

          {submitted ? (
            <div className="bg-[#e8faf9] border border-[#2BC0B4] rounded-xl p-6 text-center">
              <div className="text-4xl mb-3">🎉</div>
              <h3 className="font-bold text-[#1a1a2e] mb-2">Registration Successful!</h3>
              <p className="text-sm text-gray-600">Redirecting to your dashboard...</p>
            </div>
          ) : (
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
                <label className="block text-sm font-medium text-gray-700 mb-1">AICTE College Code</label>
                <input
                  type="text"
                  value={form.aicteCode}
                  onChange={e => setForm({...form, aicteCode: e.target.value})}
                  placeholder="AICTE-1-XXXXXXXXXX"
                  className={`input-field ${errors.aicteCode ? 'border-red-400' : ''}`}
                />
                {errors.aicteCode && <p className="text-red-500 text-xs mt-1">{errors.aicteCode}</p>}
                <p className="text-xs text-gray-400 mt-1">Find your code on the AICTE website</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={e => setForm({...form, password: e.target.value})}
                  placeholder="Create a strong password"
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
                  placeholder="Re-enter your password"
                  className={`input-field ${errors.confirmPassword ? 'border-red-400' : ''}`}
                />
                {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
              </div>

              <button type="submit" className="btn-primary w-full py-3">
                Register College
              </button>
            </form>
          )}

          <p className="text-center text-sm text-gray-500 mt-5">
            Already registered?{' '}
            <Link href="/college-login" className="text-[#2BC0B4] font-semibold hover:underline">College Login</Link>
          </p>
        </div>
      </div>

      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-[#1a9e93] to-[#2BC0B4] items-center justify-center p-12">
        <div className="text-white text-center max-w-md">
          <div className="w-48 h-48 mx-auto mb-8 bg-white/20 rounded-full flex items-center justify-center">
            <span className="text-8xl">🏛️</span>
          </div>
          <h2 className="text-3xl font-bold mb-4">Empower Your Institution</h2>
          <p className="text-white/80 leading-relaxed mb-8">
            Connect your students with alumni mentors, organize events, track placements, and build a stronger alumni network.
          </p>
          <div className="grid grid-cols-2 gap-4">
            {[
              { stat: '500+', label: 'Colleges' },
              { stat: '10K+', label: 'Alumni' },
              { stat: '95%', label: 'Placement Rate' },
              { stat: '50K+', label: 'Students' }
            ].map(item => (
              <div key={item.label} className="bg-white/20 rounded-xl p-4">
                <div className="text-2xl font-bold">{item.stat}</div>
                <div className="text-xs text-white/70">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
