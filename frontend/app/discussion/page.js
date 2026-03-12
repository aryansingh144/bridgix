'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useSearchParams } from 'next/navigation';
import Navbar from '../../components/Navbar';
import RoleSwitcher from '../../components/RoleSwitcher';
import { setDiscussions, addDiscussion } from '../../store/slices/appSlice';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const mockDiscussions = [
  {
    _id: 'd1',
    title: 'Best resources for cracking FAANG interviews in 2026?',
    author: { name: 'Aryan Singh', avatar: 'https://ui-avatars.com/api/?name=Aryan+Singh&background=2BC0B4&color=fff', role: 'student' },
    category: 'Placement Assistance',
    content: "I'm a 3rd year CSE student targeting FAANG companies for my placement next year...",
    replies: [{ author: 'Mohit Singh' }, { author: 'Shivansh Sharma' }, { author: 'Dhruv Baliyan' }],
    views: 245, tags: ['FAANG', 'interviews', 'placement'],
    createdAt: new Date(Date.now() - 3 * 3600000).toISOString()
  },
  {
    _id: 'd2',
    title: 'How to approach open source contributions as a student?',
    author: { name: 'Dhruv Baliyan', avatar: 'https://ui-avatars.com/api/?name=Dhruv+Baliyan&background=2BC0B4&color=fff', role: 'student' },
    category: 'Career Guidance',
    content: "I want to start contributing to open source projects but don't know where to begin...",
    replies: [{ author: 'Ritwik Jadeja' }, { author: 'Aryan Singh' }],
    views: 189, tags: ['open-source', 'github', 'career'],
    createdAt: new Date(Date.now() - 6 * 3600000).toISOString()
  },
  {
    _id: 'd3',
    title: 'Machine Learning vs Deep Learning — which to focus on first?',
    author: { name: 'Rajat Kumar', avatar: 'https://ui-avatars.com/api/?name=Rajat+Kumar&background=9C27B0&color=fff', role: 'student' },
    category: 'Academic Support',
    content: "I'm planning to build a career in AI/ML. Should I focus on classical ML first...",
    replies: [{ author: 'Shivansh Sharma' }, { author: 'Mohit Singh' }, { author: 'Aryan Singh' }],
    views: 312, tags: ['machine-learning', 'deep-learning', 'AI'],
    createdAt: new Date(Date.now() - 10 * 3600000).toISOString()
  },
  {
    _id: 'd4',
    title: 'Internship experience at startups vs big companies — pros and cons?',
    author: { name: 'Suprapti Srivastava', avatar: 'https://ui-avatars.com/api/?name=Suprapti+Srivastava&background=E91E63&color=fff', role: 'student' },
    category: 'Placement Assistance',
    content: "I have offers from a Series B startup (2x stipend) and an MNC. Which would be better long-term?",
    replies: [{ author: 'Paresh Talwa' }, { author: 'Ritwik Jadeja' }, { author: 'Mohit Singh' }],
    views: 178, tags: ['internship', 'startup', 'MNC'],
    createdAt: new Date(Date.now() - 14 * 3600000).toISOString()
  },
  {
    _id: 'd5',
    title: 'Tips for building a standout LinkedIn profile as a student?',
    author: { name: 'Aryan Singh', avatar: 'https://ui-avatars.com/api/?name=Aryan+Singh&background=2BC0B4&color=fff', role: 'student' },
    category: 'Career Guidance',
    content: "Recruiters often check LinkedIn before even looking at resumes. What are the key elements...",
    replies: [{ author: 'Paresh Talwa' }, { author: 'Mohit Singh' }],
    views: 203, tags: ['linkedin', 'networking', 'career'],
    createdAt: new Date(Date.now() - 22 * 3600000).toISOString()
  },
  {
    _id: 'd6',
    title: 'Understanding System Design — where to start as a junior?',
    author: { name: 'Dhruv Baliyan', avatar: 'https://ui-avatars.com/api/?name=Dhruv+Baliyan&background=2BC0B4&color=fff', role: 'student' },
    category: 'Academic Support',
    content: "System design interviews seem overwhelming. I'm in 2nd year and see juniors failing these rounds...",
    replies: [{ author: 'Mohit Singh' }, { author: 'Shivansh Sharma' }, { author: 'Ritwik Jadeja' }],
    views: 267, tags: ['system-design', 'architecture', 'DSA'],
    createdAt: new Date(Date.now() - 28 * 3600000).toISOString()
  },
  {
    _id: 'd7',
    title: 'Best side hustles for CS students to build experience?',
    author: { name: 'Rajat Kumar', avatar: 'https://ui-avatars.com/api/?name=Rajat+Kumar&background=9C27B0&color=fff', role: 'student' },
    category: 'Miscellaneous',
    content: "Looking for ways to gain experience outside college projects and internships...",
    replies: [{ author: 'Ritwik Jadeja' }],
    views: 134, tags: ['freelance', 'side-projects', 'experience'],
    createdAt: new Date(Date.now() - 36 * 3600000).toISOString()
  },
  {
    _id: 'd8',
    title: '[Panel] Alumni AMA — Career transitions and lessons learned',
    author: { name: 'Mohit Singh', avatar: 'https://ui-avatars.com/api/?name=Mohit+Singh&background=FF8C42&color=fff', role: 'alumni' },
    category: 'Career Guidance',
    type: 'panel',
    content: "Join us for an open AMA with 4 alumni from Google, Razorpay, Flipkart, and TechBridge...",
    replies: [{ author: 'Aryan Singh' }, { author: 'Dhruv Baliyan' }, { author: 'Suprapti Srivastava' }],
    views: 421, tags: ['AMA', 'panel', 'career'],
    createdAt: new Date(Date.now() - 1 * 3600000).toISOString()
  },
  {
    _id: 'd9',
    title: '[Panel] Engineering Leadership — what does it take?',
    author: { name: 'Shivansh Sharma', avatar: 'https://ui-avatars.com/api/?name=Shivansh+Sharma&background=6C63FF&color=fff', role: 'alumni' },
    category: 'Career Guidance',
    type: 'panel',
    content: "A panel discussion on growing from IC to engineering manager, and what skills matter...",
    replies: [{ author: 'Mohit Singh' }, { author: 'Aryan Singh' }],
    views: 298, tags: ['leadership', 'EM', 'panel'],
    createdAt: new Date(Date.now() - 5 * 3600000).toISOString()
  },
];

