import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Doughnut, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import api from '../services/api';

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const TYPE_ICONS = { rescue_equipment: '🪝', drone: '🚁', medical_kit: '🩺', protective_gear: '🛡️' };
const STATUS_STYLES = {
  available: 'bg-green-900/50 text-green-400 border-green-800',
  in_use: 'bg-blue-900/50 text-blue-400 border-blue-800',
  maintenance: 'bg-yellow-900/50 text-yellow-400 border-yellow-800',
  retired: 'bg-gray-900 text-gray-500 border-gray-700',
};
const CONDITION_STYLES = {
  excellent: 'text-green-400',
  good: 'text-blue-400',
  fair: 'text-yellow-400',
  needs_repair: 'text-red-400',
};

export default function EquipmentUsage() {
  const { user } = useAuth();
  const [equipment, setEquipment] = useState([]);
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const canEdit = ['admin', 'safety_team'].includes(user?.role);

  const fetchEquipment = useCallback(() => {
    api.get('/equipment').then(r => setEquipment(r.data)).catch(() => {});
  }, []);

  useEffect(() => { fetchEquipment(); }, [fetchEquipment]);

  const handleStatusUpdate = async (id, status) => {
    await api.put(`/equipment/${id}`, { status }).catch(() => {});
    fetchEquipment();
  };

  const filtered = filter === 'all' ? equipment : equipment.filter(e => e.type === filter || e.status === filter);
  const types = [...new Set(equipment.map(e => e.type))];

  // Chart data
  const typeCountMap = types.reduce((acc, t) => { acc[t] = equipment.filter(e => e.type === t).length; return acc; }, {});
  const doughnutData = {
    labels: types.map(t => t.replace('_', ' ')),
    datasets: [{ data: Object.values(typeCountMap), backgroundColor: ['#ef4444', '#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6'], borderWidth: 0 }],
  };
  const doughnutOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { color: '#9ca3af', font: { size: 11 }, boxWidth: 12 } } } };

  const usageData = {
    labels: equipment.map(e => e.name.length > 20 ? e.name.slice(0, 18) + '…' : e.name),
    datasets: [{ label: 'Usage Hours', data: equipment.map(e => e.usageHours), backgroundColor: '#3b82f6cc', borderColor: '#3b82f6', borderWidth: 1, borderRadius: 4 }],
  };
  const usageOptions = {
    indexAxis: 'y', responsive: true, maintainAspectRatio: false,
    scales: {
      x: { ticks: { color: '#6b7280', font: { size: 10 } }, grid: { color: '#1f2937' } },
      y: { ticks: { color: '#9ca3af', font: { size: 10 } } },
    },
    plugins: { legend: { display: false } },
  };

  const totalAvailable = equipment.reduce((s, e) => s + (e.available || 0), 0);
  const totalInUse = equipment.filter(e => e.status === 'in_use').length;
  const needsMaintenance = equipment.filter(e => e.condition === 'needs_repair' || e.status === 'maintenance').length;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-white">Equipment Usage Monitoring</h1>
        <p className="text-gray-500 text-sm">Track usage, availability, and condition of all rescue equipment</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="stat-card"><div className="text-2xl font-bold text-white">{equipment.length}</div><div className="text-xs text-gray-500">Total Equipment</div></div>
        <div className="stat-card"><div className="text-2xl font-bold text-green-400">{totalAvailable}</div><div className="text-xs text-gray-500">Units Available</div></div>
        <div className="stat-card"><div className="text-2xl font-bold text-blue-400">{totalInUse}</div><div className="text-xs text-gray-500">Currently In Use</div></div>
        <div className="stat-card"><div className="text-2xl font-bold text-yellow-400">{needsMaintenance}</div><div className="text-xs text-gray-500">Needs Attention</div></div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-4">
          <h2 className="font-semibold text-sm mb-3">Equipment by Type</h2>
          <div style={{ height: 200 }}>
            <Doughnut data={doughnutData} options={doughnutOptions} />
          </div>
        </div>
        <div className="card p-4">
          <h2 className="font-semibold text-sm mb-3">Usage Hours by Equipment</h2>
          <div style={{ height: 200 }}>
            <Bar data={usageData} options={usageOptions} />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {['all', ...types, 'available', 'in_use', 'maintenance'].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`text-xs px-3 py-1.5 rounded-full transition-colors ${filter === f ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
            {f === 'all' ? 'All Equipment' : f.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {/* Equipment list */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Equipment Inventory ({filtered.length})</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {filtered.map(eq => (
            <div key={eq.id} onClick={() => setSelected(eq)} className={`bg-gray-800/50 border rounded-xl p-4 cursor-pointer transition-colors ${selected?.id === eq.id ? 'border-blue-600' : 'border-gray-700 hover:border-gray-600'}`}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{TYPE_ICONS[eq.type] || '🔧'}</span>
                  <div>
                    <div className="text-sm font-medium text-white leading-tight">{eq.name}</div>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_STYLES[eq.status]}`}>{eq.status.replace('_', ' ')}</span>
                  </div>
                </div>
              </div>

              {/* Availability */}
              <div className="space-y-1 mt-3">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Available</span><span>{eq.available}/{eq.quantity}</span>
                </div>
                <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full" style={{ width: `${eq.quantity ? (eq.available / eq.quantity * 100) : 0}%` }} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                <div><span className="text-gray-500">Usage:</span> <span className="text-white">{eq.usageHours}h</span></div>
                <div><span className="text-gray-500">Condition:</span> <span className={CONDITION_STYLES[eq.condition]}>{eq.condition?.replace('_', ' ')}</span></div>
                <div><span className="text-gray-500">Type:</span> <span className="text-white">{eq.type?.replace(/_/g, ' ')}</span></div>
                <div><span className="text-gray-500">Last Maint:</span> <span className="text-white">{eq.lastMaintenance}</span></div>
              </div>

              {eq.assignedTo && (
                <div className="mt-2 text-xs text-blue-400 bg-blue-900/20 rounded px-2 py-1">Assigned to: {eq.assignedTo}</div>
              )}

              {canEdit && (
                <div className="mt-3">
                  <select
                    value={eq.status}
                    onChange={e => { e.stopPropagation(); handleStatusUpdate(eq.id, e.target.value); }}
                    onClick={e => e.stopPropagation()}
                    className="select text-xs py-1 w-full"
                  >
                    <option value="available">Available</option>
                    <option value="in_use">In Use</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="retired">Retired</option>
                  </select>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Detail panel */}
      {selected && (
        <div className="fixed bottom-4 right-4 card p-4 w-72 shadow-2xl z-40 border-blue-700">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm">Equipment Detail</h3>
            <button onClick={() => setSelected(null)} className="text-gray-500 hover:text-white">✕</button>
          </div>
          <div className="space-y-2 text-xs">
            <div className="font-medium text-white">{selected.name}</div>
            {[['Type', selected.type?.replace(/_/g, ' ')], ['Status', selected.status?.replace(/_/g, ' ')], ['Condition', selected.condition?.replace(/_/g, ' ')], ['Usage Hours', `${selected.usageHours}h`], ['Available', `${selected.available}/${selected.quantity}`], ['Last Maintenance', selected.lastMaintenance], ['Assigned To', selected.assignedTo || 'Unassigned']].map(([k, v]) => (
              <div key={k} className="flex justify-between border-b border-gray-800 pb-1">
                <span className="text-gray-500">{k}</span>
                <span className="text-white">{v}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
