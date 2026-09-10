import React from 'react';

export default function StatCard({ label, value, trend, icon: Icon, color = 'cyan', subtext = '' }) {
  const colorMap = {
    cyan: { border: 'border-cyber-cyan/30 hover:border-cyber-cyan', text: 'text-cyber-cyan', bg: 'bg-cyber-cyan/10', glow: 'shadow-cyan-glow' },
    magenta: { border: 'border-cyber-magenta/30 hover:border-cyber-magenta', text: 'text-cyber-magenta', bg: 'bg-cyber-magenta/10', glow: 'shadow-magenta-glow' },
    green: { border: 'border-cyber-green/30 hover:border-cyber-green', text: 'text-cyber-green', bg: 'bg-cyber-green/10', glow: '' },
    amber: { border: 'border-cyber-amber/30 hover:border-cyber-amber', text: 'text-cyber-amber', bg: 'bg-cyber-amber/10', glow: '' },
    red: { border: 'border-cyber-red/30 hover:border-cyber-red', text: 'text-cyber-red', bg: 'bg-cyber-red/10', glow: 'shadow-red-glow' }
  };

  const currentTheme = colorMap[color] || colorMap.cyan;

  return (
    <div className={`bg-cyber-card border ${currentTheme.border} rounded p-4 relative overflow-hidden transition-all duration-300 hud-corner-brackets shadow-hud hover:-translate-y-0.5`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-mono tracking-widest text-cyber-muted uppercase">{label}</span>
        {Icon && (
          <div className={`p-2 rounded ${currentTheme.bg}`}>
            <Icon className={`w-4 h-4 ${currentTheme.text}`} />
          </div>
        )}
      </div>

      <div className="flex items-baseline space-x-2">
        <span className={`text-2xl lg:text-3xl font-mono font-bold ${currentTheme.text}`}>{value}</span>
        {trend && (
          <span className="text-xs font-mono text-cyber-green">
            {trend}
          </span>
        )}
      </div>

      {subtext && (
        <div className="text-[10px] font-mono text-cyber-muted mt-2 pt-2 border-t border-cyber-border/40 flex justify-between items-center">
          <span>{subtext}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-cyber-cyan"></span>
        </div>
      )}
    </div>
  );
}
