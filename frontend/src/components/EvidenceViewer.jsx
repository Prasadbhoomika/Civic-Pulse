import React, { useState } from 'react';
import { ShieldCheck, ArrowRight, Eye, Image as ImageIcon } from 'lucide-react';

export default function EvidenceViewer({ beforePhotos = [], resolution = {} }) {
  const [activeTab, setActiveTab] = useState('compare');

  const beforeUrl = beforePhotos[0] || 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80';
  const afterUrl = resolution.photos?.[0] || 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=800&q=80';

  return (
    <div className="bg-cyber-card border border-cyber-border rounded p-4 space-y-4 font-mono">
      <div className="flex items-center justify-between border-b border-cyber-border pb-2">
        <span className="text-xs font-bold text-cyber-cyan flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-cyber-green" />
          <span>EVIDENCE-BASED RESOLUTION INSPECTOR</span>
        </span>
        <div className="flex items-center space-x-1 bg-cyber-bg border border-cyber-border p-0.5 rounded text-[10px]">
          <button
            onClick={() => setActiveTab('compare')}
            className={`px-2 py-0.5 rounded ${activeTab === 'compare' ? 'bg-cyber-cyan text-cyber-bg font-bold' : 'text-cyber-muted'}`}
          >
            SIDE-BY-SIDE
          </button>
        </div>
      </div>

      {/* Side-by-side comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* BEFORE Photo */}
        <div className="space-y-2 border border-cyber-red/40 rounded p-2 bg-cyber-bg/50">
          <div className="flex justify-between items-center text-xs">
            <span className="text-cyber-red font-bold flex items-center">
              <span className="w-2 h-2 rounded-full bg-cyber-red mr-1.5"></span>
              BEFORE (ORIGINAL REPORT)
            </span>
          </div>
          <div className="aspect-video rounded overflow-hidden border border-cyber-border bg-black">
            <img src={beforeUrl} alt="Before issue" className="w-full h-full object-cover" />
          </div>
        </div>

        {/* AFTER Photo */}
        <div className="space-y-2 border border-cyber-green/40 rounded p-2 bg-cyber-bg/50">
          <div className="flex justify-between items-center text-xs">
            <span className="text-cyber-green font-bold flex items-center">
              <span className="w-2 h-2 rounded-full bg-cyber-green mr-1.5 animate-pulse"></span>
              AFTER (FIELD WORKER RESOLUTION)
            </span>
          </div>
          <div className="aspect-video rounded overflow-hidden border border-cyber-border bg-black">
            <img src={afterUrl} alt="After resolution" className="w-full h-full object-cover" />
          </div>
        </div>
      </div>

      {/* Resolution Notes */}
      {resolution.description && (
        <div className="p-3 bg-cyber-bg border border-cyber-border rounded text-xs space-y-1">
          <p className="text-cyber-muted uppercase text-[10px]">WORKER RESOLUTION STATEMENT:</p>
          <p className="text-cyber-text italic">"{resolution.description}"</p>
          {resolution.resolvedAt && (
            <p className="text-[10px] text-cyber-muted pt-1">
              TIMESTAMP: {new Date(resolution.resolvedAt).toLocaleString()}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
