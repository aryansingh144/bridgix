'use client';
import { useEffect, useState, Suspense } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'next/navigation';
import Navbar from '../../components/Navbar';
import RoleSwitcher from '../../components/RoleSwitcher';
import Sidebar from '../../components/Sidebar';
import PostCard from '../../components/PostCard';
import UserCard from '../../components/UserCard';
import { setPosts, addPost } from '../../store/slices/appSlice';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const mockConnections = [
  { _id: 'u1', name: 'Mohit Singh', avatar: 'https://ui-avatars.com/api/?name=Mohit+Singh&background=FF8C42&color=fff', occupation: 'Sr. Engineer at Google', role: 'alumni', topSkills: ['System Design', 'Go'] },
  { _id: 'u2', name: 'Shivansh Sharma', avatar: 'https://ui-avatars.com/api/?name=Shivansh+Sharma&background=6C63FF&color=fff', occupation: 'Data Scientist at Razorpay', role: 'alumni', topSkills: ['ML', 'Python'] },
  { _id: 'u3', name: 'Dhruv Baliyan', avatar: 'https://ui-avatars.com/api/?name=Dhruv+Baliyan&background=2BC0B4&color=fff', education: 'B.Tech IT, NSIT', role: 'student', topSkills: ['Java', 'Spring Boot'] },
  { _id: 'u4', name: 'Suprapti Srivastava', avatar: 'https://ui-avatars.com/api/?name=Suprapti+Srivastava&background=E91E63&color=fff', education: 'B.Tech ECE, IIT Kanpur', role: 'student', topSkills: ['IoT', 'C++'] },
  { _id: 'u5', name: 'Paresh Talwa', avatar: 'https://ui-avatars.com/api/?name=Paresh+Talwa&background=4CAF50&color=fff', occupation: 'PM at Flipkart', role: 'alumni', topSkills: ['Product Mgmt'] },
];

const mockPosts = [
  {
    _id: 'post1',
    author: { _id: 'u1', name: 'Mohit Singh', avatar: 'https://ui-avatars.com/api/?name=Mohit+Singh&background=FF8C42&color=fff', role: 'alumni', occupation: 'Sr. Engineer at Google' },
    content: "Excited to share that I've just completed my 5th year at Google! 🎉 The journey has been incredible — from a fresh IIT grad to leading a distributed systems team. To all students: keep learning, stay curious, and don't be afraid to fail. The best is yet to come! #GoogleLife #TechJourney #AlumniStory",
    image: 'https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?w=600',
    likes: ['u3', 'u4'], comments: [],
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString()
  },
  {
    _id: 'post2',
    author: { _id: 'mock-student-1', name: 'Aryan Singh', avatar: 'https://ui-avatars.com/api/?name=Aryan+Singh&background=2BC0B4&color=fff', role: 'student', education: '3rd Year B.Tech CS' },
    content: "Just finished building my first full-stack project using React and Node.js! It's a task management app with real-time features using Socket.io. Would love some feedback from alumni who've worked on similar projects. Check it out on my GitHub! #WebDev #React #NodeJS #StudentProject",
    image: '', likes: ['u1', 'u2'],
    comments: [{ author: { name: 'Mohit Singh', avatar: 'https://ui-avatars.com/api/?name=Mohit+Singh&background=FF8C42&color=fff' }, text: 'Great work! Keep it up.' }],
    createdAt: new Date(Date.now() - 5 * 3600000).toISOString()
  },
  {
    _id: 'post3',
    author: { _id: 'u2', name: 'Shivansh Sharma', avatar: 'https://ui-avatars.com/api/?name=Shivansh+Sharma&background=6C63FF&color=fff', role: 'alumni', occupation: 'Data Scientist at Razorpay' },
    content: "Resources for aspiring Data Scientists 📊\n\n1. Start with Python basics — don't skip this\n2. Learn statistics properly — it's the foundation\n3. Practice on Kaggle competitions\n4. Read research papers — ArXiv is your friend\n5. Build real projects with real data\n\nThe roadmap seems long but each step is worth it. Feel free to reach out! #DataScience #MachineLearning #CareerTips",
    image: '', likes: ['mock-student-1', 'u3', 'u4'], comments: [],
    createdAt: new Date(Date.now() - 8 * 3600000).toISOString()
  },
  {
    _id: 'post4',
    author: { _id: 'u4', name: 'Suprapti Srivastava', avatar: 'https://ui-avatars.com/api/?name=Suprapti+Srivastava&background=E91E63&color=fff', role: 'student', education: '4th Year ECE, IIT Kanpur' },
    content: "Our IoT project won 2nd place at the National Hackathon! We built a smart irrigation system that reduces water usage by 40% using ML-based weather prediction. So proud of my team! #IoT #Hackathon #SmartAgriculture",
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600',
    likes: ['u1', 'u5', 'mock-student-1'], comments: [],
    createdAt: new Date(Date.now() - 12 * 3600000).toISOString()
  },
  {
    _id: 'post5',
    author: { _id: 'u5', name: 'Paresh Talwa', avatar: 'https://ui-avatars.com/api/?name=Paresh+Talwa&background=4CAF50&color=fff', role: 'alumni', occupation: 'PM at Flipkart' },
    content: "How I transitioned from Software Engineer to Product Manager 🚀\n\n• Engineering background is a HUGE advantage in PM\n• Learn to empathize with users, not just systems\n• Practice product sense through case studies daily\n• Network with PMs and shadow their work\n\nDM me if you want to chat about your PM journey! #ProductManagement #CareerChange",
    image: '', likes: ['mock-student-1', 'u3'], comments: [],
    createdAt: new Date(Date.now() - 20 * 3600000).toISOString()
  }
];

