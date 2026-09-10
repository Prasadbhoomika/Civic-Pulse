import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FilePlus, 
  MapPin, 
  Upload, 
  AlertTriangle, 
  CheckCircle, 
  Cpu, 
  ArrowRight, 
  ArrowLeft,
  Camera,
  Navigation
} from 'lucide-react';
import CyberMap from '../components/CyberMap';
import PriorityMeter from '../components/PriorityMeter';
import DuplicateWarningModal from '../components/DuplicateWarningModal';
import { complaintAPI } from '../services/api';

const categoriesList = [
  { id: 'Potholes & Roads', label: 'Potholes & Road Damage', desc: 'Asphalt cave-in, deep potholes, damaged street surface' },
  { id: 'Streetlights', label: 'Streetlights & Lighting', desc: 'Broken streetlights, dark zones, flickering lamps' },
  { id: 'Garbage & Sanitation', label: 'Garbage & Sanitation', desc: 'Commercial waste accumulation, uncleaned bins' },
  { id: 'Water Leakage', label: 'Water Leakage & Mains', desc: 'Burst water main, clean water gushing onto street' },
  { id: 'Drainage & Waterlogging', label: 'Drainage & Flooding', desc: 'Clogged storm drains, sewage overflow, waterlogging' },
  { id: 'Fallen Trees', label: 'Fallen Trees & Branches', desc: 'Uprooted trees blocking roads or public pathways' },
  { id: 'Traffic Signals', label: 'Traffic Signals & Signs', desc: 'Malfunctioning light signals, damaged signboards' },
  { id: 'Electrical Hazards', label: 'Electrical Hazards', desc: 'Exposed live wires, active sparking transformers' }
];