const categories = [
  { label: 'Discussion Page',      icon: '💬', filter: 'all' },
  { label: 'My Posts',             icon: '📝', filter: 'mine' },
  { label: 'Placement Assistance', icon: '💼', filter: 'category' },
  { label: 'Top Discussions',      icon: '🔥', filter: 'top' },
  { label: 'Academic Support',     icon: '📚', filter: 'category' },
  { label: 'Career Guidance',      icon: '🚀', filter: 'category' },
  { label: 'Miscellaneous',        icon: '📎', filter: 'category' },
  { label: 'All Categories',       icon: '🗂️', filter: 'all' },
  { label: 'Custom',               icon: '⚙️', filter: 'all' },
];

const popularTags = ['#bridgix', '#DSA', '#javascript', '#python', '#placement', '#internship', '#ml', '#webdev'];

const leaderboardPreview = [
  { name: 'Aryan Singh',  points: 105, avatar: 'https://ui-avatars.com/api/?name=Aryan+Singh&background=2BC0B4&color=fff' },
  { name: 'Adarsh',       points: 86,  avatar: 'https://ui-avatars.com/api/?name=Adarsh&background=E91E63&color=fff' },
  { name: 'Mohit Singh',  points: 72,  avatar: 'https://ui-avatars.com/api/?name=Mohit+Singh&background=FF8C42&color=fff' },
];

