'use client';
import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import Navbar from '../../components/Navbar';
import RoleSwitcher from '../../components/RoleSwitcher';

const mockConversations = [
  {
    id: 'conv1',
    user: { _id: 'u1', name: 'Mohit Singh', avatar: 'https://ui-avatars.com/api/?name=Mohit+Singh&background=FF8C42&color=fff', occupation: 'Sr. Engineer at Google', role: 'alumni' },
    lastMessage: "Perfect. Yes, come with your current prep status",
    time: '23h',
    unread: 1,
    online: true
  },
  {
    id: 'conv2',
    user: { _id: 'u2', name: 'Shivansh Sharma', avatar: 'https://ui-avatars.com/api/?name=Shivansh+Sharma&background=6C63FF&color=fff', occupation: 'Data Scientist at Razorpay', role: 'alumni' },
    lastMessage: "Let's do a Zoom call sometime this week?",
    time: '20h',
    unread: 0,
    online: true
  },
  {
    id: 'conv3',
    user: { _id: 'u3', name: 'Dhruv Baliyan', avatar: 'https://ui-avatars.com/api/?name=Dhruv+Baliyan&background=2BC0B4&color=fff', education: 'B.Tech IT, NSIT', role: 'student' },
    lastMessage: "Thanks for the help with DSA!",
    time: '2d',
    unread: 0,
    online: false
  },
  {
    id: 'conv4',
    user: { _id: 'u4', name: 'Paresh Talwa', avatar: 'https://ui-avatars.com/api/?name=Paresh+Talwa&background=4CAF50&color=fff', occupation: 'PM at Flipkart', role: 'alumni' },
    lastMessage: "Product School and Exponent have free resources",
    time: '2d',
    unread: 2,
    online: false
  },
  {
    id: 'conv5',
    user: { _id: 'u5', name: 'Ritwik Jadeja', avatar: 'https://ui-avatars.com/api/?name=Ritwik+Jadeja&background=FF5722&color=fff', occupation: 'Co-Founder at TechBridge', role: 'alumni' },
    lastMessage: "Let's schedule a technical interview",
    time: '3d',
    unread: 0,
    online: true
  },
];

const mockMessages = {
  conv1: [
    { id: 1, from: 'me', text: "Hi Mohit! I'm Aryan, a 3rd year CSE student at IIT Delhi. I've seen your posts and would love some guidance on preparing for Google interviews. Would you be open to a 30-min chat?", time: '2d' },
    { id: 2, from: 'them', text: "Hey Aryan! Happy to help. I remember being in your position. Let's schedule a call this weekend. What time works for you?", time: '2d' },
    { id: 3, from: 'me', text: "That would be amazing! Saturday at 4 PM IST works perfectly for me. Should I prepare any specific questions?", time: '1d' },
    { id: 4, from: 'them', text: "Perfect. Yes, come with your current prep status — which topics you've covered, problems you're stuck on, and your target timeline. See you Saturday!", time: '23h' },
  ],
  conv2: [
    { id: 1, from: 'me', text: "Hi Shivansh! I'm working on a fraud detection project for my final year and saw your research paper. Could you share some insights on the model architecture?", time: '3d' },
    { id: 2, from: 'them', text: "Hi! Great to hear you're working in this space. The key insight is using ensemble methods with temporal features. What's your current dataset like?", time: '3d' },
    { id: 3, from: 'me', text: "We have synthetic transaction data with about 500K records, 2% fraud rate. Already handling class imbalance with SMOTE.", time: '2d' },
    { id: 4, from: 'them', text: "That's a great dataset size. For temporal features: rolling aggregates (last 1hr, 24hr, 7day), velocity features, and device fingerprinting patterns are gold. Let's do a Zoom call sometime this week?", time: '20h' },
  ],
  conv3: [
    { id: 1, from: 'them', text: "Hey! Can you help me understand dynamic programming? I'm stuck on a few problems.", time: '3d' },
    { id: 2, from: 'me', text: "Sure! The key is to identify the recurrence relation. Which problem are you stuck on?", time: '3d' },
    { id: 3, from: 'them', text: "Thanks for the help with DSA!", time: '2d' },
  ],
  conv4: [
    { id: 1, from: 'me', text: "Hello Paresh! I've been considering a transition to product management after my graduation. What's your honest advice?", time: '4d' },
    { id: 2, from: 'them', text: "Hi! It's a great path but requires genuine preparation. The transition is easier from a technical background.", time: '4d' },
    { id: 3, from: 'them', text: "Product School and Exponent have free resources that are excellent.", time: '2d' },
  ],
  conv5: [
    { id: 1, from: 'me', text: "Hi Ritwik! I saw your hiring post and I'm very interested in the ML Engineer role.", time: '5d' },
    { id: 2, from: 'them', text: "Hey! Absolutely, please send your portfolio. What's your experience with recommendation systems?", time: '5d' },
    { id: 3, from: 'them', text: "Let's schedule a technical interview. Our CTO would love to talk to you.", time: '3d' },
  ]
};

