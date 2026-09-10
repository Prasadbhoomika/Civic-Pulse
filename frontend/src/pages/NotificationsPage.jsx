import React from 'react';
import { Bell, CheckCircle2, CheckSquare } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import { Link } from 'react-router-dom';

export default function NotificationsPage() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-mono pb-12">
      <div className="border-b border-cyber-border pb-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-cyber-cyan glow-text-cyan">SYSTEM NOTIFICATIONS & ALERTS</h1>
          <p className="text-xs text-cyber-muted">UNREAD ALERTS: <span className="text-cyber-magenta">{unreadCount}</span></p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="px-3 py-1.5 rounded bg-cyber-bg border border-cyber-cyan text-cyber-cyan text-xs flex items-center space-x-1.5 hover:bg-cyber-cyan/10"
          >
            <CheckSquare className="w-4 h-4" />
            <span>MARK ALL AS READ</span>
          </button>
        )}
      </div>

      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="p-12 text-center text-cyber-muted bg-cyber-card border border-cyber-border rounded">
            No system notifications found.
          </div>
        ) : (
          notifications.map(n => (
            <div
              key={n._id}
              onClick={() => markAsRead(n._id)}
              className={`p-4 rounded border text-xs cursor-pointer transition-all flex items-start space-x-3 ${
                n.read ? 'bg-cyber-bg/40 border-cyber-border text-cyber-muted' : 'bg-cyber-card border-cyber-cyan text-cyber-text shadow-cyan-glow'
              }`}
            >
              <div className={`p-2 rounded mt-0.5 ${n.read ? 'bg-cyber-bg border border-cyber-border text-cyber-muted' : 'bg-cyber-cyan/10 border border-cyber-cyan text-cyber-cyan'}`}>
                <Bell className="w-4 h-4" />
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-bold uppercase text-cyber-cyan">{n.type?.replace('_', ' ')}</span>
                  <span className="text-[10px] text-cyber-muted">{new Date(n.createdAt).toLocaleString()}</span>
                </div>
                <p className="text-cyber-text">{n.message}</p>
                {n.complaint && (
                  <Link
                    to={`/complaints/${n.complaint._id || n.complaint}`}
                    className="inline-block text-[10px] text-cyber-cyan underline hover:text-cyber-magenta pt-1"
                  >
                    VIEW COMPLAINT CASE FILE →
                  </Link>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