function DiscussionPageInner() {
  const dispatch = useDispatch();
  const { currentUser } = useSelector(state => state.user);
  const searchParams = useSearchParams();
  const urlType = searchParams.get('type'); // 'panel' from shortcut

  const [displayDiscussions, setDisplayDiscussions] = useState(mockDiscussions);
  const [activeTab, setActiveTab] = useState('Latest');
  const [activeCategory, setActiveCategory] = useState(urlType === 'panel' ? 'Discussion Page' : 'Discussion Page');
  const [isPanelView, setIsPanelView] = useState(urlType === 'panel');
  const [newPost, setNewPost] = useState('');
  const [showNewTopic, setShowNewTopic] = useState(false);
  const [newTopic, setNewTopic] = useState({ title: '', content: '', category: 'General', tags: '' });
  const [activeTag, setActiveTag] = useState(null);

  // Sync panel view when URL type changes
  useEffect(() => {
    setIsPanelView(urlType === 'panel');
  }, [urlType]);

  useEffect(() => {
    const fetchDiscussions = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/discussions`);
        if (res.data && res.data.length > 0) {
          setDisplayDiscussions(res.data);
          dispatch(setDiscussions(res.data));
        }
      } catch (e) {
        setDisplayDiscussions(mockDiscussions);
      }
    };
    fetchDiscussions();
  }, []);

  const handleCreateTopic = (e) => {
    e.preventDefault();
    if (!newTopic.title.trim()) return;
    const topic = {
      _id: 'temp-' + Date.now(),
      title: newTopic.title,
      author: currentUser,
      category: newTopic.category,
      content: newTopic.content,
      replies: [],
      views: 0,
      tags: newTopic.tags.split(',').map(t => t.trim()),
      createdAt: new Date().toISOString()
    };
    setDisplayDiscussions(prev => [topic, ...prev]);
    dispatch(addDiscussion(topic));
    setNewTopic({ title: '', content: '', category: 'General', tags: '' });
    setShowNewTopic(false);
  };

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  // Build filtered + sorted list
  const filteredDiscussions = displayDiscussions.filter(disc => {
    // Panel view (from shortcut): show only panel-type
    if (isPanelView) return disc.type === 'panel';

    // Tag filter
    if (activeTag) return disc.tags?.includes(activeTag.replace('#', ''));

    // Category filters
    if (activeCategory === 'My Posts') return disc.author?.name === currentUser?.name;
    if (['Placement Assistance', 'Academic Support', 'Career Guidance', 'Miscellaneous'].includes(activeCategory)) {
      return disc.category === activeCategory;
    }
    return true; // Discussion Page, All Categories, Top Discussions, Custom
  });

  const sortedDiscussions = [...filteredDiscussions].sort((a, b) => {
    if (activeTab === 'Top' || activeCategory === 'Top Discussions') return (b.views || 0) - (a.views || 0);
    if (activeTab === 'Unread') return new Date(b.createdAt) - new Date(a.createdAt);
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  const pageTitle = isPanelView
    ? 'Panel Discussions'
    : activeTag
    ? `Tag: ${activeTag}`
    : activeCategory;

  return (
    <div className="min-h-screen bg-[#f8fafb] dark:bg-gray-950">
      <RoleSwitcher />
      <Navbar type="app" />

      <div className="max-w-7xl mx-auto px-4 py-5">
        <div className="flex gap-4">
          {/* Left Sidebar */}
          <div className="w-52 shrink-0">
            <div className="card">
              <nav className="space-y-1">
                {categories.map(cat => (
                  <button
                    key={cat.label}
                    onClick={() => { setActiveCategory(cat.label); setIsPanelView(false); setActiveTag(null); }}
                    className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                      !isPanelView && !activeTag && activeCategory === cat.label
                        ? 'bg-[#e8faf9] dark:bg-teal-900/30 text-[#2BC0B4] font-semibold'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/40'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span className="truncate">{cat.label}</span>
                  </button>
                ))}
              </nav>

              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Popular Tags</p>
                <div className="flex flex-wrap gap-1.5">
                  {popularTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => { setActiveTag(activeTag === tag ? null : tag); setIsPanelView(false); }}
                      className={`text-xs px-2 py-1 rounded-full transition-colors ${
                        activeTag === tag
                          ? 'bg-[#2BC0B4] text-white'
                          : 'text-[#2BC0B4] bg-[#e8faf9] dark:bg-teal-900/30 hover:bg-[#2BC0B4] hover:text-white'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-[#1a1a2e] dark:text-gray-100">{pageTitle}</h1>
                {isPanelView && (
                  <span className="text-xs px-2 py-1 bg-[#6C63FF]/10 text-[#6C63FF] rounded-full font-medium">Panel</span>
                )}
                {activeTag && (
                  <button onClick={() => setActiveTag(null)} className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-full hover:bg-red-50 hover:text-red-400 transition-colors">
                    ✕ clear
                  </button>
                )}
              </div>
              <button onClick={() => setShowNewTopic(true)} className="btn-primary text-sm">
                + New Topic
              </button>
            </div>

            {/* New Topic Modal */}
            {showNewTopic && (
              <div className="card mb-4 border-2 border-[#2BC0B4]/30">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-[#1a1a2e] dark:text-gray-100">Create New Topic</h3>
                  <button onClick={() => setShowNewTopic(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">✕</button>
                </div>
                <form onSubmit={handleCreateTopic} className="space-y-3">
                  <input type="text" placeholder="Topic title" value={newTopic.title}
                    onChange={e => setNewTopic({...newTopic, title: e.target.value})}
                    className="input-field" required />
                  <select value={newTopic.category}
                    onChange={e => setNewTopic({...newTopic, category: e.target.value})}
                    className="input-field">
                    <option>General</option>
                    <option>Placement Assistance</option>
                    <option>Academic Support</option>
                    <option>Career Guidance</option>
                    <option>Miscellaneous</option>
                  </select>
                  <textarea placeholder="What do you want to talk about?" value={newTopic.content}
                    onChange={e => setNewTopic({...newTopic, content: e.target.value})}
                    className="input-field resize-none" rows={3} />
                  <input type="text" placeholder="Tags (comma separated)" value={newTopic.tags}
                    onChange={e => setNewTopic({...newTopic, tags: e.target.value})}
                    className="input-field" />
                  <div className="flex gap-2 justify-end">
                    <button type="button" onClick={() => setShowNewTopic(false)} className="btn-outline text-sm">Cancel</button>
                    <button type="submit" className="btn-primary text-sm">Post Topic</button>
                  </div>
                </form>
              </div>
            )}

            {/* Tabs */}
            <div className="flex items-center gap-1 mb-4 bg-white dark:bg-gray-800 rounded-lg p-1 border border-gray-100 dark:border-gray-700 w-fit">
              {['Latest', 'Unread', 'Top'].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    activeTab === tab
                      ? 'bg-[#2BC0B4] text-white'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                  }`}>{tab}</button>
              ))}
            </div>

            {/* Topics Table */}
            <div className="card p-0 overflow-hidden">
              <div className="grid grid-cols-12 gap-2 px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <div className="col-span-6">Topic</div>
                <div className="col-span-2 text-center">Replies</div>
                <div className="col-span-2 text-center">Views</div>
                <div className="col-span-2 text-right">Activity</div>
              </div>

              {sortedDiscussions.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-2xl mb-2">💬</p>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">No discussions here yet</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Be the first to start one!</p>
                  <button onClick={() => setShowNewTopic(true)} className="btn-primary text-sm mt-4">+ Start a Discussion</button>
                </div>
              ) : (
                sortedDiscussions.map(disc => (
                  <div key={disc._id} className="grid grid-cols-12 gap-2 px-4 py-4 border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 cursor-pointer transition-colors">
                    <div className="col-span-6 flex items-start gap-3">
                      <img src={disc.author?.avatar || `https://ui-avatars.com/api/?name=${disc.author?.name}&background=2BC0B4&color=fff`}
                        alt={disc.author?.name} className="w-9 h-9 rounded-full flex-shrink-0" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          {disc.type === 'panel' && (
                            <span className="text-xs px-1.5 py-0.5 bg-[#6C63FF]/10 text-[#6C63FF] rounded font-medium flex-shrink-0">Panel</span>
                          )}
                          <h4 className="text-sm font-semibold text-[#1a1a2e] dark:text-gray-100 hover:text-[#2BC0B4] line-clamp-1">{disc.title}</h4>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">{disc.content}</p>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          <span className="text-xs text-gray-400 dark:text-gray-500">{disc.author?.name}</span>
                          <span className="text-xs bg-[#e8faf9] dark:bg-teal-900/30 text-[#2BC0B4] px-2 py-0.5 rounded-full font-medium">{disc.category}</span>
                          {disc.tags?.slice(0, 2).map(tag => (
                            <span key={tag} className="text-xs text-[#FF8C42] cursor-pointer hover:underline"
                              onClick={(e) => { e.stopPropagation(); setActiveTag('#' + tag); setIsPanelView(false); }}>
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="col-span-2 flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{disc.replies?.length || 0}</span>
                    </div>
                    <div className="col-span-2 flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{disc.views || 0}</span>
                    </div>
                    <div className="col-span-2 flex items-center justify-end">
                      <span className="text-xs text-gray-400 dark:text-gray-500">{timeAgo(disc.createdAt)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right Panel */}
          <div className="w-60 shrink-0 space-y-4">
            {/* Post Box */}
            <div className="card">
              <h3 className="font-semibold text-[#1a1a2e] dark:text-gray-100 text-sm mb-3">Share Your Thoughts</h3>
              <form onSubmit={(e) => { e.preventDefault(); if (newPost.trim()) { setShowNewTopic(true); setNewTopic({...newTopic, content: newPost}); setNewPost(''); } }}>
                <textarea value={newPost} onChange={e => setNewPost(e.target.value)}
                  placeholder="What do you want to talk about?"
                  className="input-field resize-none text-sm mb-2" rows={3} />
                <button type="submit" className="btn-primary w-full text-sm py-2">Post</button>
              </form>
            </div>

            {/* Leaderboard Preview */}
            <div className="card">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-[#1a1a2e] dark:text-gray-100 text-sm">Top Contributors</h3>
                <a href="/leaderboard" className="text-xs text-[#2BC0B4] hover:underline">See all</a>
              </div>
              <div className="space-y-3">
                {leaderboardPreview.map((user, i) => (
                  <div key={user.name} className="flex items-center gap-2">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                      i === 0 ? 'bg-yellow-400 text-white' : i === 1 ? 'bg-gray-400 text-white' : 'bg-orange-400 text-white'
                    }`}>{i + 1}</span>
                    <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-[#1a1a2e] dark:text-gray-100 truncate">{user.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{user.points} pts</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Ask Button */}
      <button onClick={() => setShowNewTopic(true)}
        className="fixed bottom-6 right-6 btn-primary rounded-full w-14 h-14 flex items-center justify-center text-2xl shadow-lg hover:shadow-xl"
        title="Ask a Question">?</button>
    </div>
  );
}

export default function DiscussionPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f8fafb] dark:bg-gray-950" />}>
      <DiscussionPageInner />
    </Suspense>
  );
}