export default function ReportIssuePage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Potholes & Roads',
    severity: 'medium',
    latitude: 12.9716,
    longitude: 77.5946,
    address: 'MG Road Sector 4, Bangalore',
    photos: ['https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80'],
    additionalNotes: ''
  });

  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLocationSelect = (lat, lng) => {
    setFormData(prev => ({
      ...prev,
      latitude: lat,
      longitude: lng,
      address: `Selected GPS Point (${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E)`
    }));
  };

  const handleUseCurrentGPS = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          handleLocationSelect(pos.coords.latitude, pos.coords.longitude);
        },
        () => {
          alert('GPS location permission denied. Please click location on map.');
        }
      );
    }
  };

  const handleSimulateAiScan = () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      setAiAnalysis({
        status: 'COMPLETE',
        category: formData.category,
        categoryConfidence: '94.2%',
        severity: formData.severity,
        severityConfidence: '91.8%',
        summary: `AI Scan verified structural anomaly consistent with ${formData.category}. Recommended dispatch priority: ${formData.severity.toUpperCase()}.`
      });
    }, 1200);
  };

  const handleSubmit = async (overrideDuplicate = false) => {
    setLoading(true);
    try {
      const res = await complaintAPI.create(formData);
      if (res.data.success) {
        if (!overrideDuplicate && res.data.possibleDuplicates && res.data.possibleDuplicates.length > 0) {
          setDuplicateWarning(res.data.possibleDuplicates[0]);
          setLoading(false);
          return;
        }

        alert(`Complaint ${res.data.data.complaintId} submitted successfully!`);
        navigate(`/complaints/${res.data.data._id}`);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSupportExisting = async (existingId) => {
    try {
      await complaintAPI.support(existingId);
      alert(`Supported existing complaint! Support count incremented and priority index boosted.`);
      navigate(`/complaints/${existingId}`);
    } catch (err) {
      alert('Failed to support existing complaint');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-mono pb-12">
      {/* Header Banner */}
      <div className="border-b border-cyber-border pb-4">
        <h1 className="text-xl font-bold text-cyber-cyan glow-text-cyan">REPORT CIVIC INFRASTRUCTURE ISSUE</h1>
        <p className="text-xs text-cyber-muted">STEP [{step} / 4] // CIVICPULSE INTELLIGENCE DISPATCH FORM</p>
      </div>

      {/* Step Indicator */}
      <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono">
        {[
          { num: '01', title: 'IDENTIFY' },
          { num: '02', title: 'LOCATION' },
          { num: '03', title: 'EVIDENCE & AI' },
          { num: '04', title: 'CONFIRM' }
        ].map((s, idx) => (
          <div
            key={s.num}
            className={`p-2 rounded border transition-all ${
              step === idx + 1
                ? 'bg-cyber-cyan/10 border-cyber-cyan text-cyber-cyan shadow-cyan-glow font-bold'
                : step > idx + 1
                ? 'bg-cyber-green/10 border-cyber-green/40 text-cyber-green'
                : 'bg-cyber-surface border-cyber-border text-cyber-muted'
            }`}
          >
            <span>[{s.num}] {s.title}</span>
          </div>
        ))}
      </div>

      {/* STEP 1: IDENTIFY ISSUE */}
      {step === 1 && (
        <div className="bg-cyber-card border border-cyber-border rounded p-6 space-y-6 hud-corner-brackets shadow-hud">
          <h3 className="text-sm font-bold text-cyber-cyan uppercase">STEP 01: SELECT ISSUE CATEGORY</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {categoriesList.map(cat => (
              <div
                key={cat.id}
                onClick={() => setFormData({ ...formData, category: cat.id })}
                className={`p-3 rounded border cursor-pointer transition-all ${
                  formData.category === cat.id
                    ? 'bg-cyber-cyan/10 border-cyber-cyan text-cyber-cyan shadow-cyan-glow'
                    : 'bg-cyber-bg border-cyber-border text-cyber-muted hover:border-cyber-cyan/50'
                }`}
              >
                <span className="font-bold text-xs text-cyber-text block">{cat.label}</span>
                <span className="text-[10px] text-cyber-muted">{cat.desc}</span>
              </div>
            ))}
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-cyber-muted mb-1 uppercase">ISSUE TITLE</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Deep Asphalt Cave-in near Pedestrian Crossing"
                className="w-full bg-cyber-bg border border-cyber-border rounded px-3 py-2 text-cyber-text focus:outline-none focus:border-cyber-cyan"
              />
            </div>

            <div>
              <label className="block text-cyber-muted mb-1 uppercase">DETAILED DESCRIPTION</label>
              <textarea
                rows={3}
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe size, hazard severity, traffic impact, and details..."
                className="w-full bg-cyber-bg border border-cyber-border rounded px-3 py-2 text-cyber-text focus:outline-none focus:border-cyber-cyan"
              ></textarea>
            </div>

            <div>
              <label className="block text-cyber-muted mb-1 uppercase">REPORTED SEVERITY LEVEL</label>
              <div className="grid grid-cols-4 gap-2 text-center">
                {['low', 'medium', 'high', 'critical'].map(sev => (
                  <button
                    key={sev}
                    type="button"
                    onClick={() => setFormData({ ...formData, severity: sev })}
                    className={`py-2 rounded border uppercase font-bold text-xs ${
                      formData.severity === sev
                        ? sev === 'critical' ? 'bg-cyber-red/20 border-cyber-red text-cyber-red' : 'bg-cyber-cyan/20 border-cyber-cyan text-cyber-cyan'
                        : 'bg-cyber-bg border-cyber-border text-cyber-muted'
                    }`}
                  >
                    {sev}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => {
                if (!formData.title || !formData.description) return alert('Please fill in title and description');
                setStep(2);
              }}
              className="px-6 py-2.5 rounded bg-cyber-cyan text-cyber-bg font-bold text-xs hover:bg-opacity-90 flex items-center space-x-2"
            >
              <span>NEXT: SELECT LOCATION</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: LOCATION */}
      {step === 2 && (
        <div className="bg-cyber-card border border-cyber-border rounded p-6 space-y-6 hud-corner-brackets shadow-hud">
          <div className="flex justify-between items-center border-b border-cyber-border pb-3">
            <h3 className="text-sm font-bold text-cyber-cyan uppercase">STEP 02: GEOSPATIAL LOCATION</h3>
            <button
              onClick={handleUseCurrentGPS}
              className="px-3 py-1.5 rounded bg-cyber-bg border border-cyber-cyan text-cyber-cyan text-xs flex items-center space-x-1.5 hover:bg-cyber-cyan/10"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>USE GPS CURRENT LOCATION</span>
            </button>
          </div>

          <div className="space-y-3">
            <p className="text-xs text-cyber-muted">Click anywhere on the map to adjust the precise issue marker location:</p>
            <CyberMap
              center={[formData.latitude, formData.longitude]}
              zoom={13}
              pickerMode={true}
              onLocationSelect={handleLocationSelect}
              height="350px"
            />
          </div>

          <div>
            <label className="block text-xs text-cyber-muted mb-1 uppercase">ADDRESS / LANDMARK LOCATION</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full bg-cyber-bg border border-cyber-border rounded px-3 py-2 text-xs text-cyber-text"
            />
          </div>

          <div className="flex justify-between pt-2">
            <button
              onClick={() => setStep(1)}
              className="px-4 py-2 rounded bg-cyber-bg border border-cyber-border text-cyber-muted text-xs flex items-center space-x-1"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>BACK</span>
            </button>
            <button
              onClick={() => setStep(3)}
              className="px-6 py-2.5 rounded bg-cyber-cyan text-cyber-bg font-bold text-xs hover:bg-opacity-90 flex items-center space-x-2"
            >
              <span>NEXT: EVIDENCE & AI SCAN</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: EVIDENCE & AI */}
      {step === 3 && (
        <div className="bg-cyber-card border border-cyber-border rounded p-6 space-y-6 hud-corner-brackets shadow-hud">
          <h3 className="text-sm font-bold text-cyber-cyan uppercase">STEP 03: UPLOAD EVIDENCE & AI SCAN</h3>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-cyber-muted mb-1 uppercase">EVIDENCE IMAGE URL</label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={formData.photos[0] || ''}
                  onChange={(e) => setFormData({ ...formData, photos: [e.target.value] })}
                  className="flex-1 bg-cyber-bg border border-cyber-border rounded px-3 py-2 text-cyber-text"
                />
              </div>
            </div>

            {/* Dropzone preview */}
            <div className="border-2 border-dashed border-cyber-border rounded p-6 text-center bg-cyber-bg/50 space-y-2">
              <Camera className="w-8 h-8 text-cyber-cyan mx-auto animate-pulse" />
              <p className="text-xs text-cyber-text font-bold">EVIDENCE PHOTOGRAPH PREVIEW</p>
              <div className="max-w-xs mx-auto aspect-video rounded overflow-hidden border border-cyber-border mt-2">
                <img src={formData.photos[0]} alt="Evidence" className="w-full h-full object-cover" />
              </div>
            </div>

            {/* AI Scan button & Panel */}
            <div className="p-4 bg-cyber-bg border border-cyber-cyan/30 rounded space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-cyber-cyan flex items-center space-x-2">
                  <Cpu className="w-4 h-4 text-cyber-cyan" />
                  <span>AI VISION ANALYSIS SCANNER</span>
                </span>
                <button
                  type="button"
                  onClick={handleSimulateAiScan}
                  disabled={scanning}
                  className="px-3 py-1 rounded bg-cyber-cyan text-cyber-bg font-bold text-xs hover:bg-opacity-90"
                >
                  {scanning ? 'SCANNING EVIDENCE...' : 'RUN AI ANALYSIS SCAN'}
                </button>
              </div>

              {aiAnalysis && (
                <div className="p-3 bg-cyber-surface border border-cyber-cyan rounded space-y-1 text-xs text-cyber-text">
                  <p className="text-cyber-cyan font-bold">SCAN STATUS: {aiAnalysis.status}</p>
                  <p>PREDICTED CATEGORY: <strong className="text-cyber-green">{aiAnalysis.category}</strong> ({aiAnalysis.categoryConfidence})</p>
                  <p>PREDICTED SEVERITY: <strong className="text-cyber-amber uppercase">{aiAnalysis.severity}</strong></p>
                  <p className="text-cyber-muted text-[11px] italic mt-1">{aiAnalysis.summary}</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-between pt-2">
            <button
              onClick={() => setStep(2)}
              className="px-4 py-2 rounded bg-cyber-bg border border-cyber-border text-cyber-muted text-xs flex items-center space-x-1"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>BACK</span>
            </button>
            <button
              onClick={() => setStep(4)}
              className="px-6 py-2.5 rounded bg-cyber-cyan text-cyber-bg font-bold text-xs hover:bg-opacity-90 flex items-center space-x-2"
            >
              <span>NEXT: FINAL PREVIEW & CONFIRM</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: CONFIRMATION */}
      {step === 4 && (
        <div className="bg-cyber-card border border-cyber-border rounded p-6 space-y-6 hud-corner-brackets shadow-hud">
          <h3 className="text-sm font-bold text-cyber-cyan uppercase">STEP 04: FINAL CONFIRMATION & PRIORITY METER</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="space-y-3">
              <p><strong className="text-cyber-muted">TITLE:</strong> {formData.title}</p>
              <p><strong className="text-cyber-muted">CATEGORY:</strong> {formData.category}</p>
              <p><strong className="text-cyber-muted">SEVERITY:</strong> <span className="uppercase text-cyber-red font-bold">{formData.severity}</span></p>
              <p><strong className="text-cyber-muted">LOCATION:</strong> {formData.address}</p>
              <p><strong className="text-cyber-muted">DESCRIPTION:</strong> {formData.description}</p>
            </div>

            <div>
              <PriorityMeter score={74} label="High" />
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t border-cyber-border">
            <button
              onClick={() => setStep(3)}
              className="px-4 py-2 rounded bg-cyber-bg border border-cyber-border text-cyber-muted text-xs flex items-center space-x-1"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>BACK</span>
            </button>

            <button
              onClick={() => handleSubmit(false)}
              disabled={loading}
              className="px-8 py-3 rounded bg-cyber-cyan text-cyber-bg font-bold text-xs hover:bg-opacity-90 shadow-cyan-glow flex items-center space-x-2"
            >
              <CheckCircle className="w-4 h-4" />
              <span>{loading ? 'SUBMITTING TO GRID...' : 'SUBMIT CIVIC ISSUE REPORT'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Duplicate Detection Warning Modal */}
      {duplicateWarning && (
        <DuplicateWarningModal
          duplicate={duplicateWarning}
          onSupportExisting={handleSupportExisting}
          onSubmitNew={() => handleSubmit(true)}
          onClose={() => setDuplicateWarning(null)}
        />
      )}
    </div>
  );
}
