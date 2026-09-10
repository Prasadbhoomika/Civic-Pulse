import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Phone, Shield, Activity, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'citizen'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(formData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
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
          <h2 className="text-xl font-bold text-cyber-cyan glow-text-cyan">REGISTER CITIZEN ID</h2>
          <p className="text-xs text-cyber-muted">JOIN THE SMART CITY CIVICPULSE NETWORK</p>
        </div>

        {error && (
          <div className="p-3 bg-cyber-red/10 border border-cyber-red rounded text-xs text-cyber-red">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-cyber-muted mb-1 uppercase">FULL NAME</label>
            <div className="relative">
              <User className="w-4 h-4 text-cyber-muted absolute left-3 top-3" />
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Alex Mercer"
                className="w-full bg-cyber-bg border border-cyber-border rounded pl-10 pr-3 py-2 text-cyber-text focus:outline-none focus:border-cyber-cyan"
              />
            </div>
          </div>

          <div>
            <label className="block text-cyber-muted mb-1 uppercase">EMAIL ADDRESS</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-cyber-muted absolute left-3 top-3" />
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="citizen@civicpulse.city"
                className="w-full bg-cyber-bg border border-cyber-border rounded pl-10 pr-3 py-2 text-cyber-text focus:outline-none focus:border-cyber-cyan"
              />
            </div>
          </div>

          <div>
            <label className="block text-cyber-muted mb-1 uppercase">PHONE NUMBER</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-cyber-muted absolute left-3 top-3" />
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1 (800) 555-0199"
                className="w-full bg-cyber-bg border border-cyber-border rounded pl-10 pr-3 py-2 text-cyber-text focus:outline-none focus:border-cyber-cyan"
              />
            </div>
          </div>

          <div>
            <label className="block text-cyber-muted mb-1 uppercase">ROLE SYSTEM SELECT</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full bg-cyber-bg border border-cyber-border rounded px-3 py-2 text-cyber-text focus:outline-none focus:border-cyber-cyan"
            >
              <option value="citizen">CITIZEN (Report & Track Issues)</option>
              <option value="worker">FIELD WORKER (Resolve Tasks)</option>
              <option value="officer">DEPARTMENT OFFICER (Manage & Assign)</option>
              <option value="admin">SYSTEM ADMIN (Full Control)</option>
            </select>
          </div>

          <div>
            <label className="block text-cyber-muted mb-1 uppercase">PASSWORD</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-cyber-muted absolute left-3 top-3" />
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full bg-cyber-bg border border-cyber-border rounded pl-10 pr-3 py-2 text-cyber-text focus:outline-none focus:border-cyber-cyan"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded bg-cyber-cyan text-cyber-bg font-bold text-xs hover:bg-opacity-90 transition-all shadow-cyan-glow flex items-center justify-center space-x-2"
          >
            <span>{loading ? 'REGISTERING...' : 'CREATE ACCOUNT'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-cyber-muted pt-2 border-t border-cyber-border/40">
          Already registered? <Link to="/login" className="text-cyber-cyan hover:underline">LOGIN HERE</Link>
        </div>
      </div>
    </div>
  );
}
