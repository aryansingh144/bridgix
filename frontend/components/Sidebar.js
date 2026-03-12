'use client';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useSelector } from 'react-redux';
import { Suspense } from 'react';

function SidebarInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { currentUser } = useSelector(state => state.user);
  const activeTab = searchParams.get('tab');

  const isActive = (href) => {
    const [hPath, hQuery] = href.split('?');
    if (hPath !== pathname) return false;
    if (!hQuery) return !activeTab;
    const tab = new URLSearchParams(hQuery).get('tab');
    return activeTab === tab;
  };

  const mainLinks = [
    { href: '/home',                    label: 'Connect',             icon: '🤝' },
    { href: '/home?tab=placement',      label: 'Placement Assistance', icon: '💼' },
    { href: '/home?tab=academic',       label: 'Academic Support',     icon: '📚' },
    { href: '/discussion',              label: 'Discussion Forums',    icon: '💬' },
    { href: '/home?tab=webinar',        label: 'Join Webinar',         icon: '🎥' },
  ];

  const shortcuts = [
    { href: '/discussion',              label: 'Discuss',              icon: '💡' },
    { href: '/discussion?type=panel',   label: 'Panel Discussion',     icon: '🎙️' },
  ];

  return (
    <aside className="w-64 shrink-0">
      {/* Profile Card */}
      <div className="card mb-3">
        <div className="flex flex-col items-center text-center pb-3 border-b border-gray-100 dark:border-gray-700">
          <img
            src={currentUser?.avatar}
            alt={currentUser?.name}
            className="w-16 h-16 rounded-full object-cover mb-2"
            style={{ border: '3px solid #2BC0B4' }}
          />
          <h3 className="font-semibold text-[#1a1a2e] dark:text-gray-100 text-sm">{currentUser?.name}</h3>
          <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">{currentUser?.role}</span>
          {currentUser?.college && (
            <span className="text-xs text-[#2BC0B4] mt-1">{currentUser?.college}</span>
          )}
        </div>
        <div className="pt-3 flex justify-around text-center">
          <div>
            <div className="font-bold text-[#1a1a2e] dark:text-gray-100 text-sm">127</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Connections</div>
          </div>
          <div className="border-l border-gray-100 dark:border-gray-700"></div>
          <div>
            <div className="font-bold text-[#1a1a2e] dark:text-gray-100 text-sm">{currentUser?.points || 0}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Points</div>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="card mb-3">
        <nav className="space-y-1">
          {mainLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={isActive(link.href) ? 'sidebar-link-active' : 'sidebar-link'}
            >
              <span>{link.icon}</span>
              <span>{link.label}</span>
            </Link>
          ))}
        </nav>
      </div>

      {/* Shortcuts */}
      <div className="card">
        <h4 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Your Shortcuts</h4>
        <nav className="space-y-1">
          {shortcuts.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={pathname === link.href.split('?')[0] && (link.href.includes('?') ? searchParams.get('type') === 'panel' : !searchParams.get('type')) ? 'sidebar-link-active' : 'sidebar-link'}
            >
              <span>{link.icon}</span>
              <span>{link.label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
}

export default function Sidebar() {
  return (
    <Suspense fallback={<aside className="w-64 shrink-0" />}>
      <SidebarInner />
    </Suspense>
  );
}
