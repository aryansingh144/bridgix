'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function UserCard({ user, compact = false }) {
  const [connected, setConnected] = useState(false);

  if (compact) {
    return (
      <div className="flex items-center gap-3 py-2">
        <Link href={`/profile/${user._id}`}>
          <img
            src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=2BC0B4&color=fff`}
            alt={user.name}
            className="w-10 h-10 rounded-full object-cover flex-shrink-0"
          />
        </Link>
        <div className="flex-1 min-w-0">
          <Link href={`/profile/${user._id}`} className="text-sm font-semibold text-[#1a1a2e] hover:text-[#2BC0B4] block truncate">
            {user.name}
          </Link>
          <p className="text-xs text-gray-500 truncate">
            {user.occupation || user.education || user.role}
          </p>
        </div>
        <button
          onClick={() => setConnected(!connected)}
          className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all flex-shrink-0 ${
            connected
              ? 'bg-gray-100 text-gray-500 border-gray-200'
              : 'bg-[#2BC0B4] text-white border-[#2BC0B4] hover:bg-[#1a9e93]'
          }`}
        >
          {connected ? 'Connected' : 'Follow'}
        </button>
      </div>
    );
  }

  return (
    <div className="card hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        <Link href={`/profile/${user._id}`}>
          <img
            src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=2BC0B4&color=fff`}
            alt={user.name}
            className="w-14 h-14 rounded-full object-cover border-2 border-[#2BC0B4]"
          />
        </Link>
        <div className="flex-1 min-w-0">
          <Link href={`/profile/${user._id}`} className="font-semibold text-[#1a1a2e] hover:text-[#2BC0B4] block">
            {user.name}
          </Link>
          <p className="text-xs text-gray-500">
            {user.occupation || user.education}
          </p>
          <p className="text-xs text-gray-400">{user.location}</p>
          <div className="flex flex-wrap gap-1 mt-2">
            {user.topSkills?.slice(0, 3).map(skill => (
              <span key={skill} className="tag bg-[#e8faf9] text-[#2BC0B4] text-xs px-2 py-0.5">
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="flex gap-2 mt-3">
        <button
          onClick={() => setConnected(!connected)}
          className={`flex-1 text-sm font-semibold py-2 rounded-lg border transition-all ${
            connected
              ? 'bg-gray-100 text-gray-500 border-gray-200'
              : 'bg-[#2BC0B4] text-white border-[#2BC0B4] hover:bg-[#1a9e93]'
          }`}
        >
          {connected ? '✓ Connected' : '+ Connect'}
        </button>
        <Link href={`/chat?user=${user._id}`} className="flex-1 text-sm font-semibold py-2 rounded-lg border border-gray-200 text-gray-600 hover:border-[#2BC0B4] hover:text-[#2BC0B4] text-center transition-all">
          Message
        </Link>
      </div>
    </div>
  );
}
