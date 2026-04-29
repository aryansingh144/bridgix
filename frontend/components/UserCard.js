'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const isRealObjectId = (id) => typeof id === 'string' && /^[a-f0-9]{24}$/i.test(id);

/**
 * UserCard — used on the home right-panel and other directory views.
 * The Connect button is real: it POSTs `/api/connections` and reflects the
 * actual status (`none` → `pending` → `accepted`). Skipped entirely when
 * either the viewer or the target isn't a persisted user.
 */
export default function UserCard({ user, compact = false, currentUserId }) {
  const [status, setStatus] = useState('none'); // 'none' | 'pending' | 'accepted'
  const [busy, setBusy] = useState(false);

  const canConnect =
    isRealObjectId(currentUserId) &&
    isRealObjectId(user?._id) &&
    String(currentUserId) !== String(user._id) &&
    user?.role !== 'college';

  // Hydrate the existing connection state so re-renders / page revisits show
  // the right label without forcing the user to refresh.
  useEffect(() => {
    if (!canConnect) return;
    let cancelled = false;
    (async () => {
      try {
        const { data } = await axios.get(`${API_URL}/api/connections/${currentUserId}`);
        const mine = (data || []).find(c => {
          const reqId = String(c.requester?._id || c.requester);
          const recId = String(c.recipient?._id || c.recipient);
          return (
            (reqId === String(currentUserId) && recId === String(user._id)) ||
            (recId === String(currentUserId) && reqId === String(user._id))
          );
        });
        if (!cancelled) setStatus(mine?.status || 'none');
      } catch (e) {
        // backend down — leave default 'none'
      }
    })();
    return () => { cancelled = true; };
  }, [canConnect, currentUserId, user?._id]);

  const handleConnect = async (e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    if (busy || !canConnect) return;
    setBusy(true);
    try {
      const { data } = await axios.post(`${API_URL}/api/connections`, {
        requester: currentUserId,
        recipient: user._id
      });
      setStatus(data.status || 'pending');
    } catch (err) {
      // Already-exists / network — keep state as-is. Surface lightly.
      console.warn('connect failed:', err.response?.data?.error || err.message);
    } finally {
      setBusy(false);
    }
  };

  const buttonLabel = !canConnect
    ? 'View'
    : busy
    ? '…'
    : status === 'accepted'
    ? '✓ Connected'
    : status === 'pending'
    ? '⏳ Pending'
    : compact ? 'Connect' : '+ Connect';

  const buttonClass = (() => {
    if (!canConnect) return 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 border border-gray-200 dark:border-gray-600';
    if (status === 'accepted') return 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 border border-gray-200 dark:border-gray-600';
    if (status === 'pending') return 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-900/40';
    return 'bg-gradient-to-r from-[#2BC0B4] to-[#1a9e93] text-white border border-[#2BC0B4] hover:shadow-md hover:-translate-y-px';
  })();

  if (compact) {
    return (
      <div className="flex items-center gap-3 py-2.5 group">
        <Link href={`/profile/${user._id}`} className="relative flex-shrink-0">
          <span className={`absolute inset-0 rounded-full ring-2 ${user.role === 'alumni' ? 'ring-[#FF8C42]/40' : 'ring-[#2BC0B4]/40'} group-hover:ring-4 transition-all`} />
          <img
            src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'U')}&background=2BC0B4&color=fff`}
            alt={user.name}
            className="w-10 h-10 rounded-full object-cover relative"
          />
        </Link>
        <div className="flex-1 min-w-0">
          <Link href={`/profile/${user._id}`} className="text-sm font-semibold text-[#1a1a2e] dark:text-gray-100 hover:text-[#2BC0B4] block truncate">
            {user.name}
          </Link>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
            {user.occupation || user.education || user.role}
          </p>
        </div>
        {canConnect ? (
          <button
            onClick={handleConnect}
            disabled={busy || status !== 'none'}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all flex-shrink-0 disabled:cursor-default ${buttonClass}`}
          >
            {buttonLabel}
          </button>
        ) : (
          <Link
            href={`/profile/${user._id}`}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-[#2BC0B4] hover:text-[#2BC0B4] transition-all flex-shrink-0"
          >
            View
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="card hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
      <div className="flex items-start gap-3">
        <Link href={`/profile/${user._id}`} className="relative flex-shrink-0">
          <img
            src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'U')}&background=2BC0B4&color=fff`}
            alt={user.name}
            className={`w-14 h-14 rounded-full object-cover border-2 ${user.role === 'alumni' ? 'border-[#FF8C42]' : 'border-[#2BC0B4]'}`}
          />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <Link href={`/profile/${user._id}`} className="font-semibold text-[#1a1a2e] dark:text-gray-100 hover:text-[#2BC0B4] truncate">
              {user.name}
            </Link>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${user.role === 'alumni' ? 'bg-[#FF8C42]/10 text-[#FF8C42]' : 'bg-[#2BC0B4]/10 text-[#2BC0B4]'}`}>
              {user.role}
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
            {user.occupation || user.education}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{user.location}</p>
          <div className="flex flex-wrap gap-1 mt-2">
            {user.topSkills?.slice(0, 3).map(skill => (
              <span key={skill} className="tag bg-[#e8faf9] dark:bg-teal-900/30 text-[#2BC0B4] text-xs px-2 py-0.5">
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="flex gap-2 mt-3">
        {canConnect ? (
          <button
            onClick={handleConnect}
            disabled={busy || status !== 'none'}
            className={`flex-1 text-sm font-semibold py-2 rounded-lg transition-all disabled:cursor-default ${buttonClass}`}
          >
            {buttonLabel}
          </button>
        ) : (
          <Link
            href={`/profile/${user._id}`}
            className="flex-1 text-sm font-semibold py-2 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-[#2BC0B4] hover:text-[#2BC0B4] text-center transition-all"
          >
            View profile
          </Link>
        )}
        <Link href={`/chat?user=${user._id}`} className="flex-1 text-sm font-semibold py-2 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-[#2BC0B4] hover:text-[#2BC0B4] text-center transition-all">
          Message
        </Link>
      </div>
    </div>
  );
}
