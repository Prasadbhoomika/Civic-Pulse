import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, LogOut, Search, User, Shield, Radio, Check, ExternalLink } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

export default function Header() {
  const { user, logout, demoLoginAs } = useAuth();
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const [time, setTime] = useState(new Date().toLocaleTimeString());
  const [showNotifs, setShowNotifs] = useState(false);
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleQuickRoleSwitch = async (role) => {
    await demoLoginAs(role);
    setShowRoleSwitcher(false);
    navigate('/dashboard');
  };

  return (
    <header className="bg-cyber-surface border-b border-cyber-border px-6 py-3 flex items-center justify-between z-30 sticky top-0 backdrop-blur-md bg-opacity-90">
      {/* Header Left Status */}
      <div className="flex items-center space-x-6">
        <div>
          <h1 className="text-sm font-mono font-bold tracking-wider text-cyber-cyan flex items-center space-x-2">
            <Radio className="w-4 h-4 text-cyber-cyan animate-pulse" />
            <span>CIVICPULSE // COMMAND CENTER</span>
          </h1>
          <div className="flex items-center space-x-3 text-[11px] font-mono text-cyber-muted mt-0.5">
            <span className="flex items-center text-cyber-green">
              <span className="w-1.5 h-1.5 rounded-full bg-cyber-green mr-1"></span>
              SYSTEM OPERATIONAL
            </span>
            <span>|</span>
            <span>TIME: <span className="text-cyber-text">{time}</span></span>
          </div>
        </div>
      </div>

      {/* Header Right Actions */}
      <div className="flex items-center space-x-4">
        {/* Role Switcher Demo Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
            className="flex items-center space-x-2 px-3 py-1.5 rounded bg-cyber-bg border border-cyber-border text-xs font-mono text-cyber-cyan hover:border-cyber-cyan transition-colors shadow-hud"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>SWITCH ROLE: <strong className="uppercase text-cyber-magenta">{user?.role || 'GUEST'}</strong></span>
          </button>

          {showRoleSwitcher && (
            <div className="absolute right-0 mt-2 w-56 bg-cyber-surface border border-cyber-cyan rounded shadow-cyan-glow p-2 space-y-1 z-50">
              <div className="text-[10px] font-mono text-cyber-muted px-2 py-1 uppercase tracking-wider border-b border-cyber-border">
                Instant Demo Role Switch:
              </div>
              {['citizen', 'worker', 'officer', 'admin'].map((r) => (
                <button
                  key={r}
                  onClick={() => handleQuickRoleSwitch(r)}
                  className={`w-full text-left px-2.5 py-1.5 rounded text-xs font-mono uppercase flex items-center justify-between hover:bg-cyber-cyan/10 hover:text-cyber-cyan ${user?.role === r ? 'text-cyber-cyan font-bold bg-cyber-cyan/10' : 'text-cyber-muted'}`}
                >
                  <span>{r}</span>
                  {user?.role === r && <Check className="w-3.5 h-3.5 text-cyber-cyan" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifs(!showNotifs)}
            className="relative p-2 rounded bg-cyber-bg border border-cyber-border text-cyber-muted hover:text-cyber-cyan hover:border-cyber-cyan transition-colors"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-cyber-red text-cyber-bg text-[10px] font-mono font-bold rounded-full flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifs && (
            <div className="absolute right-0 mt-2 w-80 bg-cyber-surface border border-cyber-cyan rounded shadow-cyan-glow p-3 space-y-2 z-50">
              <div className="flex items-center justify-between border-b border-cyber-border pb-2">
                <span className="text-xs font-mono font-bold text-cyber-cyan uppercase">NOTIFICATIONS ({unreadCount})</span>
                <Link to="/notifications" onClick={() => setShowNotifs(false)} className="text-[10px] font-mono text-cyber-muted hover:text-cyber-cyan flex items-center">
                  VIEW ALL <ExternalLink className="w-3 h-3 ml-1" />
                </Link>
              </div>

              <div className="max-h-64 overflow-y-auto space-y-2">
                {notifications.length === 0 ? (
                  <p className="text-xs font-mono text-cyber-muted py-4 text-center">No recent alerts</p>
                ) : (
                  notifications.slice(0, 5).map((n) => (
                    <div
                      key={n._id}
                      onClick={() => markAsRead(n._id)}
                      className={`p-2 rounded border text-xs font-mono cursor-pointer transition-colors ${n.read ? 'bg-cyber-bg/40 border-cyber-border text-cyber-muted' : 'bg-cyber-cyan/5 border-cyber-cyan text-cyber-text'}`}
                    >
                      <p className="line-clamp-2">{n.message}</p>
                      <span className="text-[9px] text-cyber-muted block mt-1">
                        {new Date(n.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile / Logout */}
        {user ? (
          <div className="flex items-center space-x-3 border-l border-cyber-border pl-4">
            <img
              src={user.profileImage || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
              alt={user.name}
              className="w-8 h-8 rounded border border-cyber-cyan object-cover"
            />
            <div className="hidden md:block">
              <div className="text-xs font-mono font-bold text-cyber-text line-clamp-1">{user.name}</div>
              <div className="text-[10px] font-mono text-cyber-muted uppercase">{user.email}</div>
            </div>
            <button
              onClick={logout}
              title="Logout"
              className="p-1.5 rounded bg-cyber-bg border border-cyber-border text-cyber-muted hover:text-cyber-red hover:border-cyber-red transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <Link to="/login" className="px-3 py-1.5 rounded border border-cyber-cyan text-cyber-cyan text-xs font-mono hover:bg-cyber-cyan/10">LOGIN</Link>
            <Link to="/register" className="px-3 py-1.5 rounded bg-cyber-cyan text-cyber-bg font-bold text-xs font-mono hover:bg-opacity-90">REGISTER</Link>
          </div>
        )}
      </div>
    </header>
  );
}
