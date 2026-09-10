import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FilePlus, 
  Map, 
  Layers, 
  Bell, 
  ShieldAlert, 
  CheckSquare, 
  BarChart3, 
  ChevronLeft, 
  ChevronRight, 
  Activity,
  UserCheck,
  Building2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

  const userRole = user?.role || 'citizen';

  const navItems = [
    { label: 'COMMAND CENTER', path: '/dashboard', icon: LayoutDashboard, roles: ['citizen', 'worker', 'officer', 'admin'] },
    { label: 'REPORT ISSUE', path: '/report', icon: FilePlus, roles: ['citizen', 'admin'] },
    { label: 'CITY MAP', path: '/map', icon: Map, roles: ['citizen', 'worker', 'officer', 'admin'] },
    { label: 'MY ASSIGNMENTS', path: '/dashboard', icon: CheckSquare, roles: ['worker'] },
    { label: 'DEPT QUEUE', path: '/dashboard', icon: Building2, roles: ['officer'] },
    { label: 'SYSTEM ANALYTICS', path: '/analytics', icon: BarChart3, roles: ['admin', 'officer'] },
    { label: 'NOTIFICATIONS', path: '/notifications', icon: Bell, roles: ['citizen', 'worker', 'officer', 'admin'] }
  ];

  const filteredNav = navItems.filter(item => item.roles.includes(userRole));

  return (
    <aside className={`bg-cyber-surface border-r border-cyber-border transition-all duration-300 relative flex flex-col z-20 ${collapsed ? 'w-20' : 'w-64'}`}>
      {/* Brand Header */}
      <div className="p-4 border-b border-cyber-border flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-3 overflow-hidden">
          <div className="w-10 h-10 rounded bg-cyber-bg border border-cyber-cyan flex items-center justify-center shadow-cyan-glow shrink-0">
            <Activity className="w-6 h-6 text-cyber-cyan animate-pulse" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-lg tracking-wider text-cyber-cyan font-mono glow-text-cyan">CIVICPULSE</span>
              <span className="text-[10px] text-cyber-muted font-mono tracking-widest">CYBER CITY HUD v2.4</span>
            </div>
          )}
        </Link>
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded bg-cyber-bg border border-cyber-border text-cyber-muted hover:text-cyber-cyan hover:border-cyber-cyan transition-colors"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Role Badge */}
      {!collapsed && (
        <div className="px-4 py-3 border-b border-cyber-border/50 bg-cyber-bg/50">
          <div className="flex items-center space-x-2">
            <UserCheck className="w-4 h-4 text-cyber-magenta" />
            <span className="text-xs text-cyber-muted font-mono uppercase">IDENTITY:</span>
            <span className="text-xs font-mono font-bold uppercase text-cyber-magenta px-1.5 py-0.5 rounded bg-cyber-magenta/10 border border-cyber-magenta/30">
              {userRole}
            </span>
          </div>
        </div>
      )}

      {/* Navigation Links */}
      <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
        {filteredNav.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path + item.label}
              to={item.path}
              className={`flex items-center space-x-3 px-3 py-2.5 rounded text-sm font-mono tracking-wide transition-all group ${
                isActive
                  ? 'bg-cyber-cyan/10 border border-cyber-cyan text-cyber-cyan shadow-cyan-glow'
                  : 'text-cyber-muted hover:bg-cyber-bg hover:text-cyber-text hover:border hover:border-cyber-border'
              }`}
            >
              <Icon className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-cyber-cyan' : 'text-cyber-muted group-hover:text-cyber-cyan'}`} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* System Status Footer */}
      {!collapsed && (
        <div className="p-4 border-t border-cyber-border bg-cyber-bg/80 text-[11px] font-mono text-cyber-muted space-y-1">
          <div className="flex justify-between items-center">
            <span>GRID SYSTEM:</span>
            <span className="text-cyber-green flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-cyber-green animate-ping mr-1"></span>
              ONLINE
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span>NODE ID:</span>
            <span className="text-cyber-text">BLR-CENTRAL-04</span>
          </div>
        </div>
      )}
    </aside>
  );
}
