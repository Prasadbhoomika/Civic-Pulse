import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, Circle } from 'react-leaflet';
import L from 'leaflet';
import { Link } from 'react-router-dom';
import { ShieldAlert, MapPin, ExternalLink, Navigation } from 'lucide-react';

// Custom SVG Neon Pin Markers
const createNeonIcon = (priority = 'Medium') => {
  let color = '#00E5FF'; // Cyan default
  if (priority === 'Critical') color = '#FF3B5C';
  else if (priority === 'High') color = '#FFB020';
  else if (priority === 'Low') color = '#7CFF4F';

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="${color}" stroke="#05070D" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
    <circle cx="12" cy="10" r="3" fill="#05070D"/>
  </svg>`;

  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `<div style="filter: drop-shadow(0 0 8px ${color}); cursor: pointer;">${svg}</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });
};

function LocationPickerMarker({ onLocationSelect }) {
  const [position, setPosition] = useState(null);

  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      if (onLocationSelect) {
        onLocationSelect(e.latlng.lat, e.latlng.lng);
      }
    }
  });

  return position === null ? null : (
    <Marker position={position} icon={createNeonIcon('Critical')}>
      <Popup>
        <div className="text-xs font-mono">
          <p className="font-bold text-cyber-cyan">SELECTED LOCATION</p>
          <p>LAT: {position.lat.toFixed(4)}</p>
          <p>LNG: {position.lng.toFixed(4)}</p>
        </div>
      </Popup>
    </Marker>
  );
}

export default function CyberMap({
  complaints = [],
  center = [12.9716, 77.5946], // Bangalore center
  zoom = 12,
  pickerMode = false,
  onLocationSelect = null,
  height = '450px'
}) {
  return (
    <div className="relative rounded overflow-hidden border border-cyber-border shadow-hud" style={{ height }}>
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        {/* Dark Matter Futuristic Map Tiles */}
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {pickerMode && <LocationPickerMarker onLocationSelect={onLocationSelect} />}

        {!pickerMode && complaints.map((c) => {
          const coords = c.location?.coordinates || [77.5946, 12.9716];
          const lat = coords[1];
          const lng = coords[0];

          if (!lat || !lng) return null;

          return (
            <Marker
              key={c._id || c.complaintId}
              position={[lat, lng]}
              icon={createNeonIcon(c.priority)}
            >
              <Popup>
                <div className="w-56 p-1 font-mono text-xs space-y-2">
                  <div className="flex justify-between items-center border-b border-cyber-border pb-1">
                    <span className="font-bold text-cyber-cyan">{c.complaintId || 'CASE FILE'}</span>
                    <span className="text-[10px] uppercase font-bold text-cyber-magenta px-1 rounded bg-cyber-magenta/10">
                      {c.priority}
                    </span>
                  </div>

                  <p className="font-bold text-cyber-text line-clamp-1">{c.title}</p>

                  <div className="text-[10px] text-cyber-muted space-y-0.5">
                    <p>CAT: <span className="text-cyber-text">{c.category}</span></p>
                    <p>STATUS: <span className="text-cyber-cyan uppercase">{c.status?.replace('_', ' ')}</span></p>
                    <p>PRIORITY SCORE: <span className="text-cyber-green">{c.priorityScore || 50}/100</span></p>
                  </div>

                  <Link
                    to={`/complaints/${c._id}`}
                    className="mt-2 w-full flex items-center justify-center space-x-1 py-1 rounded bg-cyber-cyan text-cyber-bg font-bold text-[11px] hover:bg-opacity-90 transition-colors"
                  >
                    <span>VIEW CASE FILE</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Cyberpunk Map overlay label */}
      <div className="absolute bottom-2 left-2 z-[400] bg-cyber-bg/90 border border-cyber-border px-2.5 py-1 rounded text-[10px] font-mono text-cyber-cyan flex items-center space-x-2">
        <Navigation className="w-3 h-3 text-cyber-cyan animate-spin" />
        <span>CYBER MAP // CARTOGRAPHIC HUD GRID</span>
      </div>
    </div>
  );
}
