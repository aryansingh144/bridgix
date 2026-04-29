'use client';
import { useState, useEffect, useRef, useMemo } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import Navbar from '../../components/Navbar';
import RoleSwitcher from '../../components/RoleSwitcher';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const POLL_INTERVAL_MS = 5000;

function timeAgo(date) {
  if (!date) return '';
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return 'now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  return `${Math.floor(seconds / 86400)}d`;
}

/**
 * Group a flat list of messages (where the active user is sender or receiver)
 * into one entry per other-party.
 */
function buildConversations(messages, currentUserId) {
  if (!currentUserId) return [];
  const map = new Map();
  for (const m of messages) {
    const sender = m.sender;
    const receiver = m.receiver;
    if (!sender || !receiver) continue;
    const senderId = sender._id || sender;
    const receiverId = receiver._id || receiver;
    const otherId = String(senderId) === String(currentUserId) ? receiverId : senderId;
    const otherUser = String(senderId) === String(currentUserId) ? receiver : sender;
    if (!map.has(String(otherId))) {
      map.set(String(otherId), {
        otherId: String(otherId),
        user: otherUser,
        lastMessage: m,
        unread: 0
      });
    }
    const conv = map.get(String(otherId));
    if (new Date(m.createdAt) > new Date(conv.lastMessage.createdAt)) {
      conv.lastMessage = m;
    }
    if (!m.read && String(receiverId) === String(currentUserId)) {
      conv.unread += 1;
    }
  }
  return [...map.values()].sort(
    (a, b) => new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt)
  );
}

