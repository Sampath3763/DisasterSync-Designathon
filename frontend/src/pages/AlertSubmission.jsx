import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useWebSocket } from '../contexts/WebSocketContext';
import api from '../services/api';

const DISASTER_TYPES = ['flood', 'earthquake', 'wildfire', 'gas_leak', 'tsunami', 'landslide', 'other'];
const SEVERITY_LEVELS = ['low', 'medium', 'high', 'critical'];
const TYPE_EMOJIS = { flood: '🌊', earthquake: '🏚️', wildfire: '🔥', gas_leak: '☣️', tsunami: '🌊', landslide: '⛰️', other: '⚠️' };
const SEV_COLORS = { low: 'bg-green-900/60 text-green-300 border-green-800', medium: 'bg-yellow-900/60 text-yellow-300 border-yellow-800', high: 'bg-red-900/60 text-red-300 border-red-800', critical: 'bg-purple-900/60 text-purple-300 border-purple-800' };
const STATUS_BADGES = { pending: 'bg-gray-800 text-gray-400', verified: 'bg-blue-900/60 text-blue-300', active: 'bg-red-900/60 text-red-300', resolved: 'bg-green-900/60 text-green-300', rejected: 'bg-gray-900 text-gray-600' };

function timeAgo(ts) {
  const d = Date.now() - new Date(ts).getTime();
  if (d < 3600000) return `${Math.floor(d / 60000)}m ago`;
  return `${Math.floor(d / 3600000)}h ago`;
}

