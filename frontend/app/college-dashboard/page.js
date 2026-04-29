'use client';
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import Navbar from '../../components/Navbar';
import RoleSwitcher from '../../components/RoleSwitcher';
import dynamic from 'next/dynamic';
import { TOKEN_KEY } from '../../lib/api';

const ActivityChart = dynamic(() => import('../../components/ActivityChart'), { ssr: false });

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const sidebarLinks = [
  { label: 'Overview',   icon: '🏛️' },
  { label: 'Students',   icon: '🎓' },
  { label: 'Alumni',     icon: '👔' },
  { label: 'Events',     icon: '🎉' },
  { label: 'Moderation', icon: '🛡️', href: '/moderation' },
  { label: 'Leaderboard',icon: '🏆', href: '/leaderboard' },
];

function formatEventDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function CollegeDashboardPage() {
  const router = useRouter();
  const { currentUser, isAuthenticated } = useSelector(state => state.user);
  const [activeLink, setActiveLink] = useState('Overview');
  const [activeEventIdx, setActiveEventIdx] = useState(0);
  const [showEdit, setShowEdit] = useState(false);

  const [college, setCollege] = useState(null);
  const [stats, setStats] = useState(null);
  const [events, setEvents] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [topStudents, setTopStudents] = useState([]);
  const [topAlumni, setTopAlumni] = useState([]);

  // Guard: only college-role authenticated users belong here. Wait one tick
  // for Bootstrap's /me round-trip before deciding.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const token = window.localStorage.getItem(TOKEN_KEY);
    if (!token) {
      router.replace('/login');
      return;
    }
    if (isAuthenticated && currentUser?.role && currentUser.role !== 'college') {
      router.replace('/home');
    }
  }, [isAuthenticated, currentUser?.role, router]);

  useEffect(() => {
    (async () => {
      try {
        const [collegesRes, statsRes, eventsRes, leaderRes, usersRes] = await Promise.all([
          axios.get(`${API_URL}/api/colleges`),
          axios.get(`${API_URL}/api/stats`),
          axios.get(`${API_URL}/api/events`),
          axios.get(`${API_URL}/api/leaderboard`),
          axios.get(`${API_URL}/api/users`)
        ]);
        // Pick the college the *logged-in admin* belongs to. Falls back to
        // first college if for some reason their college field is missing.
        const colleges = collegesRes.data || [];
        const myCollege = colleges.find(c => c.name === currentUser?.college) || colleges[0] || null;
        setCollege(myCollege);
        setStats(statsRes.data || null);
        setEvents(eventsRes.data || []);
        setAllUsers(usersRes.data || []);
        const collegeNameForFilter = myCollege?.name || currentUser?.college;
        const ranked = (leaderRes.data || []).filter(u => u.college === collegeNameForFilter);
        setTopStudents(ranked.filter(u => u.role === 'student').slice(0, 5));
        setTopAlumni(ranked.filter(u => u.role === 'alumni').slice(0, 5));
      } catch (e) {
        // backend down — leave panels empty
      }
    })();
  }, [currentUser?.college]);

  const collegeName = college?.name || currentUser?.college || 'Your College';

  // Strict filter: only users whose `college` field matches the admin's
  // college. Membership in the College document's arrays is also accepted
  // as a fallback (in case the user's `college` string was never set).
  const collegeMemberIds = new Set([
    ...(college?.students || []).map(s => String(s._id || s)),
    ...(college?.alumni || []).map(a => String(a._id || a))
  ]);
  const usersHere = allUsers.filter(u =>
    (u.college && u.college === collegeName) || collegeMemberIds.has(String(u._id))
  );
  const collegeStudents = usersHere.filter(u => u.role === 'student');
  const collegeAlumni = usersHere.filter(u => u.role === 'alumni');

  // Stat cards are college-scoped (NOT platform-wide). Connections/events
  // stay platform-wide as a "your college on the wider platform" signal.
  const statCards = [
    { label: 'Your Students', value: collegeStudents.length, icon: '🎓', color: '#2BC0B4' },
    { label: 'Your Alumni',   value: collegeAlumni.length,   icon: '👔', color: '#FF8C42' },
    { label: 'Platform Connections', value: stats?.connections ?? '—', icon: '🤝', color: '#6C63FF' },
    { label: 'Platform Events',      value: stats?.events ?? '—',      icon: '🎉', color: '#4CAF50' },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafb] dark:bg-gray-950">
      <RoleSwitcher />
      <Navbar type="app" />

      <div className="max-w-7xl mx-auto px-4 py-5">
        <div className="flex gap-5">
          {/* Left Sidebar */}
          <div className="w-56 shrink-0">
            <div className="card mb-3">
              <div className="flex flex-col items-center text-center pb-3 border-b border-gray-100 dark:border-gray-700 mb-3">
                <div className="w-14 h-14 bg-gradient-to-br from-[#2BC0B4] to-[#1a9e93] rounded-xl flex items-center justify-center mb-2 overflow-hidden">
                  {college?.logo ? (
                    <img src={college.logo} alt={collegeName} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl">🏛️</span>
                  )}
                </div>
                <h3 className="font-bold text-[#1a1a2e] dark:text-gray-100 text-sm">{collegeName}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Admin Dashboard</p>
              </div>
              <nav className="space-y-1">
                {sidebarLinks.map(link => link.href ? (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="w-full text-left flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-all"
                  >
                    <span>{link.icon}</span>
                    <span>{link.label}</span>
                  </Link>
                ) : (
                  <button
                    key={link.label}
                    onClick={() => setActiveLink(link.label)}
                    className={`w-full text-left flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-all ${
                      activeLink === link.label
                        ? 'bg-[#e8faf9] dark:bg-teal-900/30 text-[#2BC0B4] font-semibold'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/40'
                    }`}
                  >
                    <span>{link.icon}</span>
                    <span>{link.label}</span>
                  </button>
                ))}
              </nav>
            </div>

            {/* Quick Actions */}
            <div className="card">
              <h4 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Quick Actions</h4>
              <div className="space-y-1">
                {['Post Announcement', 'Create Event', 'Add Student', 'Generate Report'].map(action => (
                  <button key={action} className="w-full text-left text-xs text-gray-600 dark:text-gray-300 hover:text-[#2BC0B4] py-2 px-3 rounded-lg hover:bg-[#e8faf9] dark:hover:bg-teal-900/20 transition-all">
                    + {action}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-[#1a1a2e] dark:text-gray-100">{activeLink === 'Overview' ? 'University Dashboard' : activeLink}</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Welcome back, {currentUser?.name || `${collegeName} Admin`}</p>
              </div>
              <button
                onClick={() => setShowEdit(!showEdit)}
                className="btn-primary text-sm"
              >
                ✏️ Update Details
              </button>
            </div>

            {/* ── Students panel ─────────────────────────────────────── */}
            {activeLink === 'Students' && (
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-[#1a1a2e] dark:text-gray-100">Students at {collegeName} <span className="text-sm text-gray-400 dark:text-gray-500 font-normal ml-1">({collegeStudents.length})</span></h2>
                </div>
                {collegeStudents.length === 0 ? (
                  <p className="text-xs text-gray-400 dark:text-gray-500 text-center py-8">No students registered from this college yet.</p>
                ) : (
                  <div className="divide-y divide-gray-100 dark:divide-gray-700">
                    {collegeStudents.map(s => (
                      <Link key={s._id} href={`/profile/${s._id}`} className="flex items-center gap-3 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/40 -mx-2 px-2 rounded-lg transition-colors">
                        <img src={s.avatar} alt={s.name} className="w-11 h-11 rounded-full flex-shrink-0 border-2 border-[#2BC0B4]/40" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-[#1a1a2e] dark:text-gray-100 truncate">{s.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {s.yearOfStudy ? `${s.yearOfStudy} · ` : ''}{s.education || '—'}
                          </p>
                          {s.topSkills?.length > 0 && (
                            <p className="text-[10px] text-gray-400 dark:text-gray-500 truncate mt-0.5">
                              {s.topSkills.slice(0, 4).join(' · ')}
                            </p>
                          )}
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm font-bold text-[#2BC0B4]">{s.points || 0} pts</p>
                          <p className="text-[10px] text-gray-400 dark:text-gray-500">{s.email}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── Alumni panel ───────────────────────────────────────── */}
            {activeLink === 'Alumni' && (
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-[#1a1a2e] dark:text-gray-100">Alumni from {collegeName} <span className="text-sm text-gray-400 dark:text-gray-500 font-normal ml-1">({collegeAlumni.length})</span></h2>
                </div>
                {collegeAlumni.length === 0 ? (
                  <p className="text-xs text-gray-400 dark:text-gray-500 text-center py-8">No alumni registered from this college yet.</p>
                ) : (
                  <div className="divide-y divide-gray-100 dark:divide-gray-700">
                    {collegeAlumni.map(a => (
                      <Link key={a._id} href={`/profile/${a._id}`} className="flex items-center gap-3 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/40 -mx-2 px-2 rounded-lg transition-colors">
                        <img src={a.avatar} alt={a.name} className="w-11 h-11 rounded-full flex-shrink-0 border-2 border-[#FF8C42]/40" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-[#1a1a2e] dark:text-gray-100 truncate">{a.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{a.occupation || '—'}</p>
                          {a.services?.length > 0 && (
                            <p className="text-[10px] text-gray-400 dark:text-gray-500 truncate mt-0.5">
                              Offers: {a.services.slice(0, 3).join(' · ')}
                            </p>
                          )}
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm font-bold text-[#FF8C42]">{a.points || 0} pts</p>
                          <p className="text-[10px] text-gray-400 dark:text-gray-500">{a.email}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── Events panel ───────────────────────────────────────── */}
            {activeLink === 'Events' && (
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-[#1a1a2e] dark:text-gray-100">All Events <span className="text-sm text-gray-400 dark:text-gray-500 font-normal ml-1">({events.length})</span></h2>
                </div>
                {events.length === 0 ? (
                  <p className="text-xs text-gray-400 dark:text-gray-500 text-center py-8">No events scheduled.</p>
                ) : (
                  <div className="space-y-3">
                    {events.map(event => (
                      <Link key={event._id} href={`/events/${event._id}`} className="flex items-start gap-4 p-3 border border-gray-100 dark:border-gray-700 rounded-xl hover:shadow-sm hover:border-[#2BC0B4]/40 transition-all">
                        <img
                          src={event.image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=200'}
                          alt={event.title}
                          className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-[#1a1a2e] dark:text-gray-100 text-sm truncate">{event.title}</h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">📅 {formatEventDate(event.date)} · 📍 {event.location}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">👥 {event.attendees?.length || 0} attending · 💰 {event.entryFee || 'Free'}</p>
                          {event.speakers?.length > 0 && (
                            <p className="text-[10px] text-gray-400 dark:text-gray-500 truncate mt-1">
                              Speakers: {event.speakers.slice(0, 3).join(', ')}
                            </p>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── Overview panel (default) ───────────────────────────── */}
            {activeLink === 'Overview' && (
              <>
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {statCards.length === 0 && (
                <div className="col-span-full text-center text-xs text-gray-400 dark:text-gray-500 py-4">Loading platform stats…</div>
              )}
              {statCards.map(stat => (
                <div key={stat.label} className="card hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-2">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: stat.color + '20' }}>
                      <span className="text-xl">{stat.icon}</span>
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-[#1a1a2e] dark:text-gray-100">{stat.value}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Event Carousel */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-[#1a1a2e] dark:text-gray-100">Upcoming Events</h2>
                <button className="text-[#2BC0B4] text-sm hover:underline">+ Create Event</button>
              </div>
              {events.length === 0 ? (
                <p className="text-xs text-gray-400 dark:text-gray-500 text-center py-6">No events scheduled.</p>
              ) : (
                <div className="relative overflow-hidden rounded-xl">
                  <div className="flex transition-transform duration-500" style={{ transform: `translateX(-${activeEventIdx * 100}%)` }}>
                    {events.map(event => (
                      <div key={event._id} className="w-full flex-shrink-0 relative">
                        <img
                          src={event.image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800'}
                          alt={event.title}
                          className="w-full h-48 object-cover rounded-xl"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-xl"></div>
                        <div className="absolute bottom-3 left-3 right-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-white font-bold text-sm">{event.title}</h3>
                              <p className="text-white/80 text-xs">📅 {formatEventDate(event.date)} · 👥 {event.attendees?.length || 0} attending · 📍 {event.location}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="absolute bottom-14 right-3 flex gap-1">
                    {events.map((_, i) => (
                      <button key={i} onClick={() => setActiveEventIdx(i)} className={`w-2 h-2 rounded-full transition-all ${i === activeEventIdx ? 'bg-white w-4' : 'bg-white/50'}`} />
                    ))}
                  </div>
                  <button onClick={() => setActiveEventIdx(prev => Math.max(0, prev - 1))} className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center hover:bg-white transition-colors">
                    ‹
                  </button>
                  <button onClick={() => setActiveEventIdx(prev => Math.min(events.length - 1, prev + 1))} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center hover:bg-white transition-colors">
                    ›
                  </button>
                </div>
              )}
            </div>

            {/* Activity Chart */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-bold text-[#1a1a2e] dark:text-gray-100">Users Activity</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Last 12 months activity overview</p>
                </div>
                <select className="input-field w-32 text-xs py-2">
                  <option>Last 12 months</option>
                  <option>Last 6 months</option>
                  <option>This year</option>
                </select>
              </div>
              <ActivityChart />
            </div>

            {/* Top Students and Alumni — pulled from leaderboard */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="card">
                <h3 className="font-semibold text-[#1a1a2e] dark:text-gray-100 mb-3">Top Students</h3>
                {topStudents.length === 0 ? (
                  <p className="text-xs text-gray-400 dark:text-gray-500 text-center py-4">No student data yet.</p>
                ) : (
                  <div className="space-y-3">
                    {topStudents.map((s, i) => (
                      <div key={s._id} className="flex items-center gap-3">
                        <span className="w-5 h-5 bg-[#2BC0B4]/20 rounded-full flex items-center justify-center text-xs font-bold text-[#2BC0B4] flex-shrink-0">{i + 1}</span>
                        <img src={s.avatar} alt={s.name} className="w-9 h-9 rounded-full flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-[#1a1a2e] dark:text-gray-100 truncate">{s.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{s.education || s.college}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm font-bold text-[#2BC0B4]">{s.points} pts</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="card">
                <h3 className="font-semibold text-[#1a1a2e] dark:text-gray-100 mb-3">Top Alumni</h3>
                {topAlumni.length === 0 ? (
                  <p className="text-xs text-gray-400 dark:text-gray-500 text-center py-4">No alumni data yet.</p>
                ) : (
                  <div className="space-y-3">
                    {topAlumni.map((a, i) => (
                      <div key={a._id} className="flex items-center gap-3">
                        <span className="w-5 h-5 bg-[#FF8C42]/20 rounded-full flex items-center justify-center text-xs font-bold text-[#FF8C42] flex-shrink-0">{i + 1}</span>
                        <img src={a.avatar} alt={a.name} className="w-9 h-9 rounded-full flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-[#1a1a2e] dark:text-gray-100 truncate">{a.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{a.education || a.college}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm font-bold text-[#FF8C42]">{a.points} pts</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Update Details Modal */}
      {showEdit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-[#1a1a2e] dark:text-gray-100">Update College Details</h3>
              <button onClick={() => setShowEdit(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">✕</button>
            </div>
            <div className="space-y-3">
              <input type="text" placeholder="College Name" defaultValue={college?.name || ''} className="input-field" />
              <input type="email" placeholder="College Email" defaultValue={college?.email || ''} className="input-field" />
              <input type="text" placeholder="AICTE Code" defaultValue={college?.aicteCode || ''} className="input-field" />
              <input type="text" placeholder="Logo URL" defaultValue={college?.logo || ''} className="input-field" />
              <div className="flex gap-2">
                <button onClick={() => setShowEdit(false)} className="btn-outline flex-1 text-sm">Cancel</button>
                <button onClick={() => setShowEdit(false)} className="btn-primary flex-1 text-sm">Save Changes</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
