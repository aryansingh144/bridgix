'use client';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'next/navigation';
import Navbar from '../../../components/Navbar';
import RoleSwitcher from '../../../components/RoleSwitcher';
import Link from 'next/link';
import axios from 'axios';
import api from '../../../lib/api';
import { updateCurrentUser } from '../../../store/slices/userSlice';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const mockStudentProfile = {
  _id: 'mock-student-1',
  name: 'Aryan Singh',
  avatar: 'https://ui-avatars.com/api/?name=Aryan+Singh&background=2BC0B4&color=fff&size=200',
  role: 'student',
  age: 21,
  education: 'B.Tech Computer Science',
  status: 'Active',
  yearOfStudy: '3rd Year',
  location: 'New Delhi, India',
  topSkills: ['React', 'Node.js', 'Python'],
  bio: 'Passionate computer science student with a keen interest in full-stack development and AI. Currently exploring the intersection of machine learning and web technologies. I love building products that solve real-world problems and actively contribute to open-source projects.',
  skills: ['JavaScript', 'React', 'Node.js', 'Python', 'MongoDB', 'Git', 'REST APIs', 'TypeScript'],
  coreNeeds: ['Mentorship in AI/ML', 'Internship Opportunities', 'Career Guidance', 'Industry Connections', 'Research Collaboration'],
  points: 55,
  college: 'IIT Delhi',
  quote: '"The best way to predict the future is to invent it." — Alan Kay',
  connections: []
};

const mockAlumniProfile = {
  _id: 'mock-alumni-1',
  name: 'Mohit Singh',
  avatar: 'https://ui-avatars.com/api/?name=Mohit+Singh&background=FF8C42&color=fff&size=200',
  role: 'alumni',
  age: 28,
  education: 'B.Tech Computer Science, IIT Delhi',
  status: 'Working',
  occupation: 'Senior Software Engineer at Google',
  location: 'Bengaluru, India',
  topSkills: ['System Design', 'Distributed Systems', 'Go', 'Java', 'Kubernetes'],
  techLiteracy: 'Expert',
  bio: 'Senior Software Engineer at Google with 5+ years of experience in distributed systems and large-scale infrastructure. Passionate about mentoring students and giving back to the community. I believe in the power of knowledge sharing and am always happy to help aspiring engineers.',
  services: ['Technical Interviews Preparation', 'Resume Review', 'Career Counseling', 'System Design Guidance', 'Code Reviews', 'Mock Interviews'],
  workExperience: ['Senior Software Engineer - Google (2021–Present)', 'Software Engineer - Amazon (2019–2021)', 'Software Engineer Intern - Microsoft (2018)'],
  points: 105,
  college: 'IIT Delhi',
  quote: '"The journey of a thousand miles begins with one step."',
  connections: []
};

const mockConnections = [
  { _id: 'u1', name: 'Mohit Singh', avatar: 'https://ui-avatars.com/api/?name=Mohit+Singh&background=FF8C42&color=fff', role: 'alumni' },
  { _id: 'u2', name: 'Shivansh Sharma', avatar: 'https://ui-avatars.com/api/?name=Shivansh+Sharma&background=6C63FF&color=fff', role: 'alumni' },
  { _id: 'u3', name: 'Dhruv Baliyan', avatar: 'https://ui-avatars.com/api/?name=Dhruv+Baliyan&background=2BC0B4&color=fff', role: 'student' },
  { _id: 'u4', name: 'Suprapti Srivastava', avatar: 'https://ui-avatars.com/api/?name=Suprapti+Srivastava&background=E91E63&color=fff', role: 'student' },
];