export default function ChatPage() {
  const { currentUser, users, hydrated } = useSelector(state => state.user);

  const [allMessages, setAllMessages] = useState([]);
  const [activeOtherId, setActiveOtherId] = useState(null);
  const [messageDraft, setMessageDraft] = useState('');
  const [tab, setTab] = useState('All');
  const [search, setSearch] = useState('');
  const [moderationNotice, setModerationNotice] = useState(null);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  const conversations = useMemo(
    () => buildConversations(allMessages, currentUser?._id),
    [allMessages, currentUser?._id]
  );

  // Build a unified people list: existing conversations first (most recent at top),
  // then every other user from the directory you haven't messaged yet, restricted
  // to the current user's college so cross-institution discovery is opt-in only.
  const peopleList = useMemo(() => {
    if (!currentUser?._id) return [];
    const conversationIds = new Set(conversations.map(c => String(c.otherId)));
    const myCollege = currentUser.college;
    const others = (users || [])
      .filter(u => String(u._id) !== String(currentUser._id) && !conversationIds.has(String(u._id)))
      .filter(u => !myCollege || u.college === myCollege)
      .map(u => ({ otherId: String(u._id), user: u, lastMessage: null, unread: 0 }));
    return [...conversations, ...others];
  }, [conversations, users, currentUser?._id, currentUser?.college]);

  const fetchMessages = async () => {
    if (!currentUser?._id) return;
    try {
      const res = await axios.get(`${API_URL}/api/messages/${currentUser._id}`);
      setAllMessages(res.data || []);
    } catch (e) {
      // backend down — keep what we have
    }
  };

  useEffect(() => {
    if (!hydrated || !currentUser?._id) return;
    fetchMessages();
    const id = setInterval(fetchMessages, POLL_INTERVAL_MS);
    return () => clearInterval(id);
    // eslint-disable-next-line
  }, [hydrated, currentUser?._id]);

  // Default-select the first conversation, or first person in the list if no convs yet.
  useEffect(() => {
    if (activeOtherId) return;
    if (conversations.length > 0) {
      setActiveOtherId(conversations[0].otherId);
    } else if (peopleList.length > 0) {
      setActiveOtherId(peopleList[0].otherId);
    }
  }, [conversations, peopleList, activeOtherId]);

  const activeMessages = useMemo(() => {
    if (!activeOtherId || !currentUser?._id) return [];
    return allMessages
      .filter(m => {
        const sId = String(m.sender?._id || m.sender);
        const rId = String(m.receiver?._id || m.receiver);
        return (
          (sId === String(currentUser._id) && rId === activeOtherId) ||
          (rId === String(currentUser._id) && sId === activeOtherId)
        );
      })
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  }, [allMessages, activeOtherId, currentUser?._id]);

  const activeUser = useMemo(() => {
    const conv = conversations.find(c => c.otherId === activeOtherId);
    if (conv) return conv.user;
    return users.find(u => String(u._id) === activeOtherId) || null;
  }, [conversations, users, activeOtherId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeMessages.length, activeOtherId]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!messageDraft.trim() || !activeOtherId || !currentUser?._id || sending) return;
    setSending(true);
    setModerationNotice(null);
    const optimistic = {
      _id: 'temp-' + Date.now(),
      sender: { _id: currentUser._id, name: currentUser.name, avatar: currentUser.avatar },
      receiver: { _id: activeOtherId, name: activeUser?.name, avatar: activeUser?.avatar },
      content: messageDraft,
      createdAt: new Date().toISOString(),
      flagged: false
    };
    setAllMessages(prev => [...prev, optimistic]);
    const draft = messageDraft;
    setMessageDraft('');

    try {
      const res = await axios.post(`${API_URL}/api/messages`, {
        sender: currentUser._id,
        receiver: activeOtherId,
        content: draft
      });
      const saved = res.data?.message;
      const moderation = res.data?.moderation;
      if (saved?._id) {
        setAllMessages(prev => prev.map(m => (m._id === optimistic._id ? saved : m)));
      }
      if (moderation?.flagged) {
        setModerationNotice({
          score: moderation.score,
          reasons: moderation.reasons || []
        });
      }
    } catch (e) {
      setAllMessages(prev => prev.filter(m => m._id !== optimistic._id));
      setModerationNotice({ error: e.response?.data?.error || e.message });
    } finally {
      setSending(false);
    }
  };

  const filteredPeople = peopleList.filter(p => {
    if (tab === 'Students' && p.user?.role !== 'student') return false;
    if (tab === 'Alumni' && p.user?.role !== 'alumni') return false;
    return (p.user?.name || '').toLowerCase().includes(search.toLowerCase());
  });

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
                {['All', 'Students', 'Alumni'].map(t => (
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
              {filteredPeople.length === 0 && (
                <div className="p-6 text-center text-xs text-gray-400 dark:text-gray-500">
                  No one matches that filter.
                </div>
              )}
              {filteredPeople.map(p => {
                const subtitle = p.lastMessage
                  ? p.lastMessage.content
                  : (p.user?.occupation || p.user?.education || p.user?.role);
                return (
                  <div
                    key={p.otherId}
                    onClick={() => setActiveOtherId(p.otherId)}
                    className={`flex items-center gap-3 p-3 cursor-pointer transition-colors ${
                      activeOtherId === p.otherId
                        ? 'bg-[#e8faf9] dark:bg-teal-900/20'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700/40'
                    }`}
                  >
                    <div className="relative flex-shrink-0">
                      <img
                        src={p.user?.avatar || `https://ui-avatars.com/api/?name=${p.user?.name || 'U'}&background=2BC0B4&color=fff`}
                        alt={p.user?.name}
                        className="w-11 h-11 rounded-full"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-[#1a1a2e] dark:text-gray-100 truncate">
                          {p.user?.name}
                        </span>
                        <span className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0 ml-1">
                          {p.lastMessage ? timeAgo(p.lastMessage.createdAt) : ''}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {p.lastMessage?.flagged && (
                          <span className="text-red-500 font-semibold mr-1">⚠️ flagged</span>
                        )}
                        {subtitle}
                      </p>
                    </div>
                    {p.unread > 0 && (
                      <span className="w-5 h-5 bg-[#2BC0B4] text-white text-xs rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                        {p.unread}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Center - Chat */}
          <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col overflow-hidden">
            {activeUser && (
              <div className="flex items-center gap-3 p-4 border-b border-gray-100 dark:border-gray-700">
                <div className="relative">
                  <img
                    src={activeUser.avatar || `https://ui-avatars.com/api/?name=${activeUser.name || 'U'}&background=2BC0B4&color=fff`}
                    alt={activeUser.name}
                    className="w-10 h-10 rounded-full"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-[#1a1a2e] dark:text-gray-100 text-sm">
                    {activeUser.name}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {activeUser.occupation || activeUser.education || activeUser.role}
                  </p>
                </div>
              </div>
            )}

            {moderationNotice && (
              <div className="mx-4 mt-3 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/40 flex items-start gap-3">
                <span className="text-lg">🛡️</span>
                <div className="flex-1 text-sm">
                  {moderationNotice.error ? (
                    <p className="text-red-700 dark:text-red-400">{moderationNotice.error}</p>
                  ) : (
                    <>
                      <p className="font-semibold text-red-700 dark:text-red-400">
                        Your message was flagged ({Math.round((moderationNotice.score || 0) * 100)}% spam) and is awaiting review.
                      </p>
                      {moderationNotice.reasons?.length > 0 && (
                        <p className="text-xs text-red-600 dark:text-red-300 mt-1">
                          {moderationNotice.reasons.join(', ')}
                        </p>
                      )}
                    </>
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

            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#f8fafb] dark:bg-gray-900">
              {activeMessages.length === 0 && activeUser && (
                <div className="text-center text-xs text-gray-400 dark:text-gray-500 py-8">
                  No messages yet. Say hi to {activeUser.name}.
                </div>
              )}
              {activeMessages.map(msg => {
                const senderId = String(msg.sender?._id || msg.sender);
                const isMe = senderId === String(currentUser?._id);
                return (
                  <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    {!isMe && (
                      <img
                        src={msg.sender?.avatar || `https://ui-avatars.com/api/?name=${msg.sender?.name || 'U'}&background=2BC0B4&color=fff`}
                        alt=""
                        className="w-8 h-8 rounded-full mr-2 flex-shrink-0 self-end"
                      />
                    )}
                    <div className="max-w-xs lg:max-w-md">
                      <div
                        className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                          isMe
                            ? 'bg-[#2BC0B4] text-white rounded-br-sm'
                            : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 shadow-sm rounded-bl-sm'
                        } ${msg.flagged ? 'ring-2 ring-red-400' : ''}`}
                      >
                        {msg.content}
                      </div>
                      <p className={`text-xs text-gray-400 dark:text-gray-500 mt-1 flex items-center gap-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                        {msg.flagged && (
                          <span className="text-red-500 font-semibold">
                            ⚠️ flagged · {Math.round((msg.spamScore || 0) * 100)}%
                          </span>
                        )}
                        <span>{timeAgo(msg.createdAt)}</span>
                      </p>
                    </div>
                    {isMe && (
                      <img
                        src={currentUser?.avatar}
                        alt=""
                        className="w-8 h-8 rounded-full ml-2 flex-shrink-0 self-end"
                      />
                    )}
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-gray-100 dark:border-gray-700">
              <form onSubmit={handleSend} className="flex items-center gap-3">
                <input
                  type="text"
                  value={messageDraft}
                  onChange={e => setMessageDraft(e.target.value)}
                  placeholder={activeUser ? `Message ${activeUser.name}…` : 'Pick a conversation'}
                  disabled={!activeUser || sending}
                  className="input-field flex-1 disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!messageDraft.trim() || !activeUser || sending}
                  className="w-10 h-10 bg-[#2BC0B4] hover:bg-[#1a9e93] rounded-full flex items-center justify-center transition-colors flex-shrink-0 disabled:opacity-50"
                >
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </form>
            </div>
          </div>

          {/* Right - Group Chats (decorative for the demo) */}
          <div className="w-60 space-y-4">
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
                    <p className="text-xs font-semibold text-[#1a1a2e] dark:text-gray-100 truncate">
                      {group.name}
                    </p>
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
