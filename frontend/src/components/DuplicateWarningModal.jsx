import React from 'react';
import { AlertTriangle, ThumbsUp, FilePlus, X } from 'lucide-react';

export default function DuplicateWarningModal({ duplicate, onSupportExisting, onSubmitNew, onClose }) {
  if (!duplicate) return null;

  const { complaint, distanceMeters, confidencePercent, reason } = duplicate;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-cyber-surface border-2 border-cyber-amber rounded-lg max-w-lg w-full p-6 shadow-hud space-y-4 font-mono relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-cyber-muted hover:text-cyber-text">
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 text-cyber-amber border-b border-cyber-border pb-3">
          <div className="p-2 rounded bg-cyber-amber/10 border border-cyber-amber">
            <AlertTriangle className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-bold tracking-wider">POSSIBLE DUPLICATE ISSUE DETECTED</h3>
            <p className="text-xs text-cyber-muted">AI GEOSPATIAL & TEXT SIMILARITY MATCH ({confidencePercent}%)</p>
          </div>
        </div>

        {/* Reason Box */}
        <div className="p-3 bg-cyber-bg border border-cyber-amber/40 rounded text-xs text-cyber-text space-y-1">
          <p className="font-bold text-cyber-amber">⚡ MATCH WARNING:</p>
          <p>{reason}</p>
        </div>

        {/* Existing Complaint Card */}
        <div className="p-4 bg-cyber-card border border-cyber-border rounded space-y-2 text-xs">
          <div className="flex justify-between items-center text-cyber-muted">
            <span>CASE ID: <strong className="text-cyber-cyan">{complaint.complaintId}</strong></span>
            <span className="text-cyber-green">{distanceMeters}m AWAY</span>
          </div>

          <h4 className="text-sm font-bold text-cyber-text">{complaint.title}</h4>
          <p className="text-cyber-muted line-clamp-2">{complaint.description}</p>

          <div className="flex justify-between items-center pt-2 border-t border-cyber-border/40 text-[11px]">
            <span>CATEGORY: <strong className="text-cyber-text">{complaint.category}</strong></span>
            <span>CURRENT SUPPORTERS: <strong className="text-cyber-magenta">{complaint.supportCount || 1}</strong></span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <button
            onClick={() => onSupportExisting(complaint._id)}
            className="flex items-center justify-center space-x-2 py-2.5 px-4 rounded bg-cyber-cyan text-cyber-bg font-bold text-xs hover:bg-opacity-90 transition-all shadow-cyan-glow"
          >
            <ThumbsUp className="w-4 h-4" />
            <span>SUPPORT EXISTING ISSUE (+1)</span>
          </button>

          <button
            onClick={onSubmitNew}
            className="flex items-center justify-center space-x-2 py-2.5 px-4 rounded bg-cyber-bg border border-cyber-border text-cyber-muted text-xs hover:text-cyber-text hover:border-cyber-text transition-all"
          >
            <FilePlus className="w-4 h-4" />
            <span>SUBMIT NEW SEPARATE REPORT</span>
          </button>
        </div>
      </div>
    </div>
  );
}