export default function AlertSubmission() {
  const { user } = useAuth();
  const { on } = useWebSocket();
  const [alerts, setAlerts] = useState([]);
  const [selected, setSelected] = useState(null);
  const [tab, setTab] = useState('submit');
  const [form, setForm] = useState({ type: 'flood', severity: 'medium', lat: '', lng: '', address: '', description: '', photoUrl: '' });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const fetchAlerts = useCallback(() => {
    api.get('/alerts').then(r => setAlerts(r.data)).catch(() => {});
  }, []);

  useEffect(() => { fetchAlerts(); }, [fetchAlerts]);

  useEffect(() => {
    const u1 = on('alert_created', d => setAlerts(p => [d, ...p]));
    const u2 = on('alert_verified', d => setAlerts(p => p.map(a => a.id === d.id ? d : a)));
    const u3 = on('alert_resolved', d => setAlerts(p => p.map(a => a.id === d.id ? d : a)));
    return () => { u1(); u2(); u3(); };
  }, [on]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.lat || !form.lng) { setError('Latitude and longitude are required'); return; }
    setSubmitting(true); setError(''); setSuccess('');
    try {
      await api.post('/alerts', { ...form, location: { lat: parseFloat(form.lat), lng: parseFloat(form.lng), address: form.address }, submittedBy: user.id });
      setSuccess('Alert submitted successfully! It will be reviewed by the safety team.');
      setForm({ type: 'flood', severity: 'medium', lat: '', lng: '', address: '', description: '', photoUrl: '' });
      setTab('queue');
    } catch { setError('Failed to submit alert. Please try again.'); }
    setSubmitting(false);
  };

  const canModerate = ['admin', 'safety_team'].includes(user?.role);

  const handleAction = async (alertId, action) => {
    try {
      if (action === 'verify') await api.put(`/alerts/${alertId}/verify`, { verifiedBy: user.id, riskScore: 65 });
      else if (action === 'activate') await api.put(`/alerts/${alertId}/activate`);
      else if (action === 'resolve') await api.put(`/alerts/${alertId}/resolve`);
      else if (action === 'reject') await api.put(`/alerts/${alertId}/reject`);
      fetchAlerts();
    } catch {}
  };

  const pending = alerts.filter(a => a.status === 'pending');

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-white">Alert Submission & Validation</h1>
        <p className="text-gray-500 text-sm">Submit crowd-sourced disaster alerts and manage verification workflow</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-900 border border-gray-800 rounded-xl p-1 overflow-x-auto">
        {[['submit', '📤 Submit Alert'], ['queue', `🔍 Review Queue (${pending.length})`], ['all', '📋 All Alerts']].map(([v, l]) => (
          <button key={v} onClick={() => setTab(v)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === v ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}>{l}</button>
        ))}
      </div>

      {tab === 'submit' && (
        <div className="max-w-2xl card p-6">
          <h2 className="font-semibold mb-4">Submit New Disaster Alert</h2>
          {success && <div className="bg-green-900/30 border border-green-800 text-green-300 text-sm p-3 rounded-lg mb-4">✅ {success}</div>}
          {error && <div className="bg-red-900/30 border border-red-800 text-red-300 text-sm p-3 rounded-lg mb-4">❌ {error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Disaster Type *</label>
                <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="select w-full">
                  {DISASTER_TYPES.map(t => <option key={t} value={t}>{TYPE_EMOJIS[t] || ''} {t.replace('_', ' ')}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Severity Level *</label>
                <select value={form.severity} onChange={e => setForm(f => ({ ...f, severity: e.target.value }))} className="select w-full">
                  {SEVERITY_LEVELS.map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Latitude *</label>
                <input type="number" step="any" value={form.lat} onChange={e => setForm(f => ({ ...f, lat: e.target.value }))} className="input w-full" placeholder="e.g. 28.6139" required />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Longitude *</label>
                <input type="number" step="any" value={form.lng} onChange={e => setForm(f => ({ ...f, lng: e.target.value }))} className="input w-full" placeholder="e.g. 77.2090" required />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Location Address</label>
              <input type="text" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} className="input w-full" placeholder="e.g. Sector 12, New Delhi" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Description *</label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="input w-full h-24 resize-none" placeholder="Describe the disaster situation, affected areas, visible damage..." required />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Photo URL (optional)</label>
              <input type="url" value={form.photoUrl} onChange={e => setForm(f => ({ ...f, photoUrl: e.target.value }))} className="input w-full" placeholder="https://..." />
            </div>
            <div className="bg-yellow-900/20 border border-yellow-900/50 rounded-lg p-3 text-xs text-yellow-400">
              ⚠️ Alert will be reviewed by the safety team before being broadcast. Provide accurate location coordinates for faster response.
            </div>
            <button type="submit" disabled={submitting} className="btn-danger w-full flex items-center justify-center gap-2">
              {submitting ? '⏳ Submitting...' : '🚨 Submit Emergency Alert'}
            </button>
          </form>
        </div>
      )}

      {tab === 'queue' && (
        <div className="card p-4">
          <h2 className="font-semibold mb-4">Pending Verification Queue</h2>
          {!canModerate && <div className="bg-blue-900/20 border border-blue-900/50 rounded-lg p-3 text-xs text-blue-400 mb-4">🔒 Only safety team members can verify alerts.</div>}
          {pending.length === 0 ? (
            <div className="py-12 text-center text-gray-500">✅ No pending alerts</div>
          ) : (
            <div className="space-y-3">
              {pending.map(alert => (
                <div key={alert.id} className="border border-yellow-900/50 bg-yellow-900/10 rounded-xl p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{TYPE_EMOJIS[alert.type] || '⚠️'}</span>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="font-medium text-white capitalize">{alert.type.replace('_', ' ')}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${SEV_COLORS[alert.severity]}`}>{alert.severity.toUpperCase()}</span>
                        </div>
                        <div className="text-sm text-gray-400">{alert.location.address || `${alert.location.lat}, ${alert.location.lng}`}</div>
                        <div className="text-xs text-gray-500 mt-1">{alert.description}</div>
                        <div className="text-xs text-gray-600 mt-1">Submitted {timeAgo(alert.timestamp)}</div>
                      </div>
                    </div>
                    {canModerate && (
                      <div className="flex gap-2 flex-shrink-0">
                        <button onClick={() => handleAction(alert.id, 'verify')} className="btn-primary text-xs px-3 py-1">✓ Verify</button>
                        <button onClick={() => handleAction(alert.id, 'reject')} className="btn-danger text-xs px-3 py-1">✗ Reject</button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'all' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 card p-4">
            <h2 className="font-semibold mb-4">All Alerts ({alerts.length})</h2>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {alerts.map(alert => (
                <div key={alert.id} onClick={() => setSelected(alert)} className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${selected?.id === alert.id ? 'border-blue-600 bg-blue-900/20' : 'border-gray-800 hover:border-gray-700'}`}>
                  <span className="text-xl">{TYPE_EMOJIS[alert.type] || '⚠️'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium capitalize">{alert.type.replace('_', ' ')}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${SEV_COLORS[alert.severity] || ''}`}>{alert.severity}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_BADGES[alert.status]}`}>{alert.status}</span>
                    </div>
                    <div className="text-xs text-gray-500 truncate">{alert.location.address}</div>
                    <div className="text-xs text-gray-600">{timeAgo(alert.timestamp)}</div>
                  </div>
                  {canModerate && alert.status === 'verified' && (
                    <button onClick={e => { e.stopPropagation(); handleAction(alert.id, 'activate'); }} className="text-xs px-2 py-1 bg-orange-700 hover:bg-orange-600 text-white rounded">Activate</button>
                  )}
                  {canModerate && alert.status === 'active' && (
                    <button onClick={e => { e.stopPropagation(); handleAction(alert.id, 'resolve'); }} className="text-xs px-2 py-1 bg-green-700 hover:bg-green-600 text-white rounded">Resolve</button>
                  )}
                </div>
              ))}
            </div>
          </div>
          {selected && (
            <div className="card p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm">Alert Detail</h3>
                <button onClick={() => setSelected(null)} className="text-gray-500 hover:text-white">✕</button>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2"><span className="text-3xl">{TYPE_EMOJIS[selected.type]}</span><span className="font-bold capitalize">{selected.type.replace('_', ' ')}</span></div>
                {[['Severity', selected.severity.toUpperCase()], ['Status', selected.status], ['Location', selected.location.address || `${selected.location.lat}, ${selected.location.lng}`], ['Risk Score', selected.riskScore], ['Casualties', selected.casualties], ['Area Affected', selected.affectedArea], ['Resources Assigned', selected.resourcesAssigned?.length || 0]].map(([k, v]) => (
                  <div key={k} className="flex justify-between border-b border-gray-800 pb-2">
                    <span className="text-gray-500">{k}</span>
                    <span className="text-white font-medium">{v}</span>
                  </div>
                ))}
                <div><div className="text-gray-500 mb-1">Description</div><div className="text-xs text-gray-300">{selected.description}</div></div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
