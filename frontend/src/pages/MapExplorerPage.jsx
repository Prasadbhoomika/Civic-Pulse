import React, { useEffect, useState } from 'react';
import { Filter, MapPin, Layers, Radio } from 'lucide-react';
import CyberMap from '../components/CyberMap';
import { complaintAPI } from '../services/api';

export default function MapExplorerPage() {
  const [complaints, setComplaints] = useState([]);
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMapComplaints();
  }, [category, priority, status]);

  const fetchMapComplaints = async () => {
    try {
      setLoading(true);
      const params = {};
      if (category) params.category = category;
      if (priority) params.priority = priority;
      if (status) params.status = status;

      const res = await complaintAPI.getAll(params);
      if (res.data.success) {
        setComplaints(res.data.data);
      }
    } catch (err) {
      console.warn('Failed to load map data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 font-mono pb-12">
      <div className="border-b border-cyber-border pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-cyber-cyan glow-text-cyan">GEOSPATIAL CITY INCIDENT EXPLORER</h1>
          <p className="text-xs text-cyber-muted">LIVE CARTOGRAPHIC MATRIX // SMART CITY INFRASTRUCTURE</p>
        </div>

        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded bg-cyber-cyan/10 border border-cyber-cyan text-cyber-cyan text-xs">
          <Radio className="w-3.5 h-3.5 animate-pulse" />
          <span>{complaints.length} INCIDENTS LOADED ON GRID</span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-cyber-card border border-cyber-border rounded p-4 flex flex-wrap items-center gap-4 text-xs">
        <Filter className="w-4 h-4 text-cyber-cyan" />
        <span className="font-bold text-cyber-cyan uppercase">FILTER MAP PINS:</span>

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="bg-cyber-bg border border-cyber-border rounded px-3 py-1.5 text-cyber-text"
        >
          <option value="">ALL CATEGORIES</option>
          <option value="Potholes & Roads">Potholes & Roads</option>
          <option value="Streetlights">Streetlights</option>
          <option value="Garbage & Sanitation">Garbage & Sanitation</option>
          <option value="Water Leakage">Water Leakage</option>
          <option value="Drainage & Waterlogging">Drainage & Waterlogging</option>
          <option value="Electrical Hazards">Electrical Hazards</option>
        </select>

        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="bg-cyber-bg border border-cyber-border rounded px-3 py-1.5 text-cyber-text"
        >
          <option value="">ALL PRIORITIES</option>
          <option value="Critical">Critical</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="bg-cyber-bg border border-cyber-border rounded px-3 py-1.5 text-cyber-text"
        >
          <option value="">ALL STATUSES</option>
          <option value="submitted">Submitted</option>
          <option value="assigned">Assigned</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      {/* Full-width Map */}
      <CyberMap complaints={complaints} height="550px" />
    </div>
  );
}
