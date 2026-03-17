import React, { useEffect, useRef } from 'react';
import { useNotifications } from '../../contexts/NotificationContext';

const PRIORITY_COLORS = {
  critical: 'border-l-4 border-purple-500',
  urgent: 'border-l-4 border-red-500',
  high: 'border-l-4 border-orange-500',
  normal: 'border-l-4 border-blue-500',
};

const TYPE_ICONS = {
  alert_created: '🚨', sensor_critical: '⚠️', sensor_warning: '📡',
  resource_assigned: '🚁', support_request: '🆘', team_message: '📡',
  alert_verified: '✅', alert_resolved: '✓',
};

function timeAgo(ts) {
  const diff = Date.now() - new Date(ts).getTime();
  if (diff < 60000) return 'just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}

export default function NotificationPanel({ onClose }) {
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
  const panelRef = useRef(null);

  useEffect(() => {
    const handle = (e) => { if (!panelRef.current?.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [onClose]);

  return (
    <div ref={panelRef} className="absolute right-0 top-10 w-80 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl z-50 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm">Notifications</span>
          {unreadCount > 0 && <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">{unreadCount}</span>}
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="text-xs text-blue-400 hover:text-blue-300">Mark all read</button>
        )}
      </div>
      <div className="max-h-80 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="py-8 text-center text-gray-500 text-sm">No notifications</div>
        ) : (
          notifications.slice(0, 20).map(n => (
            <div
              key={n.id}
              onClick={() => markRead(n.id)}
              className={`px-4 py-3 border-b border-gray-800 hover:bg-gray-800 cursor-pointer transition-colors ${PRIORITY_COLORS[n.priority] || ''} ${!n.read ? 'bg-gray-800/50' : ''}`}
            >
              <div className="flex items-start gap-2">
                <span className="text-xl leading-none mt-0.5">{TYPE_ICONS[n.type] || '📢'}</span>
                <div className="flex-1 min-w-0">
                  <div className={`text-xs font-semibold truncate ${!n.read ? 'text-white' : 'text-gray-300'}`}>{n.title}</div>
                  <div className="text-xs text-gray-400 mt-0.5 line-clamp-2">{n.message}</div>
                  <div className="text-xs text-gray-600 mt-1">{timeAgo(n.timestamp)}</div>
                </div>
                {!n.read && <div className="w-2 h-2 bg-blue-500 rounded-full mt-1 flex-shrink-0"></div>}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