const suggestions = [
  { _id: 's1', name: 'Rajat Kumar', avatar: 'https://ui-avatars.com/api/?name=Rajat+Kumar&background=9C27B0&color=fff', role: 'student', mutual: 3 },
  { _id: 's2', name: 'Suprapti Srivastava', avatar: 'https://ui-avatars.com/api/?name=Suprapti+Srivastava&background=E91E63&color=fff', role: 'student', mutual: 5 },
  { _id: 's3', name: 'Bhavesh Sharma', avatar: 'https://ui-avatars.com/api/?name=Bhavesh+Sharma&background=2196F3&color=fff', role: 'alumni', mutual: 2 },
];

export default function ChatPage() {
  const { currentUser } = useSelector(state => state.user);
  const [activeConv, setActiveConv] = useState('conv1');
  const [message, setMessage] = useState('');
  const [localMessages, setLocalMessages] = useState({ ...mockMessages });
  const [tab, setTab] = useState('All');
  const [search, setSearch] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConv, localMessages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    const newMsg = { id: Date.now(), from: 'me', text: message, time: 'now' };
    setLocalMessages(prev => ({
      ...prev,
      [activeConv]: [...(prev[activeConv] || []), newMsg]
    }));
    setMessage('');
  };

  const activeConvData = mockConversations.find(c => c.id === activeConv);
  const messages = localMessages[activeConv] || [];
  const filteredConvs = mockConversations.filter(c =>
    c.user.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f8fafb] dark:bg-gray-950">
      <RoleSwitcher />
      <Navbar type="app" />

      <div className="max-w-7xl mx-auto px-4 py-5">
        <div className="flex gap-4 h-[calc(100vh-160px)]">
          {/* Left - Conversations List */}
          <div className="w-72 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-gray-100 dark:border-gray-700">
              <h2 className="font-bold text-[#1a1a2e] dark:text-gray-100 mb-3">Messages</h2>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="input-field pl-9 text-sm"
                />
                <svg className="w-4 h-4 text-gray-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <div className="flex gap-1 mt-3">
                {['All', 'Groups', 'Contacts'].map(t => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${
                      tab === t
                        ? 'bg-[#2BC0B4] text-white'
                        : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {filteredConvs.map(conv => (
                <div
                  key={conv.id}
                  onClick={() => setActiveConv(conv.id)}
                  className={`flex items-center gap-3 p-3 cursor-pointer transition-colors ${
                    activeConv === conv.id
                      ? 'bg-[#e8faf9] dark:bg-teal-900/20'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700/40'
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    <img src={conv.user.avatar} alt={conv.user.name} className="w-11 h-11 rounded-full" />
                    {conv.online && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white dark:border-gray-800"></span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-[#1a1a2e] dark:text-gray-100 truncate">{conv.user.name}</span>
                      <span className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0 ml-1">{conv.time}</span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{conv.lastMessage}</p>
                  </div>
                  {conv.unread > 0 && (
                    <span className="w-5 h-5 bg-[#2BC0B4] text-white text-xs rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                      {conv.unread}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Center - Chat Messages */}
          <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col overflow-hidden">
            {/* Chat Header */}
            {activeConvData && (
              <div className="flex items-center gap-3 p-4 border-b border-gray-100 dark:border-gray-700">
                <div className="relative">
                  <img src={activeConvData.user.avatar} alt={activeConvData.user.name} className="w-10 h-10 rounded-full" />
                  {activeConvData.online && <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white dark:border-gray-800"></span>}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-[#1a1a2e] dark:text-gray-100 text-sm">{activeConvData.user.name}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{activeConvData.online ? '🟢 Online' : 'Offline'} • {activeConvData.user.occupation || activeConvData.user.education}</p>
                </div>
                <div className="flex gap-2">
                  <button className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-[#e8faf9] dark:hover:bg-gray-600 flex items-center justify-center transition-colors">
                    <svg className="w-4 h-4 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </button>
                  <button className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-[#e8faf9] dark:hover:bg-gray-600 flex items-center justify-center transition-colors">
                    <svg className="w-4 h-4 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#f8fafb] dark:bg-gray-900">
              {messages.map(msg => (
                <div
                  key={msg.id}
                  className={`flex ${msg.from === 'me' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.from !== 'me' && activeConvData && (
                    <img src={activeConvData.user.avatar} alt="" className="w-8 h-8 rounded-full mr-2 flex-shrink-0 self-end" />
                  )}
                  <div className="max-w-xs lg:max-w-md">
                    <div
                      className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                        msg.from === 'me'
                          ? 'bg-[#2BC0B4] text-white rounded-br-sm'
                          : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 shadow-sm rounded-bl-sm'
                      }`}
                    >
                      {msg.text}
                    </div>
                    <p className={`text-xs text-gray-400 dark:text-gray-500 mt-1 ${msg.from === 'me' ? 'text-right' : 'text-left'}`}>
                      {msg.time}
                    </p>
                  </div>
                  {msg.from === 'me' && (
                    <img src={currentUser?.avatar} alt="" className="w-8 h-8 rounded-full ml-2 flex-shrink-0 self-end" />
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-100 dark:border-gray-700">
              <form onSubmit={handleSend} className="flex items-center gap-3">
                <button type="button" className="text-gray-400 dark:text-gray-500 hover:text-[#2BC0B4] transition-colors flex-shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                </button>
                <input
                  type="text"
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="input-field flex-1"
                />
                <button type="button" className="text-gray-400 dark:text-gray-500 hover:text-[#2BC0B4] transition-colors flex-shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </button>
                <button
                  type="submit"
                  className="w-10 h-10 bg-[#2BC0B4] hover:bg-[#1a9e93] rounded-full flex items-center justify-center transition-colors flex-shrink-0"
                >
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </form>
            </div>
          </div>

          {/* Right - Suggestions */}
          <div className="w-60 space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
              <h3 className="font-semibold text-[#1a1a2e] dark:text-gray-100 text-sm mb-3">Connect with More</h3>
              <div className="space-y-3">
                {suggestions.map(s => (
                  <div key={s._id} className="flex items-center gap-2">
                    <img src={s.avatar} alt={s.name} className="w-9 h-9 rounded-full flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-[#1a1a2e] dark:text-gray-100 truncate">{s.name}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">{s.mutual} mutual</p>
                    </div>
                    <button className="text-xs text-[#2BC0B4] font-semibold hover:underline flex-shrink-0">Add</button>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
              <h3 className="font-semibold text-[#1a1a2e] dark:text-gray-100 text-sm mb-3">Group Chats</h3>
              {[
                { name: 'IIT Delhi Alumni', members: 45, icon: '🏛️' },
                { name: 'Placement Prep 2026', members: 120, icon: '💼' },
                { name: 'ML Study Group', members: 32, icon: '🤖' }
              ].map(group => (
                <div key={group.name} className="flex items-center gap-2 py-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/40 rounded-lg px-2 transition-colors">
                  <div className="w-9 h-9 bg-[#e8faf9] dark:bg-teal-900/30 rounded-full flex items-center justify-center text-lg flex-shrink-0">
                    {group.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-[#1a1a2e] dark:text-gray-100 truncate">{group.name}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">{group.members} members</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
