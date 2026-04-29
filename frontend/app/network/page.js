'use client';
import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import Navbar from '../../components/Navbar';
import RoleSwitcher from '../../components/RoleSwitcher';
import UserCard from '../../components/UserCard';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function NetworkPage() {
  const { currentUser } = useSelector(state => state.user);
  const [users, setUsers] = useState([]);
  const [tab, setTab] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const myCollege = currentUser?.college;
  const myId = currentUser?._id;

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(`${API_URL}/api/users`);
        setUsers(res.data || []);
      } catch (e) {
        setUsers([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const collegeMembers = useMemo(() => {
    return users
      .filter(u => u.role !== 'college')
      .filter(u => String(u._id) !== String(myId))
      .filter(u => !myCollege || u.college === myCollege);
  }, [users, myId, myCollege]);

  const visible = useMemo(() => {
    const q = search.toLowerCase().trim();
    return collegeMembers
      .filter(u => tab === 'All' ? true : u.role === tab.toLowerCase().replace(/s$/, ''))
      .filter(u =>
        !q ||
        u.name?.toLowerCase().includes(q) ||
        u.occupation?.toLowerCase().includes(q) ||
        u.education?.toLowerCase().includes(q) ||
        (u.topSkills || []).some(s => s.toLowerCase().includes(q))
      );
  }, [collegeMembers, tab, search]);

  const studentsCount = collegeMembers.filter(u => u.role === 'student').length;
  const alumniCount = collegeMembers.filter(u => u.role === 'alumni').length;

  return (
    <div className="min-h-screen bg-[#f8fafb] dark:bg-gray-950">
      <RoleSwitcher />
      <Navbar type="app" />

      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex items-end justify-between mb-5">
          <div>
            <h1 className="text-2xl font-bold text-[#1a1a2e] dark:text-gray-100">Your Network</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {myCollege ? `Everyone at ${myCollege}` : 'Discover people on Bridgix'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wider font-semibold">Total</p>
            <p className="text-xl font-bold text-[#2BC0B4]">{collegeMembers.length}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="flex gap-1 bg-white dark:bg-gray-800 rounded-xl p-1 shadow-sm border border-gray-100 dark:border-gray-700">
            {[
              { label: 'All',      count: collegeMembers.length },
              { label: 'Students', count: studentsCount },
              { label: 'Alumni',   count: alumniCount },
            ].map(t => (
              <button
                key={t.label}
                onClick={() => setTab(t.label)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                  tab === t.label
                    ? 'bg-[#2BC0B4] text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
              >
                {t.label} <span className="ml-1 text-xs opacity-80">{t.count}</span>
              </button>
            ))}
          </div>
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by name, role, skill, occupation…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input-field pl-9 w-full"
            />
            <svg className="w-4 h-4 text-gray-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[0, 1, 2, 3].map(i => (
              <div key={i} className="card animate-pulse">
                <div className="flex items-start gap-3">
                  <div className="w-14 h-14 rounded-full bg-gray-200 dark:bg-gray-700" />
                  <div className="flex-1 space-y-2 pt-2">
                    <div className="h-3 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
                    <div className="h-2 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
                    <div className="h-2 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div className="card text-center py-12">
            <span className="text-4xl block mb-2">🔎</span>
            <p className="text-sm font-semibold text-[#1a1a2e] dark:text-gray-100">No one matches</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Try a different search or switch tabs.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {visible.map(user => (
              <UserCard key={user._id} user={user} currentUserId={myId} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
