import React from 'react';

export default function PriorityMeter({ score = 50, label = 'Medium', breakdown = {} }) {
  const getBadgeStyle = (lvl) => {
    switch (lvl?.toLowerCase()) {
      case 'critical':
        return 'text-cyber-red border-cyber-red bg-cyber-red/10 shadow-red-glow';
      case 'high':
        return 'text-cyber-amber border-cyber-amber bg-cyber-amber/10';
      case 'medium':
        return 'text-cyber-cyan border-cyber-cyan bg-cyber-cyan/10';
      default:
        return 'text-cyber-green border-cyber-green bg-cyber-green/10';
    }
  };

  const defaultBreakdown = {
    severityWeight: breakdown.severityWeight ?? 25,
    categoryUrgency: breakdown.categoryUrgency ?? 20,
    supportBonus: breakdown.supportBonus ?? 15,
    timePending: breakdown.timePending ?? 12,
    locationRisk: breakdown.locationRisk ?? 8
  };

  return (
    <div className="bg-cyber-card border border-cyber-border rounded p-4 space-y-3 font-mono">
      <div className="flex items-center justify-between">
        <span className="text-xs text-cyber-muted uppercase tracking-wider">PRIORITY INDEX</span>
        <span className={`text-xs uppercase font-bold px-2 py-0.5 rounded border ${getBadgeStyle(label)}`}>
          {label}
        </span>
      </div>

      {/* Numerical score indicator */}
      <div className="flex items-baseline justify-between">
        <div className="text-3xl font-bold text-cyber-cyan glow-text-cyan">
          {score} <span className="text-sm font-normal text-cyber-muted">/ 100</span>
        </div>
      </div>

      {/* Cyberpunk Progress Bar */}
      <div className="w-full bg-cyber-bg h-3 rounded border border-cyber-border overflow-hidden p-0.5 flex">
        <div
          className={`h-full rounded transition-all duration-500 ${
            score >= 81 ? 'bg-cyber-red shadow-red-glow' :
            score >= 61 ? 'bg-cyber-amber' :
            score >= 31 ? 'bg-cyber-cyan' : 'bg-cyber-green'
          }`}
          style={{ width: `${Math.min(100, Math.max(5, score))}%` }}
        ></div>
      </div>

      {/* Breakdown Items */}
      <div className="pt-2 border-t border-cyber-border/40 text-[11px] space-y-1.5 text-cyber-muted">
        <div className="flex justify-between">
          <span>+ Reported Severity</span>
          <span className="text-cyber-text font-bold">+{defaultBreakdown.severityWeight}</span>
        </div>
        <div className="flex justify-between">
          <span>+ Category Urgency</span>
          <span className="text-cyber-text font-bold">+{defaultBreakdown.categoryUrgency}</span>
        </div>
        <div className="flex justify-between">
          <span>+ Citizen Support Bonus</span>
          <span className="text-cyber-text font-bold">+{defaultBreakdown.supportBonus}</span>
        </div>
        <div className="flex justify-between">
          <span>+ Pending Time Factor</span>
          <span className="text-cyber-text font-bold">+{defaultBreakdown.timePending}</span>
        </div>
        <div className="flex justify-between">
          <span>+ Location Risk Assessment</span>
          <span className="text-cyber-text font-bold">+{defaultBreakdown.locationRisk}</span>
        </div>
      </div>
    </div>
  );
}
