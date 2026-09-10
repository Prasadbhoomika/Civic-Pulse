import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, Shield, UserCheck, Activity, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, demoLoginAs } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (role) => {
    setError('');
    setLoading(true);
    try {
      await demoLoginAs(role);
      navigate('/dashboard');
    } catch (err) {
      setError('Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="bg-cyber-surface border border-cyber-border rounded-lg max-w-md w-full p-8 shadow-hud space-y-6 font-mono relative hud-corner-brackets">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded bg-cyber-bg border border-cyber-cyan mx-auto flex items-center justify-center shadow-cyan-glow">
            <Activity className="w-7 h-7 text-cyber-cyan animate-pulse" />
          </div>
          <h2 className="text-xl font-bold text-cyber-cyan glow-text-cyan">CIVICPULSE AUTHENTICATION</h2>
          <p className="text-xs text-cyber-muted">CYBER CITY CONTROL SYSTEM LOGIN</p>
        </div>

        {error && (
          <div className="p-3 bg-cyber-red/10 border border-cyber-red rounded text-xs text-cyber-red">
            {error}
          </div>
        )}

        {/* 1-Click Demo Login Shortcuts */}
        <div className="space-y-2 pt-2 border-t border-b border-cyber-border/40 py-3">
          <span className="text-[10px] text-cyber-muted uppercase tracking-wider block">INSTANT DEMO LOGINS (1-CLICK):</span>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => handleDemoLogin('citizen')}
              className="py-1.5 px-2 rounded bg-cyber-bg border border-cyber-cyan/40 text-cyber-cyan hover:bg-cyber-cyan/10 transition-colors flex items-center justify-between"
            >
              <span>CITIZEN</span>
              <UserCheck className="w-3 h-3 text-cyber-cyan" />
            </button>
            <button
              onClick={() => handleDemoLogin('worker')}
              className="py-1.5 px-2 rounded bg-cyber-bg border border-cyber-green/40 text-cyber-green hover:bg-cyber-green/10 transition-colors flex items-center justify-between"
            >
              <span>FIELD WORKER</span>
              <UserCheck className="w-3 h-3 text-cyber-green" />
            </button>
            <button
              onClick={() => handleDemoLogin('officer')}
              className="py-1.5 px-2 rounded bg-cyber-bg border border-cyber-amber/40 text-cyber-amber hover:bg-cyber-amber/10 transition-colors flex items-center justify-between"
            >
              <span>DEPT OFFICER</span>
              <UserCheck className="w-3 h-3 text-cyber-amber" />
            </button>
            <button
              onClick={() => handleDemoLogin('admin')}
              className="py-1.5 px-2 rounded bg-cyber-bg border border-cyber-magenta/40 text-cyber-magenta hover:bg-cyber-magenta/10 transition-colors flex items-center justify-between"
            >
              <span>SYSTEM ADMIN</span>
              <UserCheck className="w-3 h-3 text-cyber-magenta" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-cyber-muted mb-1 uppercase">EMAIL ADDRESS</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-cyber-muted absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@civicpulse.city"
                className="w-full bg-cyber-bg border border-cyber-border rounded pl-10 pr-3 py-2 text-cyber-text focus:outline-none focus:border-cyber-cyan transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-cyber-muted mb-1 uppercase">PASSWORD</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-cyber-muted absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-cyber-bg border border-cyber-border rounded pl-10 pr-3 py-2 text-cyber-text focus:outline-none focus:border-cyber-cyan transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded bg-cyber-cyan text-cyber-bg font-bold text-xs hover:bg-opacity-90 transition-all shadow-cyan-glow flex items-center justify-center space-x-2"
          >
            <span>{loading ? 'AUTHENTICATING...' : 'ACCESS CONTROL CENTER'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-cyber-muted pt-2 border-t border-cyber-border/40">
          Need an account? <Link to="/register" className="text-cyber-cyan hover:underline">REGISTER CITIZEN ID</Link>
        </div>
      </div>
    </div>
  );
}
