import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Activity, 
  ShieldAlert, 
  MapPin, 
  Zap, 
  CheckCircle, 
  Radio, 
  FilePlus, 
  Map, 
  ArrowRight,
  ShieldCheck,
  Cpu,
  BarChart3
} from 'lucide-react';
import CyberMap from '../components/CyberMap';
import ActivityTicker from '../components/ActivityTicker';
import { complaintAPI } from '../services/api';

export default function LandingPage() {
  const [complaints, setComplaints] = useState([]);

  useEffect(() => {
    fetchSampleComplaints();
  }, []);

  const fetchSampleComplaints = async () => {
    try {
      const res = await complaintAPI.getAll({ limit: 12 });
      if (res.data.success) {
        setComplaints(res.data.data);
      }
    } catch (err) {
      console.warn('Failed to load landing page complaints');
    }
  };

  return (
    <div className="space-y-12 pb-12">
      {/* Cinematic Cyber Hero Section */}
      <section className="relative pt-12 pb-16 px-4 sm:px-6 lg:px-8 border-b border-cyber-border bg-cyber-surface/60 overflow-hidden hud-corner-brackets shadow-hud">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded bg-cyber-cyan/10 border border-cyber-cyan text-cyber-cyan text-xs font-mono">
              <Radio className="w-3.5 h-3.5 animate-pulse text-cyber-cyan" />
              <span>SMART CITY INFRASTRUCTURE MATRIX v2045</span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-mono font-bold tracking-tight text-cyber-text leading-tight">
              SEE THE PROBLEM. <br />
              <span className="text-cyber-cyan glow-text-cyan">TRACK THE RESPONSE.</span> <br />
              IMPROVE THE CITY.
            </h1>

            <p className="text-base font-mono text-cyber-muted max-w-xl">
              CivicPulse is an intelligent, full-stack civic technology infrastructure platform equipped with real-time geospatial duplicate detection, automated priority scoring, evidence-based resolution, and SLA tracking.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                to="/report"
                className="px-6 py-3 rounded bg-cyber-cyan text-cyber-bg font-mono font-bold text-sm hover:bg-opacity-90 transition-all shadow-cyan-glow flex items-center space-x-2"
              >
                <FilePlus className="w-4 h-4" />
                <span>REPORT AN ISSUE</span>
              </Link>
              <Link
                to="/map"
                className="px-6 py-3 rounded bg-cyber-bg border border-cyber-border text-cyber-cyan font-mono text-sm hover:border-cyber-cyan transition-all flex items-center space-x-2"
              >
                <Map className="w-4 h-4" />
                <span>EXPLORE CITY MAP</span>
              </Link>
            </div>
          </div>

          {/* Hero City Status Panel */}
          <div className="bg-cyber-card border border-cyber-border rounded-lg p-6 space-y-4 shadow-hud relative">
            <div className="flex justify-between items-center border-b border-cyber-border pb-3">
              <span className="text-xs font-mono font-bold text-cyber-cyan">CITY INFRASTRUCTURE MATRIX</span>
              <span className="text-[10px] font-mono text-cyber-green flex items-center">
                <span className="w-2 h-2 rounded-full bg-cyber-green mr-1.5 animate-ping"></span>
                ACTIVE MONITORING
              </span>
            </div>

            <div className="grid grid-cols-3 gap-4 font-mono text-center py-2">
              <div className="p-3 bg-cyber-bg rounded border border-cyber-border">
                <span className="text-2xl font-bold text-cyber-cyan">1,284</span>
                <span className="block text-[10px] text-cyber-muted mt-1">TOTAL REPORTS</span>
              </div>
              <div className="p-3 bg-cyber-bg rounded border border-cyber-border">
                <span className="text-2xl font-bold text-cyber-amber">347</span>
                <span className="block text-[10px] text-cyber-muted mt-1">ACTIVE ISSUES</span>
              </div>
              <div className="p-3 bg-cyber-bg rounded border border-cyber-border">
                <span className="text-2xl font-bold text-cyber-red">89</span>
                <span className="block text-[10px] text-cyber-muted mt-1">CRITICAL SLA</span>
              </div>
            </div>

            <div className="space-y-1 font-mono text-xs">
              <div className="flex justify-between text-cyber-muted">
                <span>SYSTEM HEALTH INDEX</span>
                <span className="text-cyber-green font-bold">96.4%</span>
              </div>
              <div className="w-full bg-cyber-bg h-2 rounded border border-cyber-border overflow-hidden">
                <div className="bg-cyber-green h-full w-[96%] rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Capabilities Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2 font-mono">
          <h2 className="text-2xl font-bold text-cyber-cyan glow-text-cyan">INTELLIGENT CIVIC CAPABILITIES</h2>
          <p className="text-xs text-cyber-muted max-w-xl mx-auto">
            Role-based workflows, evidence-backed verification, and automated SLA tracking for transparent governance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-cyber-card border border-cyber-border rounded p-6 space-y-3 font-mono hud-corner-brackets shadow-hud">
            <div className="p-3 rounded bg-cyber-cyan/10 border border-cyber-cyan w-fit">
              <Cpu className="w-6 h-6 text-cyber-cyan" />
            </div>
            <h3 className="text-base font-bold text-cyber-text">AI DUPLICATE DETECTION</h3>
            <p className="text-xs text-cyber-muted leading-relaxed">
              Geospatial coordinates & text similarity engine scans nearby reports to prevent duplicate clutter and merge citizen support.
            </p>
          </div>

          <div className="bg-cyber-card border border-cyber-border rounded p-6 space-y-3 font-mono hud-corner-brackets shadow-hud">
            <div className="p-3 rounded bg-cyber-magenta/10 border border-cyber-magenta w-fit">
              <BarChart3 className="w-6 h-6 text-cyber-magenta" />
            </div>
            <h3 className="text-base font-bold text-cyber-text">INTELLIGENT PRIORITY INDEX</h3>
            <p className="text-xs text-cyber-muted leading-relaxed">
              Score (0-100) calculated dynamically based on severity, citizen supporters, pending age, and location risk metrics.
            </p>
          </div>

          <div className="bg-cyber-card border border-cyber-border rounded p-6 space-y-3 font-mono hud-corner-brackets shadow-hud">
            <div className="p-3 rounded bg-cyber-green/10 border border-cyber-green w-fit">
              <ShieldCheck className="w-6 h-6 text-cyber-green" />
            </div>
            <h3 className="text-base font-bold text-cyber-text">EVIDENCE RESOLUTION</h3>
            <p className="text-xs text-cyber-muted leading-relaxed">
              Field workers upload resolution photo evidence. Citizens verify before-and-after photos or reopen incomplete tasks.
            </p>
          </div>
        </div>
      </section>

      {/* Interactive Map & Activity Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-3 font-mono">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-cyber-cyan flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-cyber-cyan" />
              <span>LIVE CITY INCIDENT MAP</span>
            </h3>
            <Link to="/map" className="text-xs text-cyber-muted hover:text-cyber-cyan flex items-center">
              FULL MAP <ArrowRight className="w-3 h-3 ml-1" />
            </Link>
          </div>
          <CyberMap complaints={complaints} height="400px" />
        </div>

        <div className="space-y-4">
          <ActivityTicker />
        </div>
      </section>
    </div>
  );
}
