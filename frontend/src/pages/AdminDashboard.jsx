import React, { useEffect, useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  AreaChart, 
  Area 
} from 'recharts';
import { 
  Activity, 
  Users, 
  ShieldAlert, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  MapPin, 
  Cpu,
  Layers
} from 'lucide-react';
import StatCard from '../components/StatCard';
import CyberMap from '../components/CyberMap';
import { analyticsAPI, complaintAPI } from '../services/api';
import { Link } from 'react-router-dom';

const COLORS = ['#00E5FF', '#FF2BD6', '#7CFF4F', '#FFB020', '#FF3B5C', '#9945FF'];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminAnalytics();
  }, []);

  const fetchAdminAnalytics = async () => {
    try {
      setLoading(true);
      const res = await analyticsAPI.getAdminStats();
      if (res.data.success) {
        setStats(res.data.data);
      }

      const compRes = await complaintAPI.getAll({ limit: 40 });
      if (compRes.data.success) {
        setComplaints(compRes.data.data);
      }
    } catch (err) {
      console.warn('Failed to load admin analytics');
    } finally {
      setLoading(false);
    }
  };

  const summary = stats?.summary || {
    totalUsers: 142,
    totalComplaints: 32,
    activeComplaints: 18,
    resolvedComplaints: 14,
    criticalComplaints: 5,
    slaBreached: 2,
    systemHealth: '96.4%',
    avgResolutionHours: '32.4 hrs'
  };

  const categoryData = (stats?.categoryStats || [
    { _id: 'Potholes & Roads', count: 12 },
    { _id: 'Streetlights', count: 8 },
    { _id: 'Water Leakage', count: 6 },
    { _id: 'Garbage & Sanitation', count: 4 },
    { _id: 'Electrical Hazards', count: 2 }
  ]).map(item => ({ name: item._id, count: item.count }));

  const monthlyTrend = stats?.monthlyTrend || [
    { month: 'Mar', total: 42, resolved: 38 },
    { month: 'Apr', total: 58, resolved: 51 },
    { month: 'May', total: 64, resolved: 60 },
    { month: 'Jun', total: 89, resolved: 78 },
    { month: 'Jul', total: 112, resolved: 98 },
    { month: 'Aug', total: 145, resolved: 118 }
  ];

  return (
    <div className="space-y-6 font-mono">
      {/* Header Banner */}
      <div className="border-b border-cyber-border pb-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-cyber-magenta glow-text-magenta">CITY INTELLIGENCE COMMAND CENTER</h1>
          <p className="text-xs text-cyber-muted">SYSTEM ADMIN ANALYTICS // SMART CITY INFRASTRUCTURE MATRIX</p>
        </div>
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="TOTAL REGISTERED USERS" value={summary.totalUsers} color="cyan" icon={Users} subtext="Citizens & Staff" />
        <StatCard label="ACTIVE INCIDENTS" value={summary.activeComplaints} color="amber" icon={Activity} subtext="Pending Resolution" />
        <StatCard label="SLA BREACHES" value={summary.slaBreached} color="red" icon={ShieldAlert} subtext="Immediate Escalation" />
        <StatCard label="SYSTEM HEALTH" value={summary.systemHealth} color="green" icon={Cpu} subtext="Avg Resolution: 32.4h" />
      </div>

      {/* Recharts Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown Chart */}
        <div className="bg-cyber-card border border-cyber-border rounded p-4 space-y-4 hud-corner-brackets shadow-hud">
          <span className="text-xs font-bold text-cyber-cyan uppercase">INCIDENT CATEGORY DISTRIBUTION</span>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData}>
                <XAxis dataKey="name" stroke="#718096" tick={{ fill: '#718096', fontSize: 10 }} />
                <YAxis stroke="#718096" tick={{ fill: '#718096', fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0B101A', borderColor: '#00E5FF', color: '#EAF7FF', fontFamily: 'JetBrains Mono' }} />
                <Bar dataKey="count" fill="#00E5FF" radius={[4, 4, 0, 0]}>
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Trend Area Chart */}
        <div className="bg-cyber-card border border-cyber-border rounded p-4 space-y-4 hud-corner-brackets shadow-hud">
          <span className="text-xs font-bold text-cyber-magenta uppercase">MONTHLY RESOLUTION TREND (VOLUME VS RESOLVED)</span>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrend}>
                <XAxis dataKey="month" stroke="#718096" tick={{ fill: '#718096', fontSize: 10 }} />
                <YAxis stroke="#718096" tick={{ fill: '#718096', fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0B101A', borderColor: '#FF2BD6', color: '#EAF7FF', fontFamily: 'JetBrains Mono' }} />
                <Area type="monotone" dataKey="total" stroke="#FF2BD6" fill="#FF2BD6" fillOpacity={0.2} />
                <Area type="monotone" dataKey="resolved" stroke="#7CFF4F" fill="#7CFF4F" fillOpacity={0.2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* City Map Heatmap Section */}
      <div className="bg-cyber-card border border-cyber-border rounded p-4 space-y-3">
        <div className="flex justify-between items-center border-b border-cyber-border pb-2">
          <span className="text-xs font-bold text-cyber-cyan flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-cyber-cyan" />
            <span>GEOGRAPHIC INCIDENT HEATMAP OVERLAY</span>
          </span>
        </div>
        <CyberMap complaints={complaints} height="380px" />
      </div>

      {/* Critical High Priority Complaints List */}
      <div className="bg-cyber-card border border-cyber-border rounded overflow-hidden shadow-hud">
        <div className="p-4 border-b border-cyber-border flex justify-between items-center">
          <span className="text-xs font-bold text-cyber-red uppercase">HIGH PRIORITY CRITICAL ESCALATION LIST</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-cyber-surface border-b border-cyber-border text-cyber-muted uppercase text-[10px]">
              <tr>
                <th className="p-3">CASE ID</th>
                <th className="p-3">TITLE</th>
                <th className="p-3">PRIORITY</th>
                <th className="p-3">REPORTER</th>
                <th className="p-3">STATUS</th>
                <th className="p-3 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cyber-border/40">
              {complaints.filter(c => c.priority === 'Critical' || c.priority === 'High').map(c => (
                <tr key={c._id} className="hover:bg-cyber-bg/50 transition-colors">
                  <td className="p-3 font-bold text-cyber-cyan">{c.complaintId}</td>
                  <td className="p-3 font-bold text-cyber-text">{c.title}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded bg-cyber-red/10 border border-cyber-red text-cyber-red font-bold">
                      {c.priorityScore}/100 ({c.priority})
                    </span>
                  </td>
                  <td className="p-3 text-cyber-muted">{c.reporter?.name || 'Citizen'}</td>
                  <td className="p-3 uppercase text-cyber-text">{c.status?.replace('_', ' ')}</td>
                  <td className="p-3 text-right">
                    <Link to={`/complaints/${c._id}`} className="px-2 py-1 rounded bg-cyber-bg border border-cyber-cyan text-cyber-cyan text-[10px]">
                      INSPECT
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
