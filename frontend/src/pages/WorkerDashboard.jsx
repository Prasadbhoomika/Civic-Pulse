import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  CheckSquare, 
  MapPin, 
  Upload, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Camera,
  ArrowRight
} from 'lucide-react';
import StatCard from '../components/StatCard';
import CyberMap from '../components/CyberMap';
import SlaCountdown from '../components/SlaCountdown';
import { complaintAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function WorkerDashboard() {
  const { user } = useAuth();
  const [assignedTasks, setAssignedTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [resolutionPhoto, setResolutionPhoto] = useState('https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=800&q=80');
  const [resolutionDesc, setResolutionDesc] = useState('');
  const [workerNotes, setWorkerNotes] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await complaintAPI.getAll({ limit: 50 });
      if (res.data.success) {
        // Filter tasks assigned to worker or show sample assigned tasks
        const tasks = res.data.data.filter(c => ['assigned', 'in_progress', 'verified'].includes(c.status));
        setAssignedTasks(tasks.length > 0 ? tasks : res.data.data.slice(0, 8));
        if (tasks.length > 0) setSelectedTask(tasks[0]);
        else if (res.data.data.length > 0) setSelectedTask(res.data.data[0]);
      }
    } catch (err) {
      console.warn('Failed to load worker tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (taskId, newStatus) => {
    try {
      await complaintAPI.updateStatus(taskId, { status: newStatus, comment: `Worker updated status to ${newStatus}` });
      fetchTasks();
    } catch (err) {
      alert(err.response?.data?.message || 'Status update failed');
    }
  };

  const handleResolveSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTask) return;

    try {
      await complaintAPI.resolve(selectedTask._id, {
        description: resolutionDesc || 'Field repair completed as requested.',
        photos: [resolutionPhoto],
        workerNotes: workerNotes || 'Tested and verified operational.'
      });
      alert(`Task ${selectedTask.complaintId} marked resolved. Evidence submitted for citizen verification.`);
      setResolutionDesc('');
      setWorkerNotes('');
      fetchTasks();
    } catch (err) {
      alert(err.response?.data?.message || 'Resolution submission failed');
    }
  };

  return (
    <div className="space-y-6 font-mono">
      <div className="border-b border-cyber-border pb-4">
        <h1 className="text-xl font-bold text-cyber-green glow-text-cyan">FIELD WORKER DISPATCH HUD</h1>
        <p className="text-xs text-cyber-muted">ENGINEER: <span className="text-cyber-text uppercase">{user?.name}</span> | DEPT FIELD CREW #04</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="ASSIGNED TASKS" value={assignedTasks.length} color="cyan" subtext="Pending Field Action" />
        <StatCard label="IN PROGRESS" value={assignedTasks.filter(c => c.status === 'in_progress').length} color="amber" subtext="Currently Active Work" />
        <StatCard label="RESOLVED TODAY" value={assignedTasks.filter(c => ['resolved', 'closed'].includes(c.status)).length} color="green" subtext="Submitted Evidence" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Assigned Task Queue */}
        <div className="space-y-3">
          <span className="text-xs font-bold text-cyber-green">ASSIGNED FIELD WORKLOAD</span>
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {assignedTasks.map(t => (
              <div
                key={t._id}
                onClick={() => setSelectedTask(t)}
                className={`p-4 rounded border text-xs cursor-pointer transition-all ${
                  selectedTask?._id === t._id
                    ? 'bg-cyber-green/10 border-cyber-green text-cyber-text shadow-cyan-glow'
                    : 'bg-cyber-card border-cyber-border text-cyber-muted hover:border-cyber-cyan'
                }`}
              >
                <div className="flex justify-between items-center text-[10px] mb-1">
                  <span className="font-bold text-cyber-cyan">{t.complaintId}</span>
                  <span className="uppercase font-bold text-cyber-magenta px-1 rounded bg-cyber-magenta/10">{t.priority}</span>
                </div>
                <h4 className="font-bold text-cyber-text line-clamp-1">{t.title}</h4>
                <p className="text-cyber-muted text-[11px] mt-1 line-clamp-1">{t.address}</p>

                <div className="flex justify-between items-center mt-2 pt-2 border-t border-cyber-border/40 text-[10px]">
                  <span>STATUS: <strong className="text-cyber-green uppercase">{t.status?.replace('_', ' ')}</strong></span>
                  <SlaCountdown deadline={t.slaDeadline} status={t.status} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Task Details & Resolution Upload Form */}
        <div className="lg:col-span-2 space-y-4">
          {selectedTask ? (
            <div className="bg-cyber-card border border-cyber-border rounded p-6 space-y-6 hud-corner-brackets shadow-hud">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-cyber-border pb-3 gap-2">
                <div>
                  <span className="text-xs text-cyber-muted">DISPATCH CASE FILE:</span>
                  <h3 className="text-lg font-bold text-cyber-cyan">{selectedTask.complaintId} // {selectedTask.title}</h3>
                </div>

                <div className="flex items-center space-x-2">
                  {selectedTask.status === 'assigned' && (
                    <button
                      onClick={() => handleUpdateStatus(selectedTask._id, 'in_progress')}
                      className="px-3 py-1.5 rounded bg-cyber-amber text-cyber-bg font-bold text-xs hover:bg-opacity-90"
                    >
                      START IN-PROGRESS
                    </button>
                  )}
                  <span className="text-xs uppercase font-bold text-cyber-green px-2 py-1 rounded bg-cyber-green/10 border border-cyber-green">
                    {selectedTask.status}
                  </span>
                </div>
              </div>

              {/* Task Details & Map */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-2">
                  <p><strong className="text-cyber-muted">CATEGORY:</strong> {selectedTask.category}</p>
                  <p><strong className="text-cyber-muted">SEVERITY:</strong> <span className="uppercase text-cyber-red font-bold">{selectedTask.severity}</span></p>
                  <p><strong className="text-cyber-muted">LOCATION:</strong> {selectedTask.address}</p>
                  <p><strong className="text-cyber-muted">DESCRIPTION:</strong> {selectedTask.description}</p>
                </div>

                <div>
                  <CyberMap complaints={[selectedTask]} center={[selectedTask.location?.coordinates[1] || 12.9716, selectedTask.location?.coordinates[0] || 77.5946]} zoom={14} height="160px" />
                </div>
              </div>

              {/* Resolution Form */}
              <form onSubmit={handleResolveSubmit} className="p-4 bg-cyber-bg border border-cyber-green/40 rounded space-y-4 text-xs">
                <div className="flex items-center space-x-2 text-cyber-green border-b border-cyber-border pb-2">
                  <Camera className="w-4 h-4" />
                  <span className="font-bold uppercase">SUBMIT RESOLUTION EVIDENCE</span>
                </div>

                <div>
                  <label className="block text-cyber-muted mb-1">AFTER-RESOLUTION PHOTOGRAPH URL</label>
                  <input
                    type="text"
                    required
                    value={resolutionPhoto}
                    onChange={(e) => setResolutionPhoto(e.target.value)}
                    className="w-full bg-cyber-surface border border-cyber-border rounded px-3 py-2 text-cyber-text"
                  />
                </div>

                <div>
                  <label className="block text-cyber-muted mb-1">COMPLETION WORK SUMMARY</label>
                  <textarea
                    rows={2}
                    required
                    value={resolutionDesc}
                    onChange={(e) => setResolutionDesc(e.target.value)}
                    placeholder="Describe field repairs performed, materials used, and quality check..."
                    className="w-full bg-cyber-surface border border-cyber-border rounded px-3 py-2 text-cyber-text"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-cyber-muted mb-1">FIELD NOTES (OPTIONAL)</label>
                  <input
                    type="text"
                    value={workerNotes}
                    onChange={(e) => setWorkerNotes(e.target.value)}
                    placeholder="Tested drainage flow / seal tightness..."
                    className="w-full bg-cyber-surface border border-cyber-border rounded px-3 py-2 text-cyber-text"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded bg-cyber-green text-cyber-bg font-bold hover:bg-opacity-90 transition-all flex items-center justify-center space-x-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>MARK RESOLVED & SUBMIT FOR CITIZEN VERIFICATION</span>
                </button>
              </form>
            </div>
          ) : (
            <div className="p-12 text-center text-cyber-muted bg-cyber-card border border-cyber-border rounded">
              Select a task from the left queue to view dispatch details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
