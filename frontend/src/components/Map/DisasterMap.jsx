import React, { useEffect, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, GeoJSON, Circle, Polyline, LayersControl, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../../services/api';

// Fix Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png', iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png', shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png' });

const SEVERITY_COLORS = { low: '#22c55e', medium: '#f59e0b', high: '#ef4444', critical: '#7c3aed' };
const TYPE_EMOJIS = { flood: '🌊', earthquake: '🏚', wildfire: '🔥', gas_leak: '☣', tsunami: '🌊', landslide: '⛰' };
const SENSOR_COLORS = { normal: '#22c55e', warning: '#f59e0b', critical: '#ef4444' };

function createAlertIcon(severity, type) {
  const color = SEVERITY_COLORS[severity] || '#ef4444';
  const emoji = TYPE_EMOJIS[type] || '⚠';
  return L.divIcon({
    className: '',
    html: `<div style="background:${color};width:32px;height:32px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:2px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;">
      <span style="transform:rotate(45deg);font-size:14px;">${emoji}</span>
    </div>`,
    iconSize: [32, 32], iconAnchor: [16, 32],
  });
}

function createSensorIcon(status) {
  const color = SENSOR_COLORS[status] || '#22c55e';
  return L.divIcon({
    className: '',
    html: `<div style="background:${color};width:12px;height:12px;border-radius:50%;border:2px solid rgba(255,255,255,0.8);box-shadow:0 0 8px ${color};"></div>`,
    iconSize: [12, 12], iconAnchor: [6, 6],
  });
}

function createResourceIcon(type) {
  const icons = { rescue_team: '🧑‍🚒', ambulance: '🚑', drone: '🚁', helicopter: '🚁', relief_supply: '📦' };
  return L.divIcon({
    className: '',
    html: `<div style="background:#1d4ed8;width:28px;height:28px;border-radius:8px;border:2px solid rgba(255,255,255,0.6);display:flex;align-items:center;justify-content:center;font-size:14px;box-shadow:0 2px 6px rgba(0,0,0,0.4);">${icons[type] || '📍'}</div>`,
    iconSize: [28, 28], iconAnchor: [14, 14],
  });
}

const RISK_ZONE_STYLES = {
  low: { color: '#22c55e', fillColor: '#22c55e', fillOpacity: 0.15, weight: 2 },
  medium: { color: '#f59e0b', fillColor: '#f59e0b', fillOpacity: 0.2, weight: 2 },
  high: { color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.25, weight: 2, dashArray: '4' },
  critical: { color: '#7c3aed', fillColor: '#7c3aed', fillOpacity: 0.3, weight: 3, dashArray: '4' },
};

export default function DisasterMap({ filters = {}, selectedAlert, onAlertClick }) {
  const [alerts, setAlerts] = useState([]);
  const [sensors, setSensors] = useState([]);
  const [resources, setResources] = useState([]);
  const [riskZones, setRiskZones] = useState(null);
  const [routes, setRoutes] = useState([]);
  const [showSensors, setShowSensors] = useState(true);
  const [showResources, setShowResources] = useState(true);
  const [showRiskZones, setShowRiskZones] = useState(true);

  const fetchData = useCallback(async () => {
    const [a, s, r, z] = await Promise.all([
      api.get('/alerts').catch(() => ({ data: [] })),
      api.get('/sensors').catch(() => ({ data: [] })),
      api.get('/resources').catch(() => ({ data: [] })),
      api.get('/risk/zones').catch(() => ({ data: null })),
    ]);
    setAlerts(a.data); setSensors(s.data); setResources(r.data); setRiskZones(z.data);
  }, []);

  useEffect(() => { fetchData(); const i = setInterval(fetchData, 10000); return () => clearInterval(i); }, [fetchData]);

  // Apply filters
  const filteredAlerts = alerts.filter(a => {
    if (filters.type && filters.type !== 'all' && a.type !== filters.type) return false;
    if (filters.severity && filters.severity !== 'all' && a.severity !== filters.severity) return false;
    if (filters.status && filters.status !== 'all' && a.status !== filters.status) return false;
    return true;
  });

  return (
    <div className="h-full relative rounded-xl overflow-hidden border border-gray-800">
      {/* Layer toggles */}
      <div className="absolute top-2 left-2 lg:top-3 lg:left-3 z-[1000] flex flex-col gap-1">
        {[
          { label: 'Risk Zones', state: showRiskZones, set: setShowRiskZones, color: 'bg-red-600' },
          { label: 'Sensors', state: showSensors, set: setShowSensors, color: 'bg-yellow-600' },
          { label: 'Resources', state: showResources, set: setShowResources, color: 'bg-blue-600' },
        ].map(({ label, state, set, color }) => (
          <button key={label} onClick={() => set(s => !s)} className={`flex items-center gap-1 text-[10px] lg:text-xs px-2 py-1 lg:px-3 lg:py-1.5 rounded-full border transition-all ${state ? `${color} border-transparent text-white` : 'bg-gray-900/80 border-gray-700 text-gray-400'}`}>
            <div className="w-1 h-1 lg:w-1.5 lg:h-1.5 rounded-full bg-white/70"></div>{label}
          </button>
        ))}
      </div>

      {/* Legend */}
      <div className="absolute bottom-2 right-2 lg:bottom-8 lg:right-3 z-[1000] bg-gray-900/90 border border-gray-700 rounded-lg lg:rounded-xl px-2 py-1.5 lg:p-3 text-[10px] lg:text-xs space-y-1">
        <div className="font-semibold text-gray-300 mb-2">Severity</div>
        {Object.entries(SEVERITY_COLORS).map(([sev, col]) => (
          <div key={sev} className="flex items-center gap-2">
            <div style={{ background: col }} className="w-3 h-3 rounded-full"></div>
            <span className="text-gray-400 capitalize">{sev}</span>
          </div>
        ))}
      </div>

      <MapContainer center={[20.5937, 78.9629]} zoom={5} zoomControl={false} style={{ height: '100%', width: '100%' }}>
        <ZoomControl position="bottomleft" />
        <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" attribution='&copy; <a href="https://carto.com/">CARTO</a>' maxZoom={19} />

        {/* Risk zones */}
        {showRiskZones && riskZones && (
          <GeoJSON
            key={JSON.stringify(riskZones)}
            data={riskZones}
            style={feature => RISK_ZONE_STYLES[feature.properties.risk] || RISK_ZONE_STYLES.medium}
            onEachFeature={(feature, layer) => {
              layer.bindPopup(`<div style="color:#111"><b>${feature.properties.name}</b><br/>Risk: <b style="color:${SEVERITY_COLORS[feature.properties.risk]}">${feature.properties.risk.toUpperCase()}</b><br/>Type: ${feature.properties.type}<br/>Score: ${feature.properties.riskScore}</div>`);
            }}
          />
        )}

        {/* Alert markers */}
        {filteredAlerts.map(alert => (
          <Marker
            key={alert.id}
            position={[alert.location.lat, alert.location.lng]}
            icon={createAlertIcon(alert.severity, alert.type)}
            eventHandlers={{ click: () => onAlertClick?.(alert) }}
          >
            <Popup>
              <div style={{ color: '#111', minWidth: '180px' }}>
                <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }}>{TYPE_EMOJIS[alert.type]} {alert.type.toUpperCase()}</div>
                <div><b>Location:</b> {alert.location.address}</div>
                <div><b>Severity:</b> <span style={{ color: SEVERITY_COLORS[alert.severity] }}>{alert.severity.toUpperCase()}</span></div>
                <div><b>Status:</b> {alert.status}</div>
                <div><b>Risk Score:</b> {alert.riskScore}</div>
                <div style={{ marginTop: '6px', fontSize: '12px', color: '#666' }}>{alert.description}</div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Sensor markers */}
        {showSensors && sensors.map(sensor => (
          <Marker key={sensor.id} position={[sensor.location.lat, sensor.location.lng]} icon={createSensorIcon(sensor.status)}>
            <Popup>
              <div style={{ color: '#111', fontSize: '13px' }}>
                <b>{sensor.sensorId}</b> ({sensor.type})<br />
                Value: {sensor.value} {sensor.unit}<br />
                Status: <b style={{ color: SENSOR_COLORS[sensor.status] }}>{sensor.status.toUpperCase()}</b><br />
                Region: {sensor.region}
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Resource markers */}
        {showResources && resources.map(res => (
          <Marker key={res.id} position={[res.location.lat, res.location.lng]} icon={createResourceIcon(res.type)}>
            <Popup>
              <div style={{ color: '#111', fontSize: '13px' }}>
                <b>{res.name}</b><br />
                Type: {res.type}<br />
                Status: <b>{res.status}</b><br />
                Capacity: {res.currentLoad}/{res.capacity}
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Routes */}
        {routes.map((route, i) => (
          <Polyline key={i} positions={route.waypoints.map(w => [w.lat, w.lng])} pathOptions={{ color: '#3b82f6', weight: 3, dashArray: '8 4', opacity: 0.8 }} />
        ))}
      </MapContainer>
    </div>
  );
}
