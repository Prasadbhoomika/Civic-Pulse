import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function SlaCountdown({ deadline, status = 'submitted' }) {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0, totalSeconds: 0 });
  const [slaState, setSlaState] = useState('within_sla');

  useEffect(() => {
    const calculateTime = () => {
      if (['resolved', 'closed', 'rejected'].includes(status)) {
        setSlaState('completed');
        return;
      }

      const now = new Date();
      const target = new Date(deadline);
      const diffMs = target - now;

      if (diffMs <= 0) {
        setSlaState('breached');
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0, totalSeconds: 0 });
        return;
      }

      const totalSeconds = Math.floor(diffMs / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      if (hours < 6) {
        setSlaState('due_soon');
      } else {
        setSlaState('within_sla');
      }

      setTimeLeft({ hours, minutes, seconds, totalSeconds });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [deadline, status]);

  if (slaState === 'completed') {
    return (
      <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded bg-cyber-green/10 border border-cyber-green text-cyber-green font-mono text-xs">
        <CheckCircle2 className="w-4 h-4" />
        <span>SLA COMPLETED</span>
      </div>
    );
  }

  if (slaState === 'breached') {
    return (
      <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded bg-cyber-red/10 border border-cyber-red text-cyber-red font-mono text-xs shadow-red-glow">
        <ShieldAlert className="w-4 h-4 animate-bounce" />
        <span>🔴 SLA BREACHED (00:00:00)</span>
      </div>
    );
  }

  const isDueSoon = slaState === 'due_soon';

  return (
    <div className={`p-3 rounded border font-mono ${isDueSoon ? 'bg-cyber-amber/10 border-cyber-amber text-cyber-amber' : 'bg-cyber-cyan/10 border-cyber-cyan text-cyber-cyan'}`}>
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="flex items-center space-x-1.5 font-bold uppercase">
          <Clock className="w-3.5 h-3.5" />
          <span>SLA DEADLINE COUNTDOWN</span>
        </span>
        <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-cyber-bg border border-current">
          {isDueSoon ? '🟡 DUE SOON' : '🟢 WITHIN SLA'}
        </span>
      </div>

      <div className="flex items-center space-x-2 font-mono text-lg font-bold text-center mt-1">
        <div className="bg-cyber-bg px-2 py-1 rounded border border-current">
          {String(timeLeft.hours).padStart(2, '0')}
          <span className="text-[9px] block text-cyber-muted font-normal">HRS</span>
        </div>
        <span>:</span>
        <div className="bg-cyber-bg px-2 py-1 rounded border border-current">
          {String(timeLeft.minutes).padStart(2, '0')}
          <span className="text-[9px] block text-cyber-muted font-normal">MIN</span>
        </div>
        <span>:</span>
        <div className="bg-cyber-bg px-2 py-1 rounded border border-current">
          {String(timeLeft.seconds).padStart(2, '0')}
          <span className="text-[9px] block text-cyber-muted font-normal">SEC</span>
        </div>
      </div>
    </div>
  );
}
