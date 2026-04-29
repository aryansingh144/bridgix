'use client';
import { useEffect, useState, Suspense } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import RoleSwitcher from '../../components/RoleSwitcher';
import Sidebar from '../../components/Sidebar';
import PostCard from '../../components/PostCard';
import UserCard from '../../components/UserCard';
import { setPosts, addPost } from '../../store/slices/appSlice';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const placementAlumni = [
  { _id: 'u1', name: 'Mohit Singh', avatar: 'https://ui-avatars.com/api/?name=Mohit+Singh&background=FF8C42&color=fff', occupation: 'Sr. Engineer at Google', role: 'alumni', topSkills: ['System Design', 'Interviews'], services: ['Mock Interviews', 'Resume Review', 'FAANG Prep'] },
  { _id: 'u5', name: 'Paresh Talwa', avatar: 'https://ui-avatars.com/api/?name=Paresh+Talwa&background=4CAF50&color=fff', occupation: 'PM at Flipkart', role: 'alumni', topSkills: ['Product Mgmt', 'Case Studies'], services: ['PM Interviews', 'Career Switch Advice'] },
  { _id: 'u9', name: 'Ritwik Jadeja', avatar: 'https://ui-avatars.com/api/?name=Ritwik+Jadeja&background=FF5722&color=fff', occupation: 'Co-Founder at TechBridge', role: 'alumni', topSkills: ['Startups', 'Hiring'], services: ['Startup Hiring', 'Portfolio Review'] },
];

const academicResources = [
  { id: 'a1', title: 'Complete DSA Roadmap', author: 'Mohit Singh', type: 'Roadmap', tags: ['DSA', 'LeetCode', 'Interviews'], desc: 'A step-by-step guide from arrays to advanced graphs, curated from FAANG interview experience.' },
  { id: 'a2', title: 'Machine Learning Fundamentals', author: 'Shivansh Sharma', type: 'Guide', tags: ['ML', 'Python', 'Statistics'], desc: 'Everything you need to understand ML from scratch — maths, code, and real projects.' },
  { id: 'a3', title: 'System Design for Beginners', author: 'Mohit Singh', type: 'Course', tags: ['System Design', 'Architecture'], desc: 'Learn to design scalable systems from someone who builds them at Google scale.' },
  { id: 'a4', title: 'Web Dev Full Stack Guide', author: 'Aryan Singh', type: 'Guide', tags: ['React', 'Node.js', 'MongoDB'], desc: 'Build real-world full stack apps with the MERN stack. Includes 3 project walkthroughs.' },
];

// ─── Tab-specific content panels ────────────────────────────────────────────

