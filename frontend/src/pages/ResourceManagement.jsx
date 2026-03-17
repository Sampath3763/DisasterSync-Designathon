import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const TYPE_ICONS = { rescue_team: '🧑‍🚒', ambulance: '🚑', drone: '🚁', helicopter: '🚁 ', relief_supply: '📦', default: '📍' };
const STATUS_STYLES = { available: 'bg-green-900/50 text-green-400 border-green-800', deployed: 'bg-red-900/50 text-red-400 border-red-800', maintenance: 'bg-yellow-900/50 text-yellow-400 border-yellow-800' };
const TEAM_COLORS = { fire: 'bg-red-700', medical: 'bg-blue-700', flood: 'bg-cyan-700', earthquake: 'bg-orange-700' };
const TEAM_STATUS_STYLES = { available: 'text-green-400', deployed: 'text-red-400', standby: 'text-yellow-400', offline: 'text-gray-500' };

export default function ResourceManagement() {
  const { user } = useAuth();
  const [resources, setResources] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [teams, setTeams] = useState([]);
  const [optimal, setOptimal] = useState(null);
  const [route, setRoute] = useState(null);
  const [assignModal, setAssignModal] = useState(null);
  const [selectedAlertId, setSelectedAlertId] = useState('');
  const [tab, setTab] = useState('resources');

  const fetchAll = useCallback(async () => {
    const [r, a, t] = await Promise.all([
      api.get('/resources').catch(() => ({ data: [] })),
      api.get('/alerts').catch(() => ({ data: [] })),
      api.get('/teams').catch(() => ({ data: [] })),
    ]);
    setResources(r.data); setAlerts(a.data.filter(a => ['active', 'verified'].includes(a.status))); setTeams(t.data);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleAssign = async () => {
    if (!assignModal || !selectedAlertId) return;
    try {
      await api.put(`/resources/${assignModal.id}/assign`, { alertId: selectedAlertId });
      setAssignModal(null); setSelectedAlertId(''); fetchAll();
    } catch {}
  };

  const handleRelease = async (id) => {
    await api.put(`/resources/${id}/release`).catch(() => {});
    fetchAll();
  };

  const findOptimal = async (alertId) => {
    const r = await api.get(`/resources/optimal/${alertId}`).catch(() => ({ data: [] }));
    setOptimal({ alertId, list: r.data });
  };

  const showRoute = async (resourceId, alertId) => {
    const r = await api.get(`/resources/route/${resourceId}/${alertId}`).catch(() => ({ data: null }));
    setRoute(r.data);
  };

  const updateTeamStatus = async (teamId, status) => {
    await api.put(`/teams/${teamId}/status`, { status }).catch(() => {});
    fetchAll();
  };

  const canEdit = ['admin', 'safety_team'].includes(user?.role);
  const available = resources.filter(r => r.status === 'available').length;
  const deployed = resources.filter(r => r.status === 'deployed').length;

  return (
    <div className="space-y-4">
      <div><h1 className="text-xl font-bold text-white">Resource Tracking & Coordination</h1><p className="text-gray-500 text-sm">Manage and allocate rescue resources to disaster zones</p></div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="stat-card"><div className="text-2xl font-bold text-green-400">{available}</div><div className="text-xs text-gray-500">Available</div></div>
        <div className="stat-card"><div className="text-2xl font-bold text-red-400">{deployed}</div><div className="text-xs text-gray-500">Deployed</div></div>
        <div className="stat-card"><div className="text-2xl font-bold text-yellow-400">{resources.filter(r => r.status === 'maintenance').length}</div><div className="text-xs text-gray-500">Maintenance</div></div>
        <div className="stat-card"><div className="text-2xl font-bold text-blue-400">{teams.filter(t => t.status === 'available').length}/{teams.length}</div><div className="text-xs text-gray-500">Teams Available</div></div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-900 border border-gray-800 rounded-xl p-1 w-fit">
        {[['resources', '🚁 Resources'], ['teams', '👥 Teams'], ['optimal', '🎯 Optimal Allocation']].map(([v, l]) => (
          <button key={v} onClick={() => setTab(v)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === v ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}>{l}</button>
        ))}
      </div>

      {tab === 'resources' && (
        <div className="card p-4">
          <div className="flex items-center justify-between mb-4"><h2 className="font-semibold">Resources ({resources.length})</h2></div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {resources.map(res => (
              <div key={res.id} className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{TYPE_ICONS[res.type] || TYPE_ICONS.default}</span>
                    <div>
                      <div className="text-sm font-medium text-white">{res.name}</div>
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_STYLES[res.status]}`}>{res.status}</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-1 mt-2">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Capacity</span><span>{res.currentLoad}/{res.capacity}</span>
                  </div>
                  <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${res.capacity ? (res.currentLoad / res.capacity * 100) : 0}%` }} />
                  </div>
                </div>
                {res.assignedTo && <div className="text-xs text-gray-500 mt-2">Assigned to alert: <span className="text-orange-400">{res.assignedTo}</span></div>}
                {canEdit && (
                  <div className="flex gap-2 mt-3">
                    {res.status === 'available' && (
                      <button onClick={() => setAssignModal(res)} className="btn-primary text-xs py-1 flex-1">Assign</button>
                    )}
                    {res.status === 'deployed' && (
                      <button onClick={() => handleRelease(res.id)} className="btn-secondary text-xs py-1 flex-1">Release</button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'teams' && (
        <div className="card p-4">
          <h2 className="font-semibold mb-4">Rescue Teams</h2>
          <div className="space-y-3">
            {teams.map(team => (
              <div key={team.id} className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 ${TEAM_COLORS[team.type] || 'bg-gray-700'} rounded-lg flex items-center justify-center text-white text-sm font-bold`}>
                      {team.type[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium text-white">{team.name}</div>
                      <div className={`text-xs ${TEAM_STATUS_STYLES[team.status]} mt-0.5`}>● {team.status.toUpperCase()}</div>
                      {team.currentTask && <div className="text-xs text-gray-400 mt-1">Task: {team.currentTask}</div>}
                      <div className="text-xs text-gray-500 mt-1">{team.members?.length} members · {team.expertise?.join(', ')}</div>
                    </div>
                  </div>
                  {canEdit && (
                    <select value={team.status} onChange={e => updateTeamStatus(team.id, e.target.value)} className="select text-xs py-1 px-2">
                      {['available', 'deployed', 'standby', 'offline'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'optimal' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="card p-4">
            <h2 className="font-semibold mb-4">Optimal Resource Allocation</h2>
            <div className="mb-4">
              <label className="text-xs text-gray-400 mb-1 block">Select Active Alert</label>
              <div className="flex gap-2">
                <select value={selectedAlertId} onChange={e => setSelectedAlertId(e.target.value)} className="select flex-1">
                  <option value="">Choose an alert...</option>
                  {alerts.map(a => <option key={a.id} value={a.id}>{a.type} - {a.location.address} ({a.severity})</option>)}
                </select>
                <button onClick={() => findOptimal(selectedAlertId)} disabled={!selectedAlertId} className="btn-primary text-sm px-3">Find</button>
              </div>
            </div>
            {optimal && (
              <div className="space-y-2">
                <div className="text-xs text-gray-500 mb-2">Available resources sorted by proximity:</div>
                {optimal.list.length === 0 ? <p className="text-gray-500 text-sm">No available resources</p> : optimal.list.map((res, i) => (
                  <div key={res.id} className="flex items-center gap-3 bg-gray-800/50 border border-gray-700 rounded-lg p-3">
                    <span className="text-gray-500 text-sm w-5">#{i + 1}</span>
                    <span className="text-xl">{TYPE_ICONS[res.type] || '📍'}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-white truncate">{res.name}</div>
                      <div className="text-xs text-gray-500">{res.type}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-blue-400">{res.distance} km</div>
                      <button onClick={() => showRoute(res.id, optimal.alertId)} className="text-xs text-gray-400 hover:text-white">View Route</button>
                    </div>
                    {i === 0 && canEdit && (
                      <button onClick={async () => { await api.put(`/resources/${res.id}/assign`, { alertId: optimal.alertId }); fetchAll(); setOptimal(null); }} className="btn-success text-xs py-1 px-2">Assign</button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          {route && (
            <div className="card p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold">Rescue Route</h2>
                <button onClick={() => setRoute(null)} className="text-gray-500 hover:text-white">✕</button>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3 bg-blue-900/20 border border-blue-900/40 rounded-lg p-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-sm">📍</div>
                  <div><div className="text-xs text-gray-400">Origin</div><div className="text-sm text-white">Lat: {route.from.lat.toFixed(4)}, Lng: {route.from.lng.toFixed(4)}</div></div>
                </div>
                <div className="flex items-center gap-2 px-4"><div className="flex-1 border-t border-dashed border-gray-700"></div><span className="text-xs text-gray-500">{route.distance} km</span><div className="flex-1 border-t border-dashed border-gray-700"></div></div>
                <div className="flex items-center gap-3 bg-red-900/20 border border-red-900/40 rounded-lg p-3">
                  <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-sm">🚨</div>
                  <div><div className="text-xs text-gray-400">Destination</div><div className="text-sm text-white">Lat: {route.to.lat.toFixed(4)}, Lng: {route.to.lng.toFixed(4)}</div></div>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div className="stat-card"><div className="text-xl font-bold text-blue-400">{route.distance} km</div><div className="text-xs text-gray-500">Distance</div></div>
                  <div className="stat-card"><div className="text-xl font-bold text-green-400">{route.estimatedTime} min</div><div className="text-xs text-gray-500">Est. Travel Time</div></div>
                </div>
                <div className="bg-gray-800 rounded-lg p-3">
                  <div className="text-xs text-gray-400 mb-2">Route Waypoints</div>
                  {route.waypoints.map((wp, i) => (
                    <div key={i} className="text-xs text-gray-500">{i + 1}. {wp.lat.toFixed(4)}, {wp.lng.toFixed(4)}</div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Assign Modal */}
      {assignModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="card p-6 w-full max-w-md">
            <h3 className="font-semibold mb-4">Assign: {assignModal.name}</h3>
            <div className="mb-4">
              <label className="text-xs text-gray-400 mb-1 block">Select Alert to Assign To</label>
              <select value={selectedAlertId} onChange={e => setSelectedAlertId(e.target.value)} className="select w-full">
                <option value="">Select an alert...</option>
                {alerts.map(a => <option key={a.id} value={a.id}>{a.type} - {a.location.address} ({a.severity})</option>)}
              </select>
            </div>
            <div className="flex gap-2">
              <button onClick={handleAssign} disabled={!selectedAlertId} className="btn-primary flex-1">Assign</button>
              <button onClick={() => { setAssignModal(null); setSelectedAlertId(''); }} className="btn-secondary flex-1">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
