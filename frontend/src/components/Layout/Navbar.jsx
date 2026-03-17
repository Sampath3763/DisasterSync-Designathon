import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useWebSocket } from '../../contexts/WebSocketContext';
import { useNotifications } from '../../contexts/NotificationContext';
import NotificationPanel from '../Notifications/NotificationPanel';

export default function Navbar({ onToggleSidebar }) {
  const { user, logout } = useAuth();
  const { connected } = useWebSocket();
  const { unreadCount } = useNotifications();
  const [showNotifs, setShowNotifs] = useState(false);

  return (
    <header className="bg-gray-900 border-b border-gray-800 px-4 py-3 flex items-center justify-between z-10">
      <div className="flex items-center gap-3">
        <button onClick={onToggleSidebar} className="text-gray-400 hover:text-white p-1 rounded">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="text-gray-400 text-sm hidden md:block">Smart Disaster Response Coordination Platform</div>
      </div>

      <div className="flex items-center gap-3">
        {/* WS Status */}
        <div className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-full border ${connected ? 'border-green-800 text-green-400 bg-green-900/30' : 'border-red-800 text-red-400 bg-red-900/30'}`}>
          <div className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-green-400 pulse-dot' : 'bg-red-400'}`}></div>
          <span>{connected ? 'Live' : 'Reconnecting'}</span>
        </div>

        {/* Notifications */}
        <div className="relative">
          <button onClick={() => setShowNotifs(s => !s)} className="relative p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center font-bold text-white">{unreadCount > 9 ? '9+' : unreadCount}</span>
            )}
          </button>
          {showNotifs && <NotificationPanel onClose={() => setShowNotifs(false)} />}
        </div>

        {/* User menu */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-blue-700 flex items-center justify-center text-xs font-bold hidden md:flex">
            {user?.avatar || 'U'}
          </div>
          <span className="text-sm text-gray-300 hidden md:block">{user?.name?.split(' ')[0]}</span>
          <button onClick={logout} className="text-xs text-gray-500 hover:text-red-400 transition-colors ml-1 px-2 py-1 rounded hover:bg-red-900/20">
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