function PlacementTab() {
  return (
    <div className="space-y-4">
      <div className="card bg-gradient-to-r from-[#FF8C42]/10 to-[#FF8C42]/5 dark:from-[#FF8C42]/10 dark:to-transparent border-[#FF8C42]/20">
        <h2 className="font-bold text-[#1a1a2e] dark:text-gray-100 mb-1">💼 Placement Assistance</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Connect with alumni who can help you land your dream job through mock interviews, resume reviews, and referrals.</p>
      </div>
      {placementAlumni.map(alumni => (
        <div key={alumni._id} className="card">
          <div className="flex items-start gap-3">
            <img src={alumni.avatar} alt={alumni.name} className="w-12 h-12 rounded-full flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <h3 className="font-semibold text-[#1a1a2e] dark:text-gray-100 text-sm">{alumni.name}</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#FF8C42]/10 text-[#FF8C42] font-medium">Alumni</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{alumni.occupation}</p>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {alumni.services.map(s => (
                  <span key={s} className="text-xs bg-[#e8faf9] dark:bg-teal-900/30 text-[#2BC0B4] px-2 py-0.5 rounded-full">{s}</span>
                ))}
              </div>
              <div className="flex gap-2">
                <button className="btn-primary text-xs py-1.5 px-3">Request Session</button>
                <button className="btn-outline text-xs py-1.5 px-3">View Profile</button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function AcademicTab() {
  return (
    <div className="space-y-4">
      <div className="card bg-gradient-to-r from-[#2BC0B4]/10 to-[#2BC0B4]/5 dark:from-[#2BC0B4]/10 dark:to-transparent border-[#2BC0B4]/20">
        <h2 className="font-bold text-[#1a1a2e] dark:text-gray-100 mb-1">📚 Academic Support</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Access curated resources, roadmaps, and guides shared by alumni to help you excel academically and technically.</p>
      </div>
      {academicResources.map(res => (
        <div key={res.id} className="card hover:border-[#2BC0B4]/40 transition-colors cursor-pointer">
          <div className="flex items-start justify-between gap-3 mb-2">
            <h3 className="font-semibold text-[#1a1a2e] dark:text-gray-100 text-sm">{res.title}</h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 flex-shrink-0">{res.type}</span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 leading-relaxed">{res.desc}</p>
          <div className="flex items-center justify-between">
            <div className="flex gap-1.5">
              {res.tags.map(t => (
                <span key={t} className="text-xs text-[#FF8C42]">#{t}</span>
              ))}
            </div>
            <span className="text-xs text-gray-400 dark:text-gray-500">by {res.author}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function WebinarTab({ currentUserId }) {
  const [events, setEvents] = useState([]);
  const [busyId, setBusyId] = useState(null);
  const colors = ['#FF8C42', '#6C63FF', '#4CAF50', '#2BC0B4'];

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(`${API_URL}/api/events`);
        setEvents(res.data || []);
      } catch (e) {
        setEvents([]);
      }
    })();
  }, []);

  const isRegistered = (event) =>
    !!currentUserId && (event.attendees || []).some(a => String(a._id || a) === String(currentUserId));

  const handleRegister = async (event) => {
    if (!currentUserId || !/^[a-f0-9]{24}$/i.test(currentUserId)) {
      alert('Sign in to register for events.');
      return;
    }
    if (isRegistered(event) || busyId === event._id) return;
    setBusyId(event._id);
    try {
      const { data } = await axios.put(`${API_URL}/api/events/${event._id}/register`, { userId: currentUserId });
      setEvents(prev => prev.map(e => (e._id === event._id ? { ...e, attendees: data.attendees } : e)));
    } catch (e) {
      console.warn('register failed:', e.response?.data?.error || e.message);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="card bg-gradient-to-r from-[#6C63FF]/10 to-[#6C63FF]/5 dark:from-[#6C63FF]/10 dark:to-transparent border-[#6C63FF]/20">
        <h2 className="font-bold text-[#1a1a2e] dark:text-gray-100 mb-1">🎥 Upcoming Events & Webinars</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Join live sessions hosted by alumni on topics ranging from technical interviews to career transitions.</p>
      </div>
      {events.length === 0 && (
        <p className="text-xs text-gray-400 dark:text-gray-500 text-center py-6">No events scheduled yet.</p>
      )}
      {events.map((event, i) => {
        const registered = isRegistered(event);
        const date = new Date(event.date);
        return (
          <div key={event._id} className="card hover:shadow-md transition-all">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-white font-bold text-lg" style={{ backgroundColor: colors[i % colors.length] }}>
                🎙️
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-[#1a1a2e] dark:text-gray-100 text-sm mb-0.5">{event.title}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Speakers: <span className="font-medium text-[#2BC0B4]">{(event.speakers || []).slice(0, 2).join(', ') || '—'}</span></p>
                <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mb-2">
                  <span>📅 {date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  <span>📍 {event.location || 'Online'}</span>
                  <span>👥 {(event.attendees || []).length} attending</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 dark:text-gray-400 truncate pr-2">{event.entryFee || 'Free'}</span>
                  <button
                    onClick={() => handleRegister(event)}
                    disabled={registered || busyId === event._id}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
                      registered
                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                        : 'bg-gradient-to-r from-[#2BC0B4] to-[#1a9e93] text-white hover:shadow'
                    }`}
                  >
                    {busyId === event._id ? '…' : registered ? '✓ Registered' : 'Register'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Main page (inner, uses useSearchParams) ────────────────────────────────

function HomePageInner() {
  const dispatch = useDispatch();
  const { currentUser } = useSelector(state => state.user);
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') || 'feed';

  const [newPost, setNewPost] = useState('');
  const [displayPosts, setDisplayPosts] = useState([]);
  const [posting, setPosting] = useState(false);
  const [postsLoading, setPostsLoading] = useState(true);
  const [people, setPeople] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(`${API_URL}/api/posts`);
        if (res.data) {
          setDisplayPosts(res.data);
          dispatch(setPosts(res.data));
        }
      } catch (e) {
        setDisplayPosts([]);
      } finally {
        setPostsLoading(false);
      }
    })();
  }, [dispatch]);

  // Pull real users + events for the right rail. Skip the current user; the
  // "People You May Know" panel surfaces five candidates (alumni first since
  // they're the high-value connections for students).
  useEffect(() => {
    if (!currentUser?._id) return;
    (async () => {
      try {
        const [usersRes, eventsRes] = await Promise.all([
          axios.get(`${API_URL}/api/users`),
          axios.get(`${API_URL}/api/events`)
        ]);
        // College isolation: signed-in users only see peers from their own
        // college. Falls back to the full directory if college is unknown.
        const myCollege = currentUser.college;
        const others = (usersRes.data || [])
          .filter(u => String(u._id) !== String(currentUser._id) && u.role !== 'college')
          .filter(u => !myCollege || u.college === myCollege)
          .sort((a, b) => (a.role === 'alumni' ? -1 : 1));
        setPeople(others.slice(0, 5));
        setUpcomingEvents((eventsRes.data || []).slice(0, 3));
      } catch (e) {
        setPeople([]);
        setUpcomingEvents([]);
      }
    })();
  }, [currentUser?._id]);

  const [moderationNotice, setModerationNotice] = useState(null);

  const handlePost = async (e) => {
    e.preventDefault();
    if (!newPost.trim()) return;
    setPosting(true);
    const draft = newPost;
    const tempPost = {
      _id: 'temp-' + Date.now(),
      author: currentUser,
      content: draft,
      image: '',
      likes: [],
      comments: [],
      createdAt: new Date().toISOString()
    };
    setDisplayPosts(prev => [tempPost, ...prev]);
    setNewPost('');
    setPosting(false);
    setModerationNotice(null);
    try {
      const res = await axios.post(`${API_URL}/api/posts`, { author: currentUser._id, content: draft });
      const saved = res.data?.post || res.data;
      const moderation = res.data?.moderation;
      if (saved?._id) {
        setDisplayPosts(prev => prev.map(p => (p._id === tempPost._id ? saved : p)));
        dispatch(addPost(saved));
      }
      if (moderation?.flagged) {
        setModerationNotice({
          score: moderation.score,
          reasons: moderation.reasons || []
        });
      }
    } catch (e) {}
  };

  const tabLabels = {
    feed: 'Home Feed',
    placement: 'Placement Assistance',
    academic: 'Academic Support',
    webinar: 'Join Webinar',
  };

  return (
    <div className="min-h-screen bg-[#f8fafb] dark:bg-gray-950">
      <RoleSwitcher />
      <Navbar type="app" />

      <div className="max-w-7xl mx-auto px-4 py-5">
        <div className="flex gap-5">
          <Sidebar />

          {/* Center Feed */}
          <div className="flex-1 min-w-0 max-w-xl">
            {/* Tab heading for non-feed tabs */}
            {activeTab !== 'feed' && (
              <div className="flex items-center gap-2 mb-4">
                <h1 className="text-lg font-bold text-[#1a1a2e] dark:text-gray-100">{tabLabels[activeTab]}</h1>
              </div>
            )}

            {/* Placement tab */}
            {activeTab === 'placement' && <PlacementTab />}

            {/* Academic tab */}
            {activeTab === 'academic' && <AcademicTab />}

            {/* Webinar tab */}
            {activeTab === 'webinar' && <WebinarTab currentUserId={currentUser?._id} />}

            {/* Default feed */}
            {activeTab === 'feed' && (
              <>
                {/* Post Box */}
                <div className="card mb-4">
                  <div className="flex gap-3 mb-3">
                    <img
                      src={currentUser?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser?.name || 'User')}&background=2BC0B4&color=fff`}
                      alt={currentUser?.name || 'User'}
                      className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                    />
                    <form onSubmit={handlePost} className="flex-1">
                      <textarea
                        value={newPost}
                        onChange={e => setNewPost(e.target.value)}
                        placeholder={`What's on your mind, ${currentUser?.name?.split(' ')[0]}?`}
                        className="w-full border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#2BC0B4] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                        rows={3}
                      />
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex gap-2">
                          <button type="button" className="text-gray-400 dark:text-gray-500 hover:text-[#2BC0B4] text-sm flex items-center gap-1">
                            <span>📷</span> Photo
                          </button>
                          <button type="button" className="text-gray-400 dark:text-gray-500 hover:text-[#2BC0B4] text-sm flex items-center gap-1">
                            <span>🎥</span> Video
                          </button>
                          <button type="button" className="text-gray-400 dark:text-gray-500 hover:text-[#2BC0B4] text-sm flex items-center gap-1">
                            <span>📎</span> File
                          </button>
                        </div>
                        <button
                          type="submit"
                          disabled={!newPost.trim() || posting}
                          className="btn-primary text-sm px-5 py-2 disabled:opacity-50"
                        >
                          {posting ? 'Posting...' : 'Post'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>

                {moderationNotice && (
                  <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/40 flex items-start gap-3">
                    <span className="text-xl">🛡️</span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-red-700 dark:text-red-400">
                        Your post was flagged ({Math.round((moderationNotice.score || 0) * 100)}% spam) and is awaiting review.
                      </p>
                      {moderationNotice.reasons?.length > 0 && (
                        <p className="text-xs text-red-600 dark:text-red-300 mt-1">
                          Reasons: {moderationNotice.reasons.join(', ')}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => setModerationNotice(null)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      ✕
                    </button>
                  </div>
                )}

                {/* Posts */}
                <div>
                  {postsLoading && displayPosts.length === 0 && (
                    <div className="space-y-4">
                      {[0, 1].map(i => (
                        <div key={i} className="card animate-pulse">
                          <div className="flex gap-3 mb-3">
                            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700" />
                            <div className="flex-1 space-y-2">
                              <div className="h-3 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
                              <div className="h-2 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
                            </div>
                          </div>
                          <div className="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                          <div className="h-3 w-4/5 bg-gray-200 dark:bg-gray-700 rounded" />
                        </div>
                      ))}
                    </div>
                  )}
                  {!postsLoading && displayPosts.length === 0 && (
                    <div className="card text-center py-10">
                      <span className="text-3xl block mb-2">📝</span>
                      <p className="text-sm font-semibold text-[#1a1a2e] dark:text-gray-100">No posts yet</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Be the first to share something with your network.</p>
                    </div>
                  )}
                  {displayPosts.map(post => (
                    <PostCard key={post._id} post={post} />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Right Panel */}
          <div className="w-64 shrink-0">
            <div className="card">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-[#1a1a2e] dark:text-gray-100 text-sm">People You May Know</h3>
                <span className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500 font-semibold">{people.length}</span>
              </div>
              {people.length === 0 ? (
                <p className="text-xs text-gray-400 dark:text-gray-500 text-center py-4">No suggestions yet — sign in to discover your network.</p>
              ) : (
                <>
                  <div className="divide-y divide-gray-100 dark:divide-gray-700">
                    {people.map(user => (
                      <UserCard
                        key={user._id}
                        user={user}
                        compact={true}
                        currentUserId={currentUser?._id}
                      />
                    ))}
                  </div>
                  <Link href="/network" className="text-[#2BC0B4] text-sm font-medium mt-3 hover:underline block w-full text-center">
                    Show more →
                  </Link>
                </>
              )}
            </div>

            <div className="card mt-4">
              <h3 className="font-semibold text-[#1a1a2e] dark:text-gray-100 text-sm mb-3">Upcoming Events</h3>
              {upcomingEvents.length === 0 ? (
                <p className="text-xs text-gray-400 dark:text-gray-500 text-center py-3">No upcoming events.</p>
              ) : (
                <div className="space-y-3">
                  {upcomingEvents.map((event, i) => {
                    const colors = ['#FF8C42', '#2BC0B4', '#6C63FF'];
                    const d = new Date(event.date);
                    const day = d.getDate();
                    const month = d.toLocaleString('en-US', { month: 'short' });
                    return (
                      <Link key={event._id || i} href={`/events/${event._id || ''}`} className="flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700/40 -mx-2 px-2 py-1.5 rounded-lg transition-colors">
                        <div className="w-10 h-10 rounded-lg flex flex-col items-center justify-center text-white text-[10px] font-bold flex-shrink-0 leading-tight"
                          style={{ backgroundColor: colors[i % colors.length] }}>
                          <span className="text-sm">{day}</span>
                          <span className="text-[8px] opacity-90">{month}</span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-[#1a1a2e] dark:text-gray-100 truncate">{event.title}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{event.location || 'Online'}</p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f8fafb] dark:bg-gray-950" />}>
      <HomePageInner />
    </Suspense>
  );
}