export default function ProfilePage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { currentUser, activeRole } = useSelector(state => state.user);
  const [profile, setProfile] = useState(null);
  const [connected, setConnected] = useState(false);
  const [activeTab, setActiveTab] = useState('about');
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (id === 'me') {
        setProfile(currentUser?.role === 'alumni' ? mockAlumniProfile : mockStudentProfile);
        return;
      }
      try {
        const res = await axios.get(`${API_URL}/api/users/${id}`);
        setProfile(res.data);
      } catch (e) {
        setProfile(activeRole === 'alumni' ? mockAlumniProfile : mockStudentProfile);
      }
    };
    fetchProfile();
  }, [id, activeRole]);

  const openEdit = () => {
    setEditForm({
      name: profile.name || '',
      bio: profile.bio || '',
      location: profile.location || '',
      education: profile.education || '',
      occupation: profile.occupation || '',
      yearOfStudy: profile.yearOfStudy || '',
      college: profile.college || '',
      topSkills: (profile.topSkills || []).join(', '),
      skills: (profile.skills || []).join(', '),
      services: (profile.services || []).join(', '),
      coreNeeds: (profile.coreNeeds || []).join(', '),
      quote: profile.quote || ''
    });
    setEditError(null);
    setEditing(true);
  };

  const csvToArray = (s) => (s ? s.split(',').map(t => t.trim()).filter(Boolean) : []);

  const saveEdit = async (e) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    setEditError(null);
    try {
      const userId = currentUser?._id;
      if (!userId || String(userId).startsWith('mock-')) {
        throw new Error('Saving requires a real user (sign in or seed the database).');
      }
      const payload = {
        name: editForm.name,
        bio: editForm.bio,
        location: editForm.location,
        education: editForm.education,
        occupation: editForm.occupation,
        yearOfStudy: editForm.yearOfStudy,
        college: editForm.college,
        topSkills: csvToArray(editForm.topSkills),
        skills: csvToArray(editForm.skills),
        services: csvToArray(editForm.services),
        coreNeeds: csvToArray(editForm.coreNeeds),
        quote: editForm.quote
      };
      const { data } = await api.put(`/api/users/${userId}`, payload);
      setProfile(data);
      dispatch(updateCurrentUser(data));
      setEditing(false);
    } catch (err) {
      setEditError(err.response?.data?.error || err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (!profile) return (
    <div className="min-h-screen bg-[#f8fafb] dark:bg-gray-950">
      <RoleSwitcher />
      <Navbar type="app" />
      <div className="flex items-center justify-center h-64">
        <div className="text-[#2BC0B4] text-lg">Loading profile...</div>
      </div>
    </div>
  );

  const isOwn = id === 'me' || id === currentUser?._id;

  return (
    <div className="min-h-screen bg-[#f8fafb] dark:bg-gray-950">
      <RoleSwitcher />
      <Navbar type="app" />

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Profile Header Banner */}
        <div className="bg-gradient-to-r from-[#2BC0B4] to-[#1a9e93] h-32 rounded-t-2xl relative mb-16">
          <img
            src={profile.avatar}
            alt={profile.name}
            className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-gray-800 absolute bottom-0 left-8 translate-y-1/2 shadow-lg"
          />
          {isOwn && (
            <button className="absolute top-3 right-3 bg-white/20 hover:bg-white/30 text-white rounded-lg p-2 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left Column */}
          <div className="space-y-4">
            {/* Basic Info Card */}
            <div className="card">
              <h2 className="text-xl font-bold text-[#1a1a2e] dark:text-gray-100">{profile.name}</h2>
              <span className={`inline-block mt-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
                profile.role === 'alumni'
                  ? 'bg-[#FF8C42]/10 text-[#FF8C42]'
                  : 'bg-[#2BC0B4]/10 text-[#2BC0B4]'
              }`}>
                {profile.role === 'alumni' ? '👔 Alumni' : '🎓 Student'}
              </span>

              <div className="mt-4 space-y-2.5">
                {[
                  { label: 'Age', value: profile.age, icon: '🎂' },
                  { label: 'Education', value: profile.education, icon: '📚' },
                  { label: 'Status', value: profile.status, icon: '✅' },
                  profile.role === 'student'
                    ? { label: 'Year', value: profile.yearOfStudy, icon: '📅' }
                    : { label: 'Occupation', value: profile.occupation, icon: '💼' },
                  { label: 'Location', value: profile.location, icon: '📍' },
                  profile.role === 'alumni'
                    ? { label: 'Tech Literacy', value: profile.techLiteracy, icon: '💻' }
                    : { label: 'Top Skills', value: profile.topSkills?.join(', '), icon: '⭐' }
                ].filter(Boolean).map(item => (
                  <div key={item.label} className="flex items-start gap-2">
                    <span className="text-sm">{item.icon}</span>
                    <div>
                      <span className="text-xs text-gray-400 dark:text-gray-500">{item.label}: </span>
                      <span className="text-xs font-medium text-[#1a1a2e] dark:text-gray-200">{item.value}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="mt-4 space-y-2">
                {isOwn ? (
                  <>
                    {profile.role === 'student' && (
                      <button className="w-full btn-primary text-sm py-2">📄 Upload Resume</button>
                    )}
                    {profile.role === 'alumni' && (
                      <button className="w-full btn-primary text-sm py-2">📝 New Note</button>
                    )}
                    <button onClick={openEdit} className="w-full btn-outline text-sm py-2">✏️ Edit Profile</button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setConnected(!connected)}
                      className={`w-full text-sm py-2 rounded-lg font-semibold transition-all ${
                        connected
                          ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                          : 'btn-primary'
                      }`}
                    >
                      {connected ? '✓ Connected' : '+ Connect'}
                    </button>
                    <Link href={`/chat?user=${profile._id}`} className="block w-full text-center border border-gray-200 dark:border-gray-600 rounded-lg text-sm py-2 font-medium text-gray-600 dark:text-gray-300 hover:border-[#2BC0B4] hover:text-[#2BC0B4] transition-all">
                      💬 Message
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Points Card */}
            <div className="card bg-gradient-to-br from-[#2BC0B4] to-[#1a9e93] text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/80">Bridgix Points</p>
                  <p className="text-2xl font-bold">{profile.points}</p>
                </div>
                <span className="text-3xl">🏆</span>
              </div>
              <div className="mt-3 bg-white/20 rounded-full h-2">
                <div className="bg-white rounded-full h-2" style={{ width: `${Math.min((profile.points / 150) * 100, 100)}%` }}></div>
              </div>
              <p className="text-xs text-white/70 mt-1">{150 - profile.points} points to next level</p>
            </div>

            {/* Quote */}
            {profile.quote && (
              <div className="card border-l-4 border-[#2BC0B4]">
                <p className="text-sm text-gray-600 dark:text-gray-300 italic">{profile.quote}</p>
              </div>
            )}

            {/* Alumni-specific Action Buttons */}
            {profile.role === 'alumni' && isOwn && (
              <div className="card space-y-2">
                <h4 className="text-sm font-semibold text-[#1a1a2e] dark:text-gray-100 mb-2">Quick Actions</h4>
                {['My Connect Bank', 'Conduct Webinar', 'Profile Language', 'Add Links', 'Add Skills'].map(action => (
                  <button key={action} className="w-full text-left text-sm text-gray-600 dark:text-gray-300 hover:text-[#2BC0B4] py-2 px-3 rounded-lg hover:bg-[#e8faf9] dark:hover:bg-teal-900/20 flex items-center justify-between transition-all">
                    <span>{action}</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="lg:col-span-2 space-y-4">
            {/* Tabs */}
            <div className="card p-0 overflow-hidden">
              <div className="flex border-b border-gray-100 dark:border-gray-700">
                {['about', 'posts', 'connections'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-3 text-sm font-medium capitalize transition-all ${
                      activeTab === tab
                        ? 'text-[#2BC0B4] border-b-2 border-[#2BC0B4]'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {activeTab === 'about' && (
                <div className="p-5 space-y-5">
                  <div>
                    <h3 className="font-semibold text-[#1a1a2e] dark:text-gray-100 mb-2">About</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{profile.bio}</p>
                  </div>

                  {profile.role === 'student' ? (
                    <>
                      <div>
                        <h3 className="font-semibold text-[#1a1a2e] dark:text-gray-100 mb-3">Skills</h3>
                        <div className="flex flex-wrap gap-2">
                          {profile.skills?.map(skill => (
                            <span key={skill} className="bg-[#e8faf9] dark:bg-teal-900/30 text-[#2BC0B4] text-xs font-medium px-3 py-1.5 rounded-full">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold text-[#1a1a2e] dark:text-gray-100 mb-3">Core Needs</h3>
                        <ul className="space-y-2">
                          {profile.coreNeeds?.map(need => (
                            <li key={need} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                              <span className="w-1.5 h-1.5 bg-[#2BC0B4] rounded-full flex-shrink-0"></span>
                              {need}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <h3 className="font-semibold text-[#1a1a2e] dark:text-gray-100 mb-3">Services Offered</h3>
                        <ul className="space-y-2">
                          {profile.services?.map(service => (
                            <li key={service} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                              <span className="w-1.5 h-1.5 bg-[#FF8C42] rounded-full flex-shrink-0"></span>
                              {service}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h3 className="font-semibold text-[#1a1a2e] dark:text-gray-100 mb-3">Work Experience</h3>
                        <ul className="space-y-3">
                          {profile.workExperience?.map((exp, i) => (
                            <li key={i} className="flex items-start gap-3">
                              <div className="w-8 h-8 bg-[#e8faf9] dark:bg-teal-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                                <span className="text-sm">💼</span>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-[#1a1a2e] dark:text-gray-100">{exp.split(' - ')[0]}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{exp.split(' - ').slice(1).join(' - ')}</p>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h3 className="font-semibold text-[#1a1a2e] dark:text-gray-100 mb-3">Top Skills</h3>
                        <div className="flex flex-wrap gap-2">
                          {profile.topSkills?.map(skill => (
                            <span key={skill} className="bg-[#FF8C42]/10 text-[#FF8C42] text-xs font-medium px-3 py-1.5 rounded-full">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {activeTab === 'posts' && (
                <div className="p-5">
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">Posts will appear here</p>
                </div>
              )}

              {activeTab === 'connections' && (
                <div className="p-5">
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 font-medium">127 Connections</p>
                  <div className="grid grid-cols-2 gap-3">
                    {mockConnections.map(user => (
                      <div key={user._id} className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 dark:border-gray-700 hover:border-[#2BC0B4]/30 transition-all">
                        <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full" />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-[#1a1a2e] dark:text-gray-100 truncate">{user.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.role}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {editing && editForm && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800">
              <h3 className="font-bold text-[#1a1a2e] dark:text-gray-100">Edit profile</h3>
              <button onClick={() => setEditing(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">✕</button>
            </div>

            <form onSubmit={saveEdit} className="px-5 py-4 space-y-3">
              {editError && (
                <div className="p-2 rounded bg-red-50 border border-red-200 text-xs text-red-700">{editError}</div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Full name</label>
                  <input
                    value={editForm.name}
                    onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                    className="input-field text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Location</label>
                  <input
                    value={editForm.location}
                    onChange={e => setEditForm({ ...editForm, location: e.target.value })}
                    className="input-field text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Bio</label>
                <textarea
                  value={editForm.bio}
                  onChange={e => setEditForm({ ...editForm, bio: e.target.value })}
                  className="input-field text-sm resize-none"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Education</label>
                  <input
                    value={editForm.education}
                    onChange={e => setEditForm({ ...editForm, education: e.target.value })}
                    className="input-field text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">College</label>
                  <input
                    value={editForm.college}
                    onChange={e => setEditForm({ ...editForm, college: e.target.value })}
                    className="input-field text-sm"
                  />
                </div>
              </div>

              {profile.role === 'student' ? (
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Year of study</label>
                  <input
                    value={editForm.yearOfStudy}
                    onChange={e => setEditForm({ ...editForm, yearOfStudy: e.target.value })}
                    className="input-field text-sm"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Occupation</label>
                  <input
                    value={editForm.occupation}
                    onChange={e => setEditForm({ ...editForm, occupation: e.target.value })}
                    className="input-field text-sm"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Top skills (comma separated)</label>
                <input
                  value={editForm.topSkills}
                  onChange={e => setEditForm({ ...editForm, topSkills: e.target.value })}
                  className="input-field text-sm"
                  placeholder="React, Node.js, Python"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">All skills</label>
                <input
                  value={editForm.skills}
                  onChange={e => setEditForm({ ...editForm, skills: e.target.value })}
                  className="input-field text-sm"
                />
              </div>

              {profile.role === 'student' ? (
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Core needs</label>
                  <input
                    value={editForm.coreNeeds}
                    onChange={e => setEditForm({ ...editForm, coreNeeds: e.target.value })}
                    className="input-field text-sm"
                    placeholder="Mentorship, Internship Opportunities, …"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Services offered</label>
                  <input
                    value={editForm.services}
                    onChange={e => setEditForm({ ...editForm, services: e.target.value })}
                    className="input-field text-sm"
                    placeholder="Mock Interviews, Resume Review, …"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Quote</label>
                <input
                  value={editForm.quote}
                  onChange={e => setEditForm({ ...editForm, quote: e.target.value })}
                  className="input-field text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setEditing(false)} className="btn-outline text-sm">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary text-sm disabled:opacity-50">
                  {saving ? 'Saving…' : 'Save changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
