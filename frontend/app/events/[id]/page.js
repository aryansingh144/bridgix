'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useSelector } from 'react-redux';
import Navbar from '../../../components/Navbar';
import RoleSwitcher from '../../../components/RoleSwitcher';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const mockEvent = {
  _id: '1',
  title: 'International Conference on Advanced Computer Science and Information Technology 8908',
  date: new Date('2026-04-15'),
  location: 'IIT Delhi Auditorium, New Delhi',
  description: 'A premier conference bringing together researchers, practitioners, and educators in computer science and information technology from around the globe. This event focuses on cutting-edge research in AI, ML, cloud computing, cybersecurity, and emerging technologies.',
  highlights: [
    'Keynote by Dr. Rahul Sharma (Google Research)',
    'Paper presentations in AI, ML, and Systems',
    'Panel discussion on Future of Tech in India',
    'Networking sessions with industry leaders',
    'Workshop on Quantum Computing Basics',
    'Startup Demo Showcase'
  ],
  speakers: ['Dr. Rahul Sharma (Google)', 'Prof. Anita Verma (IIT Delhi)', 'Mr. Karan Mehta (Microsoft)', 'Dr. Priya Nair (Amazon)'],
  entryFee: '₹500 (Students Free with valid ID)',
  turnout: '500+ Expected',
  attendees: [
    { name: 'Aryan Singh', avatar: 'https://ui-avatars.com/api/?name=Aryan+Singh&background=2BC0B4&color=fff' },
    { name: 'Dhruv Baliyan', avatar: 'https://ui-avatars.com/api/?name=Dhruv+Baliyan&background=2BC0B4&color=fff' },
    { name: 'Mohit Singh', avatar: 'https://ui-avatars.com/api/?name=Mohit+Singh&background=FF8C42&color=fff' },
  ],
  image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200',
  listedIn: ['Tech Events India', 'IEEE Conference', 'CS Conferences 2026'],
  timing: '9:00 AM - 6:00 PM IST',
  exhibitors: ['Google', 'Microsoft', 'Amazon Web Services', 'TCS', 'Infosys', 'Wipro']
};

