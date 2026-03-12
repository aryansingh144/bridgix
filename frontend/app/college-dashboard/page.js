'use client';
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import Navbar from '../../components/Navbar';
import RoleSwitcher from '../../components/RoleSwitcher';
import dynamic from 'next/dynamic';

const ActivityChart = dynamic(() => import('../../components/ActivityChart'), { ssr: false });

const sidebarLinks = [
  { label: 'University', icon: '🏛️', active: true },
  { label: 'Webinars', icon: '🎥' },
  { label: 'Alumni Meet Up', icon: '🤝' },
  { label: 'Career Guidance Session', icon: '🚀' },
  { label: 'Interactions', icon: '💬' },
  { label: 'Leaderboard', icon: '🏆' },
];

const events = [
  {
    id: 1,
    title: 'Annual Alumni Meetup 2026',
    date: 'March 28, 2026',
    attendees: 120,
    status: 'Upcoming',
    image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=600',
    category: 'Alumni Meet'
  },
  {
    id: 2,
    title: 'Tech Seminar: Future of AI in India',
    date: 'April 5, 2026',
    attendees: 340,
    status: 'Upcoming',
    image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600',
    category: 'Seminar'
  },
  {
    id: 3,
    title: 'International Conference on CS & IT',
    date: 'April 15, 2026',
    attendees: 500,
    status: 'Open',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600',
    category: 'Conference'
  }
];

const stats = [
  { label: 'Total Students', value: '2,456', change: '+12%', icon: '🎓', color: '#2BC0B4' },
  { label: 'Active Alumni', value: '1,234', change: '+8%', icon: '👔', color: '#FF8C42' },
  { label: 'Connections Made', value: '8,901', change: '+23%', icon: '🤝', color: '#6C63FF' },
  { label: 'Placements 2025-26', value: '891', change: '+15%', icon: '💼', color: '#4CAF50' },
];

const topStudents = [
  { name: 'Aryan Singh', points: 55, year: '3rd Year', avatar: 'https://ui-avatars.com/api/?name=Aryan+Singh&background=2BC0B4&color=fff' },
  { name: 'Dhruv Baliyan', points: 72, year: '2nd Year', avatar: 'https://ui-avatars.com/api/?name=Dhruv+Baliyan&background=2BC0B4&color=fff' },
  { name: 'Rajat Kumar', points: 44, year: '3rd Year', avatar: 'https://ui-avatars.com/api/?name=Rajat+Kumar&background=9C27B0&color=fff' },
];

const topAlumni = [
  { name: 'Mohit Singh', points: 105, company: 'Google', avatar: 'https://ui-avatars.com/api/?name=Mohit+Singh&background=FF8C42&color=fff' },
  { name: 'Shivansh Sharma', points: 61, company: 'Razorpay', avatar: 'https://ui-avatars.com/api/?name=Shivansh+Sharma&background=6C63FF&color=fff' },
];

