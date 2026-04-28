'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTheme } from './ThemeProvider';
import { clearAuth } from '../store/slices/userSlice';
import { TOKEN_KEY } from '../lib/api';

function DarkToggle() {
  const { dark, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-[#e8faf9] dark:hover:bg-gray-600 flex items-center justify-center transition-colors"
      title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {dark ? (
        <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
        </svg>
      ) : (
        <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
          <path fillRule="evenodd" d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z" clipRule="evenodd" />
        </svg>
      )}
    </button>
  );
}

export default function Navbar({ type = 'landing' }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const { currentUser } = useSelector(state => state.user);

  if (type === 'app') {
    return <AppNavbar currentUser={currentUser} pathname={pathname} />;
  }

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-sm dark:shadow-gray-800/50 sticky top-0 z-40 border-b border-transparent dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-9 h-9 bg-[#2BC0B4] rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">B</span>
          </div>
          <span className="text-xl font-bold text-[#1a1a2e] dark:text-gray-100">Bridgix</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link href="/" className={`nav-link ${pathname === '/' ? 'text-[#2BC0B4] font-semibold' : ''}`}>Home</Link>
          <Link href="#sessions" className="nav-link">Sessions</Link>
          <Link href="#about" className="nav-link">About</Link>
          <Link href="#contact" className="nav-link">Contact Us</Link>
        </div>

        <div className="flex items-center gap-3">
          <DarkToggle />
          <Link href="/login" className="hidden md:block text-gray-600 dark:text-gray-300 hover:text-[#2BC0B4] font-medium text-sm">Sign In</Link>
          <Link href="/register-college" className="btn-primary text-sm">
            Register as College
          </Link>
          <button className="md:hidden text-gray-600 dark:text-gray-300" onClick={() => setMenuOpen(!menuOpen)}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 px-6 py-4 flex flex-col gap-3">
          <Link href="/" className="nav-link">Home</Link>
          <Link href="#sessions" className="nav-link">Sessions</Link>
          <Link href="#about" className="nav-link">About</Link>
          <Link href="#contact" className="nav-link">Contact Us</Link>
          <Link href="/login" className="nav-link">Sign In</Link>
          <Link href="/register-college" className="btn-primary text-sm text-center">Register as College</Link>
        </div>
      )}
    </nav>
  );
}

function AppNavbar({ currentUser, pathname }) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { notifications } = useSelector(state => state.app);
  const { isAuthenticated } = useSelector(state => state.user);
  const dispatch = useDispatch();
  const router = useRouter();
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleLogout = () => {
    if (typeof window !== 'undefined') window.localStorage.removeItem(TOKEN_KEY);
    dispatch(clearAuth());
    setProfileOpen(false);
    router.push('/login');
  };

  const navItems = [
    { href: '/home', label: 'Home', icon: '🏠' },
    { href: '/discussion', label: 'Discussion', icon: '💬' },
    { href: '/chat', label: 'Chats', icon: '✉️' },
    { href: '/leaderboard', label: 'Leaderboard', icon: '🏆' },
    { href: '/moderation', label: 'Moderation', icon: '🛡️' },
  ];

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-sm dark:shadow-gray-800/50 sticky top-0 z-40 border-b border-gray-100 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#2BC0B4] rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">B</span>
          </div>
          <span className="text-lg font-bold text-[#1a1a2e] dark:text-gray-100">Bridgix</span>
        </Link>

        <div className="flex items-center gap-1">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                pathname === item.href
                  ? 'text-[#2BC0B4] bg-[#e8faf9] dark:bg-teal-900/30'
                  : 'text-gray-500 dark:text-gray-400 hover:text-[#2BC0B4] hover:bg-[#e8faf9] dark:hover:bg-teal-900/20'
              }`}
            >
              <span>{item.icon}</span>
              <span className="hidden sm:block">{item.label}</span>
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <DarkToggle />

          <div className="relative">
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="relative w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-[#e8faf9] dark:hover:bg-gray-600 flex items-center justify-center transition-colors"
            >
              <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#FF8C42] text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {unreadCount}
                </span>
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 top-11 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 z-50">
                <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                  <h3 className="font-semibold text-sm text-[#1a1a2e] dark:text-gray-100">Notifications</h3>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.map(n => (
                    <div key={n.id} className={`px-4 py-3 border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer ${!n.read ? 'bg-[#f0fffe] dark:bg-teal-900/20' : ''}`}>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{n.text}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{n.time}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => setProfileOpen(o => !o)}
              className="flex items-center gap-2"
              title={currentUser?.name}
            >
              <img
                src={currentUser?.avatar || `https://ui-avatars.com/api/?name=${currentUser?.name}&background=2BC0B4&color=fff`}
                alt={currentUser?.name}
                className="w-9 h-9 rounded-full object-cover border-2 border-[#2BC0B4]"
              />
            </button>

            {profileOpen && (
              <div className="absolute right-0 top-11 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                  <p className="text-sm font-semibold text-[#1a1a2e] dark:text-gray-100 truncate">
                    {currentUser?.name}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
                    {currentUser?.email || currentUser?.role}
                  </p>
                  {!isAuthenticated && (
                    <p className="text-[10px] text-[#FF8C42] mt-1 font-medium">Demo session — not signed in</p>
                  )}
                </div>
                <Link
                  href={`/profile/${currentUser?._id || 'me'}`}
                  onClick={() => setProfileOpen(false)}
                  className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                >
                  View profile
                </Link>
                {isAuthenticated ? (
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    Logout
                  </button>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setProfileOpen(false)}
                    className="block px-4 py-2 text-sm text-[#2BC0B4] font-semibold hover:bg-[#e8faf9] dark:hover:bg-teal-900/20"
                  >
                    Sign in
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