const relatedEvents = [
  { id: 2, title: 'Annual Alumni Meetup 2026', date: 'Mar 28', location: 'Le Meridien, Delhi', image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=300' },
  { id: 3, title: 'Tech Seminar: Future of AI', date: 'Apr 5', location: 'Online (Zoom)', image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=300' },
  { id: 4, title: 'National Startup Summit', date: 'Apr 22', location: 'Mumbai', image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=300' },
];

export default function EventPage() {
  const { id } = useParams();
  const { currentUser } = useSelector(state => state.user);
  const [event, setEvent] = useState(mockEvent);
  const [activeTab, setActiveTab] = useState('About');
  const [registered, setRegistered] = useState(false);
  const [saved, setSaved] = useState(false);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([
    { author: { name: 'Dhruv Baliyan', avatar: 'https://ui-avatars.com/api/?name=Dhruv+Baliyan&background=2BC0B4&color=fff' }, text: 'Really looking forward to the keynote by Dr. Sharma! Anyone else attending from NSIT?', time: '2h ago' },
    { author: { name: 'Shivansh Sharma', avatar: 'https://ui-avatars.com/api/?name=Shivansh+Sharma&background=6C63FF&color=fff' }, text: 'The Federated Learning workshop sounds very relevant to my current research. Excited!', time: '5h ago' },
  ]);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/events/${id}`);
        if (res.data) setEvent(res.data);
      } catch (e) {
        setEvent(mockEvent);
      }
    };
    if (id && id !== '1' && id !== '2' && id !== '3') fetchEvent();
  }, [id]);

  const handleComment = (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setComments(prev => [{ author: currentUser, text: comment, time: 'Just now' }, ...prev]);
    setComment('');
  };

  const formatDate = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  const tabs = ['About', 'Exhibitors', 'Speakers', 'Reviews', 'Details'];

  return (
    <div className="min-h-screen bg-[#f8fafb]">
      <RoleSwitcher />
      <Navbar type="app" />

      {/* Event Hero */}
      <div className="relative h-64 overflow-hidden">
        <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
        <div className="absolute bottom-4 left-4 right-4">
          <div className="max-w-7xl mx-auto">
            <span className="inline-block bg-[#FF8C42] text-white text-xs font-semibold px-3 py-1 rounded-full mb-2">
              📅 {formatDate(event.date)}
            </span>
            <h1 className="text-white text-xl font-bold leading-tight line-clamp-2">{event.title}</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-5">
        {/* Quick Info Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-5 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>📍</span>
            <span>{event.location}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>👥</span>
            <span>{event.turnout}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>🕒</span>
            <span>{event.timing}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>💰</span>
            <span>{event.entryFee}</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="flex -space-x-2">
              {event.attendees?.slice(0, 3).map((a, i) => (
                <img key={i} src={a.avatar} alt={a.name} className="w-7 h-7 rounded-full border-2 border-white" />
              ))}
            </div>
            <span className="text-xs text-gray-500">{event.attendees?.length}+ attending</span>
          </div>
        </div>

        <div className="flex gap-5">
          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-4 overflow-hidden">
              <div className="flex border-b border-gray-100 overflow-x-auto">
                {tabs.map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-5 py-3 text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                      activeTab === tab
                        ? 'text-[#2BC0B4] border-b-2 border-[#2BC0B4]'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="p-5">
                {activeTab === 'About' && (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600 leading-relaxed">{event.description}</p>
                    <div>
                      <h3 className="font-semibold text-[#1a1a2e] mb-3">Highlights</h3>
                      <ul className="space-y-2">
                        {event.highlights?.map((h, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                            <span className="w-5 h-5 bg-[#e8faf9] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-[#2BC0B4] text-xs">✓</span>
                            </span>
                            {h}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#1a1a2e] mb-3">Listed In</h3>
                      <div className="flex flex-wrap gap-2">
                        {event.listedIn?.map(l => (
                          <span key={l} className="bg-gray-100 text-gray-600 text-xs px-3 py-1.5 rounded-full">{l}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'Exhibitors' && (
                  <div>
                    <h3 className="font-semibold text-[#1a1a2e] mb-4">Exhibitors</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {event.exhibitors?.map(ex => (
                        <div key={ex} className="border border-gray-100 rounded-lg p-4 flex items-center justify-center hover:border-[#2BC0B4]/30 transition-colors">
                          <span className="font-semibold text-gray-700">{ex}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'Speakers' && (
                  <div>
                    <h3 className="font-semibold text-[#1a1a2e] mb-4">Speakers</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {event.speakers?.map((speaker, i) => {
                        const name = speaker.split(' (')[0];
                        const org = speaker.split('(')[1]?.replace(')', '');
                        return (
                          <div key={i} className="flex items-center gap-3 p-4 border border-gray-100 rounded-xl hover:border-[#2BC0B4]/30 transition-colors">
                            <div className="w-12 h-12 bg-gradient-to-br from-[#2BC0B4] to-[#1a9e93] rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                              {name[0]}
                            </div>
                            <div>
                              <p className="font-semibold text-[#1a1a2e] text-sm">{name}</p>
                              <p className="text-xs text-gray-500">{org}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {activeTab === 'Reviews' && (
                  <div>
                    <p className="text-sm text-gray-500 text-center py-4">No reviews yet. Be the first to review after attending!</p>
                  </div>
                )}

                {activeTab === 'Details' && (
                  <div className="space-y-3">
                    {[
                      { label: 'Date & Time', value: `${formatDate(event.date)} | ${event.timing}`, icon: '📅' },
                      { label: 'Location', value: event.location, icon: '📍' },
                      { label: 'Entry Fee', value: event.entryFee, icon: '💰' },
                      { label: 'Expected Turnout', value: event.turnout, icon: '👥' },
                      { label: 'Category', value: 'Academic Conference', icon: '🎓' },
                    ].map(item => (
                      <div key={item.label} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <span className="text-xl">{item.icon}</span>
                        <div>
                          <p className="text-xs text-gray-500">{item.label}</p>
                          <p className="text-sm font-medium text-[#1a1a2e]">{item.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Community Discussion */}
            <div className="card">
              <h3 className="font-semibold text-[#1a1a2e] mb-3">Talk to People Attending</h3>
              <form onSubmit={handleComment} className="mb-4">
                <div className="flex gap-2">
                  <img src={currentUser?.avatar} alt="" className="w-9 h-9 rounded-full flex-shrink-0" />
                  <div className="flex-1">
                    <input
                      type="text"
                      value={comment}
                      onChange={e => setComment(e.target.value)}
                      placeholder="Share your expectations about this event..."
                      className="input-field text-sm"
                    />
                  </div>
                  <button type="submit" className="btn-primary text-sm px-4">Post</button>
                </div>
              </form>
              <div className="space-y-3">
                {comments.map((c, i) => (
                  <div key={i} className="flex gap-3">
                    <img src={c.author?.avatar} alt={c.author?.name} className="w-8 h-8 rounded-full flex-shrink-0" />
                    <div className="flex-1 bg-gray-50 rounded-xl px-3 py-2">
                      <p className="text-xs font-semibold text-[#1a1a2e]">{c.author?.name}</p>
                      <p className="text-sm text-gray-600">{c.text}</p>
                      <p className="text-xs text-gray-400 mt-1">{c.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="w-72 shrink-0 space-y-4">
            {/* Action Buttons */}
            <div className="card">
              <button
                onClick={() => setRegistered(!registered)}
                className={`w-full py-3 rounded-xl font-semibold text-sm mb-3 transition-all ${
                  registered
                    ? 'bg-green-100 text-green-700 border border-green-200'
                    : 'bg-[#2BC0B4] text-white hover:bg-[#1a9e93]'
                }`}
              >
                {registered ? '✓ Registered!' : '🎟️ Register for Free'}
              </button>

              <div className="grid grid-cols-3 gap-2">
                <button className="flex flex-col items-center gap-1 p-2 rounded-lg border border-gray-200 hover:border-[#2BC0B4]/30 transition-colors text-gray-600 hover:text-[#2BC0B4]">
                  <span className="text-lg">📅</span>
                  <span className="text-xs">Calendar</span>
                </button>
                <button className="flex flex-col items-center gap-1 p-2 rounded-lg border border-gray-200 hover:border-[#2BC0B4]/30 transition-colors text-gray-600 hover:text-[#2BC0B4]">
                  <span className="text-lg">📤</span>
                  <span className="text-xs">Share</span>
                </button>
                <button
                  onClick={() => setSaved(!saved)}
                  className={`flex flex-col items-center gap-1 p-2 rounded-lg border transition-colors ${
                    saved ? 'border-[#2BC0B4] bg-[#e8faf9] text-[#2BC0B4]' : 'border-gray-200 text-gray-600 hover:border-[#2BC0B4]/30 hover:text-[#2BC0B4]'
                  }`}
                >
                  <span className="text-lg">{saved ? '🔖' : '📌'}</span>
                  <span className="text-xs">{saved ? 'Saved' : 'Save'}</span>
                </button>
              </div>
            </div>

            {/* Related Events */}
            <div className="card">
              <h3 className="font-semibold text-[#1a1a2e] text-sm mb-3">Related Events</h3>
              <div className="space-y-3">
                {relatedEvents.map(re => (
                  <a key={re.id} href={`/events/${re.id}`} className="flex gap-3 hover:bg-gray-50 rounded-lg p-2 transition-colors">
                    <img src={re.image} alt={re.title} className="w-14 h-12 rounded-lg object-cover flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-[#1a1a2e] line-clamp-2">{re.title}</p>
                      <p className="text-xs text-gray-500 mt-1">📅 {re.date}</p>
                      <p className="text-xs text-gray-400">📍 {re.location}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* Organizer Info */}
            <div className="card">
              <h3 className="font-semibold text-[#1a1a2e] text-sm mb-3">Organized By</h3>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#e8faf9] rounded-xl flex items-center justify-center">
                  <span className="text-xl">🏛️</span>
                </div>
                <div>
                  <p className="font-semibold text-[#1a1a2e] text-sm">IIT Delhi</p>
                  <p className="text-xs text-gray-500">Department of Computer Science</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
