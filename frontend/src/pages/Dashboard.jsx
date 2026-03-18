import React, { useState, useEffect, useCallback } from 'react';
import { useWebSocket } from '../contexts/WebSocketContext';
import api from '../services/api';
import DisasterMap from '../components/Map/DisasterMap';
import SensorPanel from '../components/Sensors/SensorPanel';
import RiskGauge from '../components/Charts/RiskGauge';
import AlertsBarChart from '../components/Charts/AlertsBarChart';

const SEVERITY_COLORS = { low: 'text-green-400', medium: 'text-yellow-400', high: 'text-red-400', critical: 'text-purple-400' };
const STATUS_BADGES = {
  pending: 'bg-gray-800 text-gray-400', verified: 'bg-blue-900/60 text-blue-300',
  active: 'bg-red-900/60 text-red-300', resolved: 'bg-green-900/60 text-green-300', rejected: 'bg-gray-900 text-gray-600',
};
const TYPE_EMOJIS = { flood: '🌊', earthquake: '🏚', wildfire: '🔥', gas_leak: '☣️', tsunami: '🌊', landslide: '⛰️' };

function timeAgo(ts) {
  const d = Date.now() - new Date(ts).getTime();
  if (d < 3600000) return `${Math.floor(d / 60000)}m ago`;
  if (d < 86400000) return `${Math.floor(d / 3600000)}h ago`;
  return `${Math.floor(d / 86400000)}d ago`;
}

