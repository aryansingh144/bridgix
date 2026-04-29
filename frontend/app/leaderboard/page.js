'use client';
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import Navbar from '../../components/Navbar';
import RoleSwitcher from '../../components/RoleSwitcher';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const mockLeaderboard = [
  { rank: 1, name: 'Aryan Singh', avatar: 'https://ui-avatars.com/api/?name=Aryan+Singh&background=2BC0B4&color=fff', points: 105, college: 'IIT Delhi', role: 'student', trend: 'up' },
  { rank: 2, name: 'Adarsh', avatar: 'https://ui-avatars.com/api/?name=Adarsh&background=E91E63&color=fff', points: 86, college: 'IIT Kanpur', role: 'student', trend: 'up' },
  { rank: 3, name: 'Mohit Singh', avatar: 'https://ui-avatars.com/api/?name=Mohit+Singh&background=FF8C42&color=fff', points: 72, college: 'NSIT Delhi', role: 'alumni', trend: 'stable' },
  { rank: 4, name: 'Shivansh Sharma', avatar: 'https://ui-avatars.com/api/?name=Shivansh+Sharma&background=6C63FF&color=fff', points: 61, college: 'IIT Bombay', role: 'alumni', trend: 'up' },
  { rank: 5, name: 'Dhruv Baliyan', avatar: 'https://ui-avatars.com/api/?name=Dhruv+Baliyan&background=2BC0B4&color=fff', points: 55, college: 'NSIT Delhi', role: 'student', trend: 'up' },
  { rank: 6, name: 'Rajat Kumar', avatar: 'https://ui-avatars.com/api/?name=Rajat+Kumar&background=9C27B0&color=fff', points: 44, college: 'University of Rajasthan', role: 'student', trend: 'stable' },
  { rank: 7, name: 'Bhavesh Sharma', avatar: 'https://ui-avatars.com/api/?name=Bhavesh+Sharma&background=2196F3&color=fff', points: 42, college: 'BITS Pilani', role: 'student', trend: 'down' },
  { rank: 8, name: 'Paresh Talwa', avatar: 'https://ui-avatars.com/api/?name=Paresh+Talwa&background=4CAF50&color=fff', points: 38, college: 'NSIT Delhi', role: 'alumni', trend: 'stable' },
  { rank: 9, name: 'Ritwik Jadeja', avatar: 'https://ui-avatars.com/api/?name=Ritwik+Jadeja&background=FF5722&color=fff', points: 29, college: 'CoEP', role: 'alumni', trend: 'up' },
  { rank: 10, name: 'Abhilasha Verma', avatar: 'https://ui-avatars.com/api/?name=Abhilasha+Verma&background=E91E63&color=fff', points: 18, college: 'Delhi University', role: 'student', trend: 'down' },
  { rank: 11, name: 'Karan Mehta', avatar: 'https://ui-avatars.com/api/?name=Karan+Mehta&background=FF9800&color=fff', points: 15, college: 'NIT Trichy', role: 'student', trend: 'up' },
  { rank: 12, name: 'Priya Nair', avatar: 'https://ui-avatars.com/api/?name=Priya+Nair&background=009688&color=fff', points: 12, college: 'IIT Madras', role: 'student', trend: 'stable' },
];

