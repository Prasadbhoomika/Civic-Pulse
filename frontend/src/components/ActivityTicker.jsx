import React from 'react';
import { Activity, ShieldAlert, CheckCircle, Clock, Zap } from 'lucide-react';

export default function ActivityTicker() {
  const events = [
    { time: '10:42', text: 'New Critical Pothole & Cave-in reported in MG Road Sector 4', type: 'critical' },
    { time: '10:39', text: 'Complaint CP-2026-00104 assigned to Field Engineer Jack K.', type: 'assigned' },
    { time: '10:35', text: 'High Voltage Streetlight Pole #E-204 issue resolved by Power Grid team', type: 'resolved' },
    { time: '10:31', text: 'Citizen Verification received for Case CP-2026-00102 - Case Closed', type: 'closed' },
    { time: '10:27', text: 'SLA Warning triggered for Water Leakage on Koramangala 5th Block', type: 'warning' }
  ];

  return (
    <div className="bg-cyber-surface border border-cyber-border rounded p-4 font-mono space-y-3">
      <div className="flex items-center justify-between border-b border-cyber-border pb-2">
        <span className="text-xs font-bold text-cyber-cyan flex items-center space-x-2">
          <Activity className="w-4 h-4 text-cyber-cyan animate-pulse" />
          <span>LIVE CITY ACTIVITY FEED</span>
        </span>
        <span className="text-[10px] text-cyber-green bg-cyber-green/10 border border-cyber-green/30 px-1.5 py-0.5 rounded">
          REAL-TIME STREAM
        </span>
      </div>

      <div className="space-y-2">
        {events.map((ev, idx) => (
          <div key={idx} className="flex items-start space-x-3 text-xs p-2 rounded bg-cyber-bg/50 border border-cyber-border/40 hover:border-cyber-cyan/40 transition-colors">
            <span className="text-cyber-muted text-[10px] pt-0.5">{ev.time}</span>
            <div className="flex-1">
              <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                ev.type === 'critical' ? 'bg-cyber-red animate-ping' :
                ev.type === 'warning' ? 'bg-cyber-amber' :
                ev.type === 'resolved' ? 'bg-cyber-green' : 'bg-cyber-cyan'
              }`}></span>
              <span className="text-cyber-text">{ev.text}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