export default function Dashboard() {
  const [alerts, setAlerts] = useState([]);
  const [resources, setResources] = useState([]);
  const [sensors, setSensors] = useState([]);
  const [risk, setRisk] = useState(null);
  const [mapFilters, setMapFilters] = useState({ type: 'all', severity: 'all', status: 'all' });
  const [selectedAlert, setSelectedAlert] = useState(null);
  const { on } = useWebSocket();

  const fetchAll = useCallback(async () => {
    const [a, r, s, risk] = await Promise.all([
      api.get('/alerts').catch(() => ({ data: [] })),
      api.get('/resources').catch(() => ({ data: [] })),
      api.get('/sensors').catch(() => ({ data: [] })),
      api.get('/risk').catch(() => ({ data: null })),
    ]);
    setAlerts(a.data); setResources(r.data); setSensors(s.data); setRisk(risk.data);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  useEffect(() => {
    const unAlert = on('alert_created', data => setAlerts(prev => [data, ...prev]));
    const unVerify = on('alert_verified', data => setAlerts(prev => prev.map(a => a.id === data.id ? data : a)));
    const unResolve = on('alert_resolved', data => setAlerts(prev => prev.map(a => a.id === data.id ? data : a)));
    const unResource = on('resource_assigned', ({ resource }) => setResources(prev => prev.map(r => r.id === resource.id ? resource : r)));
    return () => { unAlert(); unVerify(); unResolve(); unResource(); };
  }, [on]);

  const activeAlerts = alerts.filter(a => ['active', 'verified'].includes(a.status));
  const deployedResources = resources.filter(r => r.status === 'deployed');
  const criticalSensors = sensors.filter(s => s.status === 'critical');
  const riskScore = risk?.overallScore || 0;
  const riskLevel = risk?.riskLevel || 'LOW';
  const riskColor = riskLevel === 'HIGH' ? 'text-red-400' : riskLevel === 'MEDIUM' ? 'text-yellow-400' : 'text-green-400';

  const handleVerify = async (alertId) => {
    await api.put(`/alerts/${alertId}/verify`, { verifiedBy: 'u2', riskScore: Math.floor(Math.random() * 40 + 50) });
    fetchAll();
  };
  const handleResolve = async (alertId) => {
    await api.put(`/alerts/${alertId}/resolve`);
    fetchAll();
  };

  return (
    <div className="space-y-4">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">GIS Disaster Dashboard</h1>
          <p className="text-gray-500 text-sm">Real-time situational awareness & coordination</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-sm font-bold px-3 py-1 rounded-full border ${riskLevel === 'HIGH' ? 'bg-red-900/40 border-red-700 text-red-400' : riskLevel === 'MEDIUM' ? 'bg-yellow-900/40 border-yellow-700 text-yellow-400' : 'bg-green-900/40 border-green-700 text-green-400'}`}>
            {riskLevel} RISK
          </span>
          <button onClick={fetchAll} className="btn-secondary text-xs px-3 py-1">↻ Refresh</button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="stat-card">
          <div className="text-2xl font-bold text-red-400">{activeAlerts.length}</div>
          <div className="text-xs text-gray-500">Active Alerts</div>
          <div className="text-xs text-gray-600">{alerts.filter(a => a.status === 'pending').length} pending review</div>
        </div>
        <div className="stat-card">
          <div className="text-2xl font-bold text-blue-400">{deployedResources.length}</div>
          <div className="text-xs text-gray-500">Resources Deployed</div>
          <div className="text-xs text-gray-600">{resources.filter(r => r.status === 'available').length} available</div>
        </div>
        <div className="stat-card">
          <div className="text-2xl font-bold text-yellow-400">{criticalSensors.length}</div>
          <div className="text-xs text-gray-500">Critical Sensors</div>
          <div className="text-xs text-gray-600">{sensors.filter(s => s.status === 'warning').length} warnings</div>
        </div>
        <div className="stat-card">
          <div className={`text-2xl font-bold ${riskColor}`}>{riskScore}</div>
          <div className="text-xs text-gray-500">Risk Score</div>
          <div className={`text-xs ${riskColor}`}>{riskLevel}</div>
        </div>
      </div>

      {/* Map filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs text-gray-500">Filter:</span>
        {[
          { key: 'type', options: ['all', 'flood', 'earthquake', 'wildfire', 'gas_leak'] },
          { key: 'severity', options: ['all', 'low', 'medium', 'high', 'critical'] },
          { key: 'status', options: ['all', 'pending', 'verified', 'active', 'resolved'] },
        ].map(({ key, options }) => (
          <select key={key} value={mapFilters[key]} onChange={e => setMapFilters(f => ({ ...f, [key]: e.target.value }))} className="select text-xs py-1 px-2">
            {options.map(o => <option key={o} value={o}>{o === 'all' ? `All ${key}s` : o}</option>)}
          </select>
        ))}
      </div>

      {/* Map */}
      <div className="h-[300px] sm:h-[400px] md:h-[500px]">
        <DisasterMap filters={mapFilters} selectedAlert={selectedAlert} onAlertClick={setSelectedAlert} />
      </div>

      {/* Bottom grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Alerts list */}
        <div className="md:col-span-2 card p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-sm">Disaster Alerts</h2>
            <span className="text-xs text-gray-500">{alerts.length} total</span>
          </div>
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {alerts.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-6">No alerts</p>
            ) : (
              alerts.map(alert => (
                <div
                  key={alert.id}
                  onClick={() => setSelectedAlert(alert)}
                  className={`flex items-start gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${selectedAlert?.id === alert.id ? 'border-blue-600 bg-blue-900/20' : 'border-gray-800 hover:border-gray-700 bg-gray-800/30'}`}
                >
                  <span className="text-2xl mt-0.5">{TYPE_EMOJIS[alert.type] || '⚠️'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-white capitalize">{alert.type.replace('_', ' ')}</span>
                      <span className={`text-xs font-bold ${SEVERITY_COLORS[alert.severity]}`}>{alert.severity.toUpperCase()}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_BADGES[alert.status]}`}>{alert.status}</span>
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5 truncate">{alert.location.address}</div>
                    <div className="text-xs text-gray-600 mt-0.5">{timeAgo(alert.timestamp)} · Risk: {alert.riskScore}</div>
                  </div>
                  <div className="flex flex-col gap-1">
                    {alert.status === 'pending' && (
                      <button onClick={e => { e.stopPropagation(); handleVerify(alert.id); }} className="text-xs px-2 py-1 bg-blue-700 hover:bg-blue-600 text-white rounded">Verify</button>
                    )}
                    {['verified', 'active'].includes(alert.status) && (
                      <button onClick={e => { e.stopPropagation(); handleResolve(alert.id); }} className="text-xs px-2 py-1 bg-green-700 hover:bg-green-600 text-white rounded">Resolve</button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Sensor panel */}
        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-sm">IoT Sensor Readings</h2>
            <span className="text-xs text-green-400 pulse-dot">● Live</span>
          </div>
          <SensorPanel />
        </div>
      </div>

      {/* Risk & Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Risk analysis */}
        <div className="card p-4">
          <h2 className="font-semibold text-sm mb-4">Risk Analysis</h2>
          {risk ? (
            <div>
              <div className="flex justify-center mb-4">
                <RiskGauge score={risk.overallScore} label={`${risk.riskLevel} Risk`} />
              </div>
              <div className="space-y-2">
                {[
                  { label: 'Sensor Data', score: risk.breakdown?.sensorScore || 0, color: '#f59e0b' },
                  { label: 'Alert Frequency', score: risk.breakdown?.alertFrequencyScore || 0, color: '#ef4444' },
                  { label: 'Satellite Zones', score: risk.breakdown?.satelliteScore || 0, color: '#8b5cf6' },
                ].map(({ label, score, color }) => (
                  <div key={label}>
                    <div className="flex justify-between text-xs mb-1"><span className="text-gray-400">{label}</span><span style={{ color }}>{score}</span></div>
                    <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${score}%`, background: color }} />
                    </div>
                  </div>
                ))}
              </div>
              {risk.recommendations?.length > 0 && (
                <div className="mt-4 space-y-1">
                  <div className="text-xs text-gray-500 mb-2">Recommendations</div>
                  {risk.recommendations.map((rec, i) => (
                    <div key={i} className="text-xs text-yellow-300 bg-yellow-900/20 border border-yellow-900/50 rounded px-2 py-1">⚡ {rec}</div>
                  ))}
                </div>
              )}
            </div>
          ) : <div className="text-gray-500 text-sm text-center py-8">Loading...</div>}
        </div>

        {/* Alerts chart */}
        <div className="lg:col-span-2 card p-4">
          <h2 className="font-semibold text-sm mb-3">Alert Distribution by Type & Severity</h2>
          <AlertsBarChart alerts={alerts} />
          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="text-center">
              <div className="text-lg font-bold text-yellow-400">{alerts.filter(a => a.status === 'pending').length}</div>
              <div className="text-xs text-gray-500">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-red-400">{alerts.filter(a => a.status === 'active').length}</div>
              <div className="text-xs text-gray-500">Active</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-400">{alerts.filter(a => a.status === 'resolved').length}</div>
              <div className="text-xs text-gray-500">Resolved</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
