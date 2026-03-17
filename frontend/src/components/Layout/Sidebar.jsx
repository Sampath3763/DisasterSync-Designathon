import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const NAV_ITEMS = [
  { to: '/', icon: '🏠', label: 'Dashboard', exact: true },
  { to: '/alerts', icon: '🚨', label: 'Alert Submission' },
  { to: '/resources', icon: '🚁', label: 'Resource Management' },
  { to: '/equipment', icon: '🛠️', label: 'Equipment Usage' },
  { to: '/training', icon: '📚', label: 'Training Module' },
  { to: '/communication', icon: '📡', label: 'Team Communication' },
];

const ADMIN_ITEMS = [
  { to: '/users', icon: '👥', label: 'User Management' },
];

export default function Sidebar({ open }) {
  const { user } = useAuth();
  const location = useLocation();

  return (
    <aside className={`${open ? 'w-64' : 'w-0 overflow-hidden'} transition-all duration-300 bg-gray-900 border-r border-gray-800 flex flex-col`}>
      {/* Brand */}
      <div className="px-6 py-5 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">DS</div>
          <div>
            <div className="font-bold text-white text-sm">DisasterSync</div>
            <div className="text-gray-500 text-xs">Response Platform</div>
          </div>
        </div>
      </div>

      {/* User info */}
      <div className="px-4 py-3 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-700 flex items-center justify-center text-xs font-bold">
            {user?.avatar || user?.name?.[0] || 'U'}
          </div>
          <div>
            <div className="text-sm font-medium text-white truncate">{user?.name}</div>
            <div className="text-xs text-gray-500 capitalize">{user?.role?.replace('_', ' ')}</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <div className="text-xs text-gray-600 uppercase tracking-wider px-3 mb-2">Navigation</div>
        {NAV_ITEMS.map(({ to, icon, label, exact }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 text-sm transition-colors ${
                isActive ? 'bg-blue-600/20 text-blue-400 border border-blue-600/30' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            <span className="text-base">{icon}</span>
            <span>{label}</span>
          </NavLink>
        ))}

        {/* Admin-only section */}
        {user?.role === 'admin' && (
          <div className="mt-4">
            <div className="text-xs text-gray-600 uppercase tracking-wider px-3 mb-2">Admin</div>
            {ADMIN_ITEMS.map(({ to, icon, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 text-sm transition-colors ${
                    isActive ? 'bg-purple-600/20 text-purple-400 border border-purple-600/30' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  }`
                }
              >
                <span className="text-base">{icon}</span>
                <span>{label}</span>
              </NavLink>
            ))}
          </div>
        )}
      </nav>

      {/* Status */}
      <div className="px-4 py-3 border-t border-gray-800">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <div className="w-2 h-2 rounded-full bg-green-500 pulse-dot"></div>
          <span>System Operational</span>
        </div>
      </div>
    </aside>
  );
}