const placementAlumni = [
  { _id: 'u1', name: 'Mohit Singh', avatar: 'https://ui-avatars.com/api/?name=Mohit+Singh&background=FF8C42&color=fff', occupation: 'Sr. Engineer at Google', role: 'alumni', topSkills: ['System Design', 'Interviews'], services: ['Mock Interviews', 'Resume Review', 'FAANG Prep'] },
  { _id: 'u5', name: 'Paresh Talwa', avatar: 'https://ui-avatars.com/api/?name=Paresh+Talwa&background=4CAF50&color=fff', occupation: 'PM at Flipkart', role: 'alumni', topSkills: ['Product Mgmt', 'Case Studies'], services: ['PM Interviews', 'Career Switch Advice'] },
  { _id: 'u9', name: 'Ritwik Jadeja', avatar: 'https://ui-avatars.com/api/?name=Ritwik+Jadeja&background=FF5722&color=fff', occupation: 'Co-Founder at TechBridge', role: 'alumni', topSkills: ['Startups', 'Hiring'], services: ['Startup Hiring', 'Portfolio Review'] },
];

const webinars = [
  { id: 'w1', title: 'Cracking FAANG in 2026', host: 'Mohit Singh', date: 'Mar 20, 2026', time: '6:00 PM IST', attendees: 234, tags: ['FAANG', 'DSA', 'SDE'], color: '#FF8C42' },
  { id: 'w2', title: 'Breaking into Data Science', host: 'Shivansh Sharma', date: 'Mar 25, 2026', time: '7:00 PM IST', attendees: 189, tags: ['ML', 'Python', 'Career'], color: '#6C63FF' },
  { id: 'w3', title: 'From Student to PM', host: 'Paresh Talwa', date: 'Apr 2, 2026', time: '5:30 PM IST', attendees: 145, tags: ['Product', 'Career Switch'], color: '#4CAF50' },
  { id: 'w4', title: 'Open Source — Your Path to Top Companies', host: 'Ritwik Jadeja', date: 'Apr 10, 2026', time: '6:30 PM IST', attendees: 112, tags: ['Open Source', 'GitHub'], color: '#2BC0B4' },
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

function WebinarTab() {
  const [registered, setRegistered] = useState({});
  return (
    <div className="space-y-4">
      <div className="card bg-gradient-to-r from-[#6C63FF]/10 to-[#6C63FF]/5 dark:from-[#6C63FF]/10 dark:to-transparent border-[#6C63FF]/20">
        <h2 className="font-bold text-[#1a1a2e] dark:text-gray-100 mb-1">🎥 Upcoming Webinars</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Join live sessions hosted by alumni on topics ranging from technical interviews to career transitions.</p>
      </div>
      {webinars.map(w => (
        <div key={w.id} className="card">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-white font-bold text-lg" style={{ backgroundColor: w.color }}>
              🎙️
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-[#1a1a2e] dark:text-gray-100 text-sm mb-0.5">{w.title}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Hosted by <span className="font-medium text-[#2BC0B4]">{w.host}</span></p>
              <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mb-2">
                <span>📅 {w.date}</span>
                <span>⏰ {w.time}</span>
                <span>👥 {w.attendees} attending</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex gap-1.5">
                  {w.tags.map(t => (
                    <span key={t} className="text-xs bg-[#e8faf9] dark:bg-teal-900/30 text-[#2BC0B4] px-2 py-0.5 rounded-full">{t}</span>
                  ))}
                </div>
                <button
                  onClick={() => setRegistered(r => ({ ...r, [w.id]: !r[w.id] }))}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
                    registered[w.id]
                      ? 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                      : 'btn-primary py-1.5 px-3'
                  }`}
                >
                  {registered[w.id] ? '✓ Registered' : 'Register'}
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
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
  const [displayPosts, setDisplayPosts] = useState(mockPosts);
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/posts`);
        if (res.data && res.data.length > 0) {
          setDisplayPosts(res.data);
          dispatch(setPosts(res.data));
        }
      } catch (e) {
        setDisplayPosts(mockPosts);
      }
    };
    fetchPosts();
  }, []);

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
            {activeTab === 'webinar' && <WebinarTab />}

            {/* Default feed */}
            {activeTab === 'feed' && (
              <>
                {/* Post Box */}
                <div className="card mb-4">
                  <div className="flex gap-3 mb-3">
                    <img
                      src={currentUser?.avatar}
                      alt={currentUser?.name}
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
              <h3 className="font-semibold text-[#1a1a2e] dark:text-gray-100 text-sm mb-3">People You May Know</h3>
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {mockConnections.map(user => (
                  <UserCard key={user._id} user={user} compact={true} />
                ))}
              </div>
              <button className="text-[#2BC0B4] text-sm font-medium mt-3 hover:underline block w-full text-center">
                Show more →
              </button>
            </div>

            <div className="card mt-4">
              <h3 className="font-semibold text-[#1a1a2e] dark:text-gray-100 text-sm mb-3">Upcoming Events</h3>
              <div className="space-y-3">
                {[
                  { title: 'Alumni Meetup', date: 'Mar 28', color: '#FF8C42' },
                  { title: 'AI Seminar', date: 'Apr 5', color: '#2BC0B4' },
                  { title: 'CS Conference', date: 'Apr 15', color: '#6C63FF' }
                ].map(event => (
                  <div key={event.title} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                      style={{ backgroundColor: event.color }}>
                      {event.date.split(' ')[1]}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-[#1a1a2e] dark:text-gray-100">{event.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{event.date}</p>
                    </div>
                  </div>
                ))}
              </div>
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