export default function LeaderboardPage() {
  const { currentUser } = useSelector(state => state.user);
  const [tab, setTab] = useState('All Time');
  const [search, setSearch] = useState('');
  const [leaderboard, setLeaderboard] = useState(mockLeaderboard);
  const [sort, setSort] = useState('Top');

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/leaderboard`);
        if (res.data && res.data.length > 0) {
          setLeaderboard(res.data.map((u, i) => ({ ...u, rank: i + 1, trend: 'stable' })));
        }
      } catch (e) {
        setLeaderboard(mockLeaderboard);
      }
    };
    fetchLeaderboard();
  }, []);

  // Strict college isolation: a signed-in user only sees peers from their
  // own college. (Spreading scores across institutions defeats the
  // intra-college mentorship narrative.)
  const myCollege = currentUser?.college;
  const isolated = myCollege
    ? leaderboard.filter(u => u.college === myCollege)
    : leaderboard;

  const filtered = isolated
    .map((u, i) => ({ ...u, rank: i + 1 }))         // re-rank inside the cohort
    .filter(u =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.college?.toLowerCase().includes(search.toLowerCase())
    );

  const top3 = filtered.slice(0, 3);
  const rest = filtered.slice(3);

  const rankBadge = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return rank;
  };

  const trendIcon = (trend) => {
    if (trend === 'up') return <span className="text-green-500 text-xs">▲</span>;
    if (trend === 'down') return <span className="text-red-400 text-xs">▼</span>;
    return <span className="text-gray-400 dark:text-gray-500 text-xs">—</span>;
  };

  return (
    <div className="min-h-screen bg-[#f8fafb] dark:bg-gray-950">
      <RoleSwitcher />
      <Navbar type="app" />

      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-[#1a1a2e] dark:text-gray-100">Leaderboard</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            {myCollege ? `Top contributors at ${myCollege}` : 'Top contributors across the Bridgix network'}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white dark:bg-gray-800 rounded-xl p-1 mb-5 shadow-sm border border-gray-100 dark:border-gray-700">
          {['Daily', 'Weekly', 'All Time'].map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
                tab === t
                  ? 'bg-[#2BC0B4] text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Search and Sort */}
        <div className="flex gap-3 mb-5">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search your College or Name..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input-field pl-9"
            />
            <svg className="w-4 h-4 text-gray-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            className="input-field w-36"
          >
            <option>Top</option>
            <option>Newest</option>
            <option>By College</option>
          </select>
        </div>

        {/* Top 3 Podium */}
        {top3.length >= 3 && (
          <div className="bg-gradient-to-br from-[#2BC0B4] to-[#1a9e93] rounded-2xl p-6 mb-5 text-white">
            <h3 className="text-center font-semibold text-white/80 text-sm mb-6 uppercase tracking-wider">Hall of Fame</h3>
            <div className="flex items-end justify-center gap-4">
              {/* 2nd place */}
              <div className="flex flex-col items-center">
                <img src={top3[1].avatar} alt={top3[1].name} className="w-14 h-14 rounded-full mb-2" style={{border: '3px solid rgba(255,255,255,0.5)'}} />
                <span className="text-2xl">🥈</span>
                <p className="font-semibold text-sm mt-1 text-center">{top3[1].name.split(' ')[0]}</p>
                <p className="text-white/70 text-xs">{top3[1].points} pts</p>
                <div className="bg-white/20 rounded-t-lg w-16 h-16 mt-2 flex items-center justify-center font-bold text-xl">2</div>
              </div>

              {/* 1st place */}
              <div className="flex flex-col items-center -mt-4">
                <div className="text-2xl mb-1">👑</div>
                <img src={top3[0].avatar} alt={top3[0].name} className="w-18 h-18 rounded-full mb-2" style={{width: '72px', height: '72px', border: '3px solid #FFD700'}} />
                <span className="text-3xl">🥇</span>
                <p className="font-bold mt-1 text-center">{top3[0].name.split(' ')[0]}</p>
                <p className="text-white/80 text-xs">{top3[0].points} pts</p>
                <div className="bg-white/30 rounded-t-lg w-16 h-24 mt-2 flex items-center justify-center font-bold text-2xl">1</div>
              </div>

              {/* 3rd place */}
              <div className="flex flex-col items-center">
                <img src={top3[2].avatar} alt={top3[2].name} className="w-14 h-14 rounded-full mb-2" style={{border: '3px solid rgba(255,255,255,0.3)'}} />
                <span className="text-2xl">🥉</span>
                <p className="font-semibold text-sm mt-1 text-center">{top3[2].name.split(' ')[0]}</p>
                <p className="text-white/70 text-xs">{top3[2].points} pts</p>
                <div className="bg-white/20 rounded-t-lg w-16 h-12 mt-2 flex items-center justify-center font-bold text-lg">3</div>
              </div>
            </div>
          </div>
        )}

        {/* Rankings List */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          {filtered.map((user) => {
            const isCurrentUser = user.name === currentUser?.name;
            return (
              <div
                key={user._id || user.name}
                className={`flex items-center gap-4 px-5 py-4 border-b border-gray-50 dark:border-gray-700/50 transition-colors ${
                  isCurrentUser
                    ? 'bg-[#e8faf9] dark:bg-teal-900/20 border-l-4 border-l-[#2BC0B4]'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700/40'
                }`}
              >
                {/* Rank */}
                <div className="w-8 text-center flex-shrink-0">
                  {user.rank <= 3 ? (
                    <span className="text-xl">{rankBadge(user.rank)}</span>
                  ) : (
                    <span className="text-sm font-bold text-gray-500 dark:text-gray-400">#{user.rank}</span>
                  )}
                </div>

                {/* Avatar */}
                <img
                  src={user.avatar}
                  alt={user.name}
                  className={`w-11 h-11 rounded-full flex-shrink-0 ${isCurrentUser ? 'ring-2 ring-[#2BC0B4]' : ''}`}
                />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`font-semibold text-sm truncate ${isCurrentUser ? 'text-[#2BC0B4]' : 'text-[#1a1a2e] dark:text-gray-100'}`}>
                      {user.name} {isCurrentUser && <span className="text-xs font-normal text-gray-500 dark:text-gray-400">(You)</span>}
                    </p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${
                      user.role === 'alumni'
                        ? 'bg-[#FF8C42]/10 text-[#FF8C42]'
                        : 'bg-[#2BC0B4]/10 text-[#2BC0B4]'
                    }`}>{user.role}</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.college || user.education}</p>
                </div>

                {/* Points */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {trendIcon(user.trend)}
                  <div className="text-right">
                    <p className="text-sm font-bold text-[#1a1a2e] dark:text-gray-100">{user.points}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">points</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Your Ranking */}
        <div className="mt-5 bg-gradient-to-r from-[#2BC0B4]/10 to-[#1a9e93]/10 dark:from-teal-900/30 dark:to-teal-800/20 rounded-xl p-4 border border-[#2BC0B4]/30 dark:border-teal-700/40">
          <div className="flex items-center gap-3">
            <img src={currentUser?.avatar} alt={currentUser?.name} className="w-12 h-12 rounded-full" />
            <div className="flex-1">
              <p className="font-semibold text-[#1a1a2e] dark:text-gray-100">Your Ranking</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">You're ranked #{mockLeaderboard.findIndex(u => u.name === currentUser?.name) + 1 || 5} with {currentUser?.points || 55} points</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 dark:text-gray-400">Points to next rank</p>
              <p className="font-bold text-[#2BC0B4]">+17 pts</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
