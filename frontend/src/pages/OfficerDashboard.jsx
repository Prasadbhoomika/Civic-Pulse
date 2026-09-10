import React, { useEffect, useState } from 'react';
import { 
  Building2, 
  UserCheck, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  ShieldAlert, 
  UserPlus,
  Filter
} from 'lucide-react';
import StatCard from '../components/StatCard';
import SlaCountdown from '../components/SlaCountdown';
import PriorityMeter from '../components/PriorityMeter';
import { complaintAPI, departmentAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function OfficerDashboard() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [selectedWorkerId, setSelectedWorkerId] = useState('');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDepartmentData();
  }, [filterCategory, filterStatus]);

  const fetchDepartmentData = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterCategory) params.category = filterCategory;
      if (filterStatus) params.status = filterStatus;

      const res = await complaintAPI.getAll(params);
      if (res.data.success) {
        setComplaints(res.data.data);
      }

      const workersRes = await departmentAPI.getWorkers();
      if (workersRes.data.success) {
        setWorkers(workersRes.data.data);
        if (workersRes.data.data.length > 0) {
          setSelectedWorkerId(workersRes.data.data[0]._id);
        }
      }
    } catch (err) {
      console.warn('Failed to load department data');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignWorker = async () => {
    if (!selectedComplaint || !selectedWorkerId) return;

    try {
      await complaintAPI.assignWorker(selectedComplaint._id, { workerId: selectedWorkerId });
      alert(`Worker assigned successfully to ${selectedComplaint.complaintId}`);
      setShowAssignModal(false);
      fetchDepartmentData();
    } catch (err) {
      alert(err.response?.data?.message || 'Assignment failed');
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await complaintAPI.updateStatus(id, { status, comment: `Department officer updated status to ${status}` });
      fetchDepartmentData();
    } catch (err) {
      alert(err.response?.data?.message || 'Status change failed');
    }
  };

  const breachedComplaints = complaints.filter(c => c.slaStatus === 'breached' && !['resolved', 'closed'].includes(c.status));

  return (
    <div className="space-y-6 font-mono">
      <div className="border-b border-cyber-border pb-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-cyber-amber glow-text-cyan">DEPARTMENT OFFICER COMMAND</h1>
          <p className="text-xs text-cyber-muted">OFFICER: <span className="text-cyber-text uppercase">{user?.name}</span> | PUBLIC WORKS DIVISION</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="DEPT QUEUE" value={complaints.length} color="cyan" subtext="Total Department Issues" />
        <StatCard label="UNASSIGNED" value={complaints.filter(c => !c.assignedWorker).length} color="magenta" subtext="Requires Field Dispatch" />
        <StatCard label="IN PROGRESS" value={complaints.filter(c => c.status === 'in_progress').length} color="amber" subtext="Active Field Work" />
        <StatCard label="SLA BREACHES" value={breachedComplaints.length} color="red" subtext="Requires Immediate Escalation" />
      </div>

      {/* Filter Toolbar */}
      <div className="bg-cyber-card border border-cyber-border rounded p-4 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center space-x-3">
          <Filter className="w-4 h-4 text-cyber-cyan" />
          <span className="font-bold text-cyber-cyan uppercase">FILTER QUEUE:</span>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-cyber-bg border border-cyber-border rounded px-2.5 py-1 text-cyber-text"
          >
            <option value="">ALL CATEGORIES</option>
            <option value="Potholes & Roads">Potholes & Roads</option>
            <option value="Streetlights">Streetlights</option>
            <option value="Water Leakage">Water Leakage</option>
            <option value="Garbage & Sanitation">Garbage & Sanitation</option>
            <option value="Electrical Hazards">Electrical Hazards</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-cyber-bg border border-cyber-border rounded px-2.5 py-1 text-cyber-text"
          >
            <option value="">ALL STATUSES</option>
            <option value="submitted">Submitted</option>
            <option value="assigned">Assigned</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="reopened">Reopened</option>
          </select>
        </div>
      </div>

      {/* Department Issues Table */}
      <div className="bg-cyber-card border border-cyber-border rounded overflow-hidden shadow-hud">
        <div className="p-4 border-b border-cyber-border flex justify-between items-center">
          <span className="text-xs font-bold text-cyber-cyan uppercase">DEPARTMENT COMPLAINT REGISTRY ({complaints.length})</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-cyber-surface border-b border-cyber-border text-cyber-muted uppercase text-[10px]">
              <tr>
                <th className="p-3">CASE ID</th>
                <th className="p-3">TITLE / CATEGORY</th>
                <th className="p-3">PRIORITY INDEX</th>
                <th className="p-3">SLA COUNTDOWN</th>
                <th className="p-3">ASSIGNED WORKER</th>
                <th className="p-3">STATUS</th>
                <th className="p-3 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cyber-border/40">
              {complaints.map(c => (
                <tr key={c._id} className="hover:bg-cyber-bg/50 transition-colors">
                  <td className="p-3 font-bold text-cyber-cyan">{c.complaintId}</td>
                  <td className="p-3">
                    <p className="font-bold text-cyber-text line-clamp-1">{c.title}</p>
                    <span className="text-[10px] text-cyber-muted">{c.category}</span>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded font-bold ${c.priority === 'Critical' ? 'bg-cyber-red/10 border border-cyber-red text-cyber-red' : 'bg-cyber-amber/10 text-cyber-amber'}`}>
                      {c.priorityScore}/100 ({c.priority})
                    </span>
                  </td>
                  <td className="p-3">
                    <SlaCountdown deadline={c.slaDeadline} status={c.status} />
                  </td>
                  <td className="p-3">
                    {c.assignedWorker ? (
                      <span className="text-cyber-green flex items-center">
                        <UserCheck className="w-3.5 h-3.5 mr-1" />
                        {c.assignedWorker.name || 'Assigned'}
                      </span>
                    ) : (
                      <button
                        onClick={() => { setSelectedComplaint(c); setShowAssignModal(true); }}
                        className="px-2 py-1 rounded bg-cyber-cyan/10 border border-cyber-cyan text-cyber-cyan text-[10px] hover:bg-cyber-cyan/20"
                      >
                        + ASSIGN WORKER
                      </button>
                    )}
                  </td>
                  <td className="p-3">
                    <span className="uppercase text-cyber-text font-bold px-2 py-0.5 rounded bg-cyber-bg border border-cyber-border">
                      {c.status?.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-3 text-right space-x-2">
                    <Link
                      to={`/complaints/${c._id}`}
                      className="px-2.5 py-1 rounded bg-cyber-bg border border-cyber-border text-cyber-cyan hover:border-cyber-cyan"
                    >
                      VIEW CASE
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Worker Assignment Modal */}
      {showAssignModal && selectedComplaint && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-cyber-surface border-2 border-cyber-cyan rounded-lg max-w-md w-full p-6 shadow-cyan-glow space-y-4 font-mono">
            <h3 className="text-base font-bold text-cyber-cyan border-b border-cyber-border pb-2">
              DISPATCH WORKER TO {selectedComplaint.complaintId}
            </h3>

            <p className="text-xs text-cyber-text">
              Assign field engineer to resolve <strong className="text-cyber-cyan">"{selectedComplaint.title}"</strong>.
            </p>

            <div>
              <label className="block text-xs text-cyber-muted mb-1 uppercase">SELECT FIELD WORKER</label>
              <select
                value={selectedWorkerId}
                onChange={(e) => setSelectedWorkerId(e.target.value)}
                className="w-full bg-cyber-bg border border-cyber-border rounded px-3 py-2 text-xs text-cyber-text"
              >
                {workers.map(w => (
                  <option key={w._id} value={w._id}>
                    {w.name} ({w.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={() => setShowAssignModal(false)}
                className="px-4 py-2 rounded bg-cyber-bg border border-cyber-border text-cyber-muted text-xs"
              >
                CANCEL
              </button>
              <button
                onClick={handleAssignWorker}
                className="px-4 py-2 rounded bg-cyber-cyan text-cyber-bg font-bold text-xs hover:bg-opacity-90 shadow-cyan-glow"
              >
                CONFIRM ASSIGNMENT
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
