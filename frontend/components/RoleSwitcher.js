'use client';
import { useDispatch, useSelector } from 'react-redux';
import { setActiveRole } from '../store/slices/userSlice';

const roles = [
  { id: 'student', label: 'Student', icon: '🎓' },
  { id: 'alumni', label: 'Alumni', icon: '👔' },
  { id: 'college', label: 'College', icon: '🏛️' },
];

export default function RoleSwitcher() {
  const dispatch = useDispatch();
  const { activeRole, isAuthenticated } = useSelector(state => state.user);

  // When the user is signed in with a real account, the role switcher is
  // a confusing no-op — hide it.
  if (isAuthenticated) return null;

  return (
    <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Viewing as:</span>
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          {roles.map(role => (
            <button
              key={role.id}
              onClick={() => dispatch(setActiveRole(role.id))}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                activeRole === role.id
                  ? 'bg-[#2BC0B4] text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              <span>{role.icon}</span>
              <span>{role.label}</span>
            </button>
          ))}
        </div>
        <span className="text-xs text-gray-400 dark:text-gray-500">Demo Mode</span>
      </div>
    </div>
  );
}
