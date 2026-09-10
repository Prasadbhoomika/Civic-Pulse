import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FilePlus, 
  MapPin, 
  ThumbsUp, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import StatCard from '../components/StatCard';
import CyberMap from '../components/CyberMap';
import SlaCountdown from '../components/SlaCountdown';
import { complaintAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function CitizenDashboard() {
  const { user } = useAuth();
  const [myComplaints, setMyComplaints] = useState([]);
  const [allComplaints, setAllComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await complaintAPI.getAll({ limit: 50 });
      if (res.data.success) {
        setAllComplaints(res.data.data);
        // Filter user's complaints
        const userReports = res.data.data.filter(c => c.reporter?._id === user?._id || c.reporter === user?._id);
        setMyComplaints(userReports.length > 0 ? userReports : res.data.data.slice(0, 6));
      }
    } catch (err) {
      console.warn('Failed to load citizen dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleSupport = async (id) => {
    try {
      const res = await complaintAPI.support(id);
      if (res.data.success) {
        fetchDashboardData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to support complaint');
    }
  };

  const pendingVerifications = myComplaints.filter(c => c.status === 'resolved' || c.status === 'citizen_verification');

  return (
    <div className="space-y-6 font-mono">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-cyber-border pb-4 gap-4">
        <div>
          <h1 className="text-xl font-bold text-cyber-cyan glow-text-cyan">CITIZEN COMMAND DASHBOARD</h1>
          <p className="text-xs text-cyber-muted">WELCOME BACK, <span className="text-cyber-text uppercase">{user?.name}</span></p>
        </div>

        <Link
          to="/report"
          className="px-4 py-2 rounded bg-cyber-cyan text-cyber-bg font-bold text-xs hover:bg-opacity-90 transition-all shadow-cyan-glow flex items-center space-x-2"
        >
          <FilePlus className="w-4 h-4" />
          <span>REPORT NEW CIVIC ISSUE</span>
        </Link>
      </div>

      {/* Verification Alerts Banner */}
      {pendingVerifications.length > 0 && (
        <div className="p-4 bg-cyber-magenta/10 border border-cyber-magenta rounded flex items-center justify-between shadow-magenta-glow">
          <div className="flex items-center space-x-3">
            <ShieldCheck className="w-6 h-6 text-cyber-magenta animate-pulse" />
            <div>
              <p className="text-xs font-bold text-cyber-magenta">RESOLUTION VERIFICATION REQUIRED ({pendingVerifications.length})</p>
              <p className="text-[11px] text-cyber-muted">A field worker has marked your report as resolved. Please review completion evidence.</p>
            </div>
          </div>
          <Link
            to={`/complaints/${pendingVerifications[0]._id}`}
            className="px-3 py-1.5 rounded bg-cyber-magenta text-cyber-bg font-bold text-xs hover:bg-opacity-90"
          >
            VERIFY NOW
          </Link>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="TOTAL SUBMITTED" value={myComplaints.length} color="cyan" subtext="Registered Citizen Reports" />
        <StatCard label="ACTIVE IN PROGRESS" value={myComplaints.filter(c => ['submitted', 'in_progress', 'assigned'].includes(c.status)).length} color="amber" subtext="Pending Field Resolution" />
        <StatCard label="RESOLVED & CLOSED" value={myComplaints.filter(c => ['resolved', 'closed'].includes(c.status)).length} color="green" subtext="Verified Completed Issues" />
        <StatCard label="COMMUNITY SUPPORTED" value={allComplaints.reduce((acc, c) => acc + (c.supportCount || 1), 0)} color="magenta" subtext="Total Citizen Upvotes" />
      </div>

      {/* Map & My Reports Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Nearby City Complaints Map */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-cyber-cyan flex items-center space-x-1.5">
              <MapPin className="w-4 h-4 text-cyber-cyan" />
              <span>NEARBY CIVIC INCIDENTS MAP</span>
            </span>
            <Link to="/map" className="text-[11px] text-cyber-muted hover:text-cyber-cyan">EXPLORE ALL</Link>
          </div>
          <CyberMap complaints={allComplaints} height="360px" />
        </div>

        {/* Action Panel / Recent Reports List */}
        <div className="space-y-3">
          <span className="text-xs font-bold text-cyber-cyan">MY REPORTED ISSUES</span>
          <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
            {myComplaints.length === 0 ? (
              <p className="text-xs text-cyber-muted text-center py-8">No reports submitted yet.</p>
            ) : (
              myComplaints.map(c => (
                <div key={c._id} className="p-3 bg-cyber-card border border-cyber-border rounded space-y-2 text-xs hud-corner-brackets hover:border-cyber-cyan transition-colors">
                  <div className="flex justify-between items-center text-[10px] text-cyber-muted">
                    <span className="text-cyber-cyan font-bold">{c.complaintId}</span>
                    <span className="uppercase text-cyber-magenta px-1 rounded bg-cyber-magenta/10">{c.priority}</span>
                  </div>

                  <h4 className="font-bold text-cyber-text line-clamp-1">{c.title}</h4>

                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-cyber-muted">STATUS: <strong className="text-cyber-cyan uppercase">{c.status?.replace('_', ' ')}</strong></span>
                    <button
                      onClick={() => handleSupport(c._id)}
                      className="flex items-center space-x-1 px-2 py-0.5 rounded bg-cyber-bg border border-cyber-border hover:border-cyber-cyan text-cyber-muted hover:text-cyber-cyan"
                    >
                      <ThumbsUp className="w-3 h-3 text-cyber-cyan" />
                      <span>{c.supportCount || 1}</span>
                    </button>
                  </div>

                  <Link
                    to={`/complaints/${c._id}`}
                    className="block text-center py-1 rounded bg-cyber-bg border border-cyber-cyan/40 text-cyber-cyan text-[11px] hover:bg-cyber-cyan/10 transition-colors mt-2"
                  >
                    VIEW STATUS TIMELINE
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
