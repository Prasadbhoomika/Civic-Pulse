import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  FileText, 
  MapPin, 
  ThumbsUp, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  MessageSquare,
  ShieldCheck,
  Send,
  UserCheck
} from 'lucide-react';
import CyberMap from '../components/CyberMap';
import PriorityMeter from '../components/PriorityMeter';
import SlaCountdown from '../components/SlaCountdown';
import EvidenceViewer from '../components/EvidenceViewer';
import { complaintAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const STATUS_PIPELINE = [
  { id: 'submitted', label: 'SUBMITTED' },
  { id: 'under_review', label: 'UNDER REVIEW' },
  { id: 'verified', label: 'VERIFIED' },
  { id: 'assigned', label: 'ASSIGNED' },
  { id: 'in_progress', label: 'IN PROGRESS' },
  { id: 'resolved', label: 'RESOLVED' },
  { id: 'citizen_verification', label: 'CITIZEN VERIFICATION' },
  { id: 'closed', label: 'CLOSED' }
];

export default function ComplaintDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();

  const [complaint, setComplaint] = useState(null);
  const [history, setHistory] = useState([]);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const res = await complaintAPI.getById(id);
      if (res.data.success) {
        setComplaint(res.data.data);
        setHistory(res.data.history || []);
        setComments(res.data.comments || []);
      }
    } catch (err) {
      console.warn('Failed to load complaint detail');
    } finally {
      setLoading(false);
    }
  };

  const handleSupport = async () => {
    try {
      const res = await complaintAPI.support(id);
      if (res.data.success) {
        fetchDetails();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Support action failed');
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const res = await complaintAPI.addComment(id, { text: newComment });
      if (res.data.success) {
        setComments([res.data.data, ...comments]);
        setNewComment('');
      }
    } catch (err) {
      alert('Failed to post comment');
    }
  };

  const handleCitizenVerify = async (result) => {
    try {
      const res = await complaintAPI.verify(id, { result, reason: rejectReason });
      if (res.data.success) {
        alert(result === 'approved' ? 'Resolution verified and closed!' : 'Complaint reopened for further field action.');
        fetchDetails();
      }
    } catch (err) {
      alert('Verification action failed');
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-cyber-cyan font-mono animate-pulse">LOADING CASE FILE HUD...</div>;
  }

  if (!complaint) {
    return <div className="p-12 text-center text-cyber-red font-mono">CASE FILE NOT FOUND.</div>;
  }

  const currentStatusIndex = STATUS_PIPELINE.findIndex(s => s.id === complaint.status);

  return (
    <div className="space-y-6 font-mono pb-12">
      {/* Header Case File Banner */}
      <div className="bg-cyber-surface border border-cyber-border rounded-lg p-6 space-y-4 shadow-hud hud-corner-brackets">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-cyber-border pb-3 gap-2">
          <div>
            <span className="text-xs text-cyber-muted">CASE FILE ID:</span>
            <h1 className="text-2xl font-bold text-cyber-cyan glow-text-cyan">{complaint.complaintId} // {complaint.title}</h1>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleSupport}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-cyber-bg border border-cyber-cyan text-cyber-cyan text-xs hover:bg-cyber-cyan/10"
            >
              <ThumbsUp className="w-4 h-4 text-cyber-cyan" />
              <span>SUPPORT ({complaint.supportCount || 1})</span>
            </button>

            <span className="text-xs uppercase font-bold text-cyber-magenta px-3 py-1 rounded bg-cyber-magenta/10 border border-cyber-magenta/40">
              STATUS: {complaint.status?.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Status Transition Timeline */}
        <div className="pt-2">
          <span className="text-[11px] text-cyber-muted block mb-3 uppercase">LIFECYCLE STATUS PIPELINE:</span>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 text-center text-[10px]">
            {STATUS_PIPELINE.map((stage, idx) => {
              const isPast = currentStatusIndex > idx;
              const isCurrent = currentStatusIndex === idx;

              return (
                <div
                  key={stage.id}
                  className={`p-2 rounded border transition-all ${
                    isCurrent
                      ? 'bg-cyber-cyan/20 border-cyber-cyan text-cyber-cyan font-bold shadow-cyan-glow animate-pulse'
                      : isPast
                      ? 'bg-cyber-green/10 border-cyber-green/40 text-cyber-green'
                      : 'bg-cyber-bg border-cyber-border text-cyber-muted opacity-50'
                  }`}
                >
                  <span className="block text-[9px]">0{idx + 1}</span>
                  <span className="truncate block font-mono">{stage.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Grid: Overview & SLA/Priority */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Issue Summary Card */}
          <div className="bg-cyber-card border border-cyber-border rounded p-6 space-y-4 font-mono">
            <h3 className="text-sm font-bold text-cyber-cyan uppercase border-b border-cyber-border pb-2">INCIDENT DETAILS</h3>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-cyber-muted block">CATEGORY:</span>
                <span className="text-cyber-text font-bold">{complaint.category}</span>
              </div>
              <div>
                <span className="text-cyber-muted block">REPORTED SEVERITY:</span>
                <span className="text-cyber-red font-bold uppercase">{complaint.severity}</span>
              </div>
              <div>
                <span className="text-cyber-muted block">REPORTER:</span>
                <span className="text-cyber-text">{complaint.reporter?.name || 'Citizen User'}</span>
              </div>
              <div>
                <span className="text-cyber-muted block">ASSIGNED WORKER:</span>
                <span className="text-cyber-green font-bold">{complaint.assignedWorker?.name || 'Pending Worker'}</span>
              </div>
            </div>

            <div className="text-xs pt-2">
              <span className="text-cyber-muted block mb-1">DESCRIPTION:</span>
              <p className="text-cyber-text bg-cyber-bg p-3 rounded border border-cyber-border leading-relaxed">{complaint.description}</p>
            </div>

            {/* Evidence Photograph */}
            <div className="space-y-2">
              <span className="text-xs text-cyber-muted block">INITIAL REPORT PHOTOGRAPH:</span>
              <div className="max-w-md aspect-video rounded overflow-hidden border border-cyber-border bg-black">
                <img src={complaint.photos?.[0] || 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80'} alt="Report" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>

          {/* Evidence Inspector (If resolved/verification) */}
          {['resolved', 'citizen_verification', 'closed'].includes(complaint.status) && (
            <div className="space-y-4">
              <EvidenceViewer beforePhotos={complaint.photos} resolution={complaint.resolution} />

              {/* Citizen Verification Prompt */}
              {complaint.status === 'resolved' && (
                <div className="p-4 bg-cyber-magenta/10 border border-cyber-magenta rounded space-y-3 shadow-magenta-glow">
                  <div className="flex items-center space-x-2 text-cyber-magenta font-bold text-xs">
                    <ShieldCheck className="w-5 h-5" />
                    <span>CITIZEN RESOLUTION VERIFICATION</span>
                  </div>
                  <p className="text-xs text-cyber-text">
                    Has this civic issue been completed to your satisfaction?
                  </p>

                  {!showRejectForm ? (
                    <div className="flex space-x-3 text-xs">
                      <button
                        onClick={() => handleCitizenVerify('approved')}
                        className="px-4 py-2 rounded bg-cyber-green text-cyber-bg font-bold hover:bg-opacity-90 flex items-center space-x-1"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>YES, ISSUE RESOLVED (CLOSE CASE)</span>
                      </button>
                      <button
                        onClick={() => setShowRejectForm(true)}
                        className="px-4 py-2 rounded bg-cyber-red text-cyber-bg font-bold hover:bg-opacity-90 flex items-center space-x-1"
                      >
                        <AlertTriangle className="w-4 h-4" />
                        <span>NO, REOPEN ISSUE</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2 text-xs">
                      <textarea
                        rows={2}
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="State reason for rejecting resolution..."
                        className="w-full bg-cyber-bg border border-cyber-red rounded p-2 text-cyber-text"
                      ></textarea>
                      <button
                        onClick={() => handleCitizenVerify('rejected')}
                        className="px-4 py-2 rounded bg-cyber-red text-cyber-bg font-bold"
                      >
                        CONFIRM REOPEN COMPLAINT
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Comments Section */}
          <div className="bg-cyber-card border border-cyber-border rounded p-6 space-y-4">
            <h3 className="text-sm font-bold text-cyber-cyan uppercase border-b border-cyber-border pb-2 flex items-center space-x-2">
              <MessageSquare className="w-4 h-4 text-cyber-cyan" />
              <span>COMMUNITY COMMENTS & OFFICIAL DISPATCH NOTES ({comments.length})</span>
            </h3>

            <form onSubmit={handleAddComment} className="flex space-x-2 text-xs">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Post comment or update note..."
                className="flex-1 bg-cyber-bg border border-cyber-border rounded px-3 py-2 text-cyber-text"
              />
              <button type="submit" className="px-4 py-2 rounded bg-cyber-cyan text-cyber-bg font-bold flex items-center space-x-1">
                <Send className="w-3.5 h-3.5" />
                <span>POST</span>
              </button>
            </form>

            <div className="space-y-3 max-h-64 overflow-y-auto">
              {comments.map(c => (
                <div key={c._id} className="p-3 bg-cyber-bg border border-cyber-border/40 rounded text-xs space-y-1">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="font-bold text-cyber-cyan">{c.user?.name || 'User'} ({c.user?.role?.toUpperCase()})</span>
                    <span className="text-cyber-muted">{new Date(c.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="text-cyber-text">{c.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Side Panel: Priority & SLA & Map */}
        <div className="space-y-6">
          <SlaCountdown deadline={complaint.slaDeadline} status={complaint.status} />

          <PriorityMeter
            score={complaint.priorityScore}
            label={complaint.priority}
            breakdown={complaint.priorityBreakdown}
          />

          {/* Incident Location Map */}
          <div className="bg-cyber-card border border-cyber-border rounded p-4 space-y-2">
            <span className="text-xs font-bold text-cyber-cyan flex items-center space-x-1">
              <MapPin className="w-3.5 h-3.5 text-cyber-cyan" />
              <span>INCIDENT COORDINATES</span>
            </span>
            <p className="text-[11px] text-cyber-muted">{complaint.address}</p>
            <CyberMap
              complaints={[complaint]}
              center={[complaint.location?.coordinates[1] || 12.9716, complaint.location?.coordinates[0] || 77.5946]}
              zoom={14}
              height="200px"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