export default function CollegeDashboardPage() {
  const { currentUser } = useSelector(state => state.user);
  const [activeLink, setActiveLink] = useState('University');
  const [activeEventIdx, setActiveEventIdx] = useState(0);
  const [showEdit, setShowEdit] = useState(false);

  return (
    <div className="min-h-screen bg-[#f8fafb]">
      <RoleSwitcher />
      <Navbar type="app" />

      <div className="max-w-7xl mx-auto px-4 py-5">
        <div className="flex gap-5">
          {/* Left Sidebar */}
          <div className="w-56 shrink-0">
            <div className="card mb-3">
              <div className="flex flex-col items-center text-center pb-3 border-b border-gray-100 mb-3">
                <div className="w-14 h-14 bg-gradient-to-br from-[#2BC0B4] to-[#1a9e93] rounded-xl flex items-center justify-center mb-2">
                  <span className="text-2xl">🏛️</span>
                </div>
                <h3 className="font-bold text-[#1a1a2e] text-sm">IIT Delhi</h3>
                <p className="text-xs text-gray-500">Admin Dashboard</p>
              </div>
              <nav className="space-y-1">
                {sidebarLinks.map(link => (
                  <button
                    key={link.label}
                    onClick={() => setActiveLink(link.label)}
                    className={`w-full text-left flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-all ${
                      activeLink === link.label
                        ? 'bg-[#e8faf9] text-[#2BC0B4] font-semibold'
                        : 'text-gray-600 hover:bg-gray-50'
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
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Quick Actions</h4>
              <div className="space-y-1">
                {['Post Announcement', 'Create Event', 'Add Student', 'Generate Report'].map(action => (
                  <button key={action} className="w-full text-left text-xs text-gray-600 hover:text-[#2BC0B4] py-2 px-3 rounded-lg hover:bg-[#e8faf9] transition-all">
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
                <h1 className="text-xl font-bold text-[#1a1a2e]">University Dashboard</h1>
                <p className="text-sm text-gray-500">Welcome back, IIT Delhi Admin</p>
              </div>
              <button
                onClick={() => setShowEdit(!showEdit)}
                className="btn-primary text-sm"
              >
                ✏️ Update Details
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {stats.map(stat => (
                <div key={stat.label} className="card hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-2">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: stat.color + '20' }}>
                      <span className="text-xl">{stat.icon}</span>
                    </div>
                    <span className="text-xs text-green-600 font-semibold bg-green-50 px-2 py-0.5 rounded-full">{stat.change}</span>
                  </div>
                  <p className="text-2xl font-bold text-[#1a1a2e]">{stat.value}</p>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Event Carousel */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-[#1a1a2e]">Alumni Meetup & Events</h2>
                <button className="text-[#2BC0B4] text-sm hover:underline">+ Create Event</button>
              </div>
              <div className="relative overflow-hidden rounded-xl">
                <div className="flex transition-transform duration-500" style={{ transform: `translateX(-${activeEventIdx * 100}%)` }}>
                  {events.map(event => (
                    <div key={event.id} className="w-full flex-shrink-0 relative">
                      <img src={event.image} alt={event.title} className="w-full h-48 object-cover rounded-xl" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-xl"></div>
                      <div className="absolute bottom-3 left-3 right-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="inline-block bg-[#FF8C42] text-white text-xs font-semibold px-2 py-0.5 rounded-full mb-1">{event.category}</span>
                            <h3 className="text-white font-bold text-sm">{event.title}</h3>
                            <p className="text-white/80 text-xs">📅 {event.date} • 👥 {event.attendees} attending</p>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full font-semibold ${event.status === 'Open' ? 'bg-green-400 text-white' : 'bg-[#2BC0B4] text-white'}`}>{event.status}</span>
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
            </div>

            {/* Activity Chart */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-bold text-[#1a1a2e]">Users Activity</h2>
                  <p className="text-xs text-gray-500">Last 12 months activity overview</p>
                </div>
                <select className="input-field w-32 text-xs py-2">
                  <option>Last 12 months</option>
                  <option>Last 6 months</option>
                  <option>This year</option>
                </select>
              </div>
              <ActivityChart />
            </div>

            {/* Students and Alumni */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="card">
                <h3 className="font-semibold text-[#1a1a2e] mb-3">Top Students</h3>
                <div className="space-y-3">
                  {topStudents.map((s, i) => (
                    <div key={s.name} className="flex items-center gap-3">
                      <span className="w-5 h-5 bg-[#2BC0B4]/20 rounded-full flex items-center justify-center text-xs font-bold text-[#2BC0B4] flex-shrink-0">{i + 1}</span>
                      <img src={s.avatar} alt={s.name} className="w-9 h-9 rounded-full flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[#1a1a2e] truncate">{s.name}</p>
                        <p className="text-xs text-gray-500">{s.year}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-bold text-[#2BC0B4]">{s.points} pts</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card">
                <h3 className="font-semibold text-[#1a1a2e] mb-3">Active Alumni</h3>
                <div className="space-y-3">
                  {topAlumni.map((a, i) => (
                    <div key={a.name} className="flex items-center gap-3">
                      <span className="w-5 h-5 bg-[#FF8C42]/20 rounded-full flex items-center justify-center text-xs font-bold text-[#FF8C42] flex-shrink-0">{i + 1}</span>
                      <img src={a.avatar} alt={a.name} className="w-9 h-9 rounded-full flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[#1a1a2e] truncate">{a.name}</p>
                        <p className="text-xs text-gray-500">{a.company}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-bold text-[#FF8C42]">{a.points} pts</p>
                      </div>
                    </div>
                  ))}
                  <button className="w-full text-center text-sm text-[#2BC0B4] hover:underline mt-2">View all alumni →</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Update Details Modal */}
      {showEdit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-[#1a1a2e]">Update College Details</h3>
              <button onClick={() => setShowEdit(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="space-y-3">
              <input type="text" placeholder="College Name" defaultValue="IIT Delhi" className="input-field" />
              <input type="email" placeholder="College Email" defaultValue="admin@iitd.ac.in" className="input-field" />
              <input type="text" placeholder="AICTE Code" defaultValue="AICTE-1-1234567890" className="input-field" />
              <input type="text" placeholder="Website" placeholder="www.iitd.ac.in" className="input-field" />
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
