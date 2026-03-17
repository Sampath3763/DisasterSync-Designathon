import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const LEVEL_STYLES = { beginner: 'bg-green-900/60 text-green-300 border-green-800', intermediate: 'bg-yellow-900/60 text-yellow-300 border-yellow-800', advanced: 'bg-red-900/60 text-red-300 border-red-800' };
const CATEGORY_ICONS = { disaster_preparedness: '🌍', safety_guidelines: '🛡️', emergency_protocols: '📋' };
const CATEGORY_COLORS = { disaster_preparedness: 'border-blue-700', safety_guidelines: 'border-green-700', emergency_protocols: 'border-orange-700' };

export default function TrainingModule() {
  const { user } = useAuth();
  const [modules, setModules] = useState([]);
  const [completed, setCompleted] = useState(new Set());
  const [selected, setSelected] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');

  useEffect(() => {
    api.get('/training').then(r => setModules(r.data)).catch(() => {});
    const saved = localStorage.getItem('completedModules');
    if (saved) setCompleted(new Set(JSON.parse(saved)));
  }, []);

  const markComplete = (id) => {
    const next = new Set([...completed, id]);
    setCompleted(next);
    localStorage.setItem('completedModules', JSON.stringify([...next]));
  };

  const filtered = modules.filter(m => {
    if (categoryFilter !== 'all' && m.category !== categoryFilter) return false;
    if (levelFilter !== 'all' && m.level !== levelFilter) return false;
    return true;
  });

  const categories = [...new Set(modules.map(m => m.category))];

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Training Module</h1>
          <p className="text-gray-500 text-sm">Safety guidelines, disaster preparedness, and emergency protocols</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-blue-400">{completed.size}/{modules.length}</div>
          <div className="text-xs text-gray-500">Completed</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="card p-3">
        <div className="flex justify-between text-xs text-gray-500 mb-2">
          <span>Training Progress</span>
          <span>{modules.length > 0 ? Math.round((completed.size / modules.length) * 100) : 0}%</span>
        </div>
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-blue-600 to-green-500 rounded-full transition-all" style={{ width: `${modules.length > 0 ? (completed.size / modules.length * 100) : 0}%` }} />
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="select text-xs py-1.5 px-3">
          <option value="all">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>)}
        </select>
        <select value={levelFilter} onChange={e => setLevelFilter(e.target.value)} className="select text-xs py-1.5 px-3">
          <option value="all">All Levels</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
      </div>

      {/* Module grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(mod => (
          <div key={mod.id} className={`card border-t-2 ${CATEGORY_COLORS[mod.category] || 'border-gray-700'} p-5 flex flex-col gap-3 hover:border-blue-600 transition-colors cursor-pointer ${completed.has(mod.id) ? 'opacity-75' : ''}`} onClick={() => setSelected(mod)}>
            <div className="flex items-start justify-between">
              <span className="text-2xl">{CATEGORY_ICONS[mod.category] || '📖'}</span>
              <div className="flex items-center gap-1.5">
                {completed.has(mod.id) && <span className="text-green-400 text-sm">✓</span>}
                <span className={`text-xs px-2 py-0.5 rounded-full border ${LEVEL_STYLES[mod.level]}`}>{mod.level}</span>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-white leading-tight">{mod.title}</h3>
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">{mod.description}</p>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span>⏱ {mod.duration}</span>
              <span className="capitalize">👤 {mod.targetRole === 'all' ? 'Everyone' : mod.targetRole?.replace('_', ' ')}</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {mod.tags?.map(tag => (
                <span key={tag} className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full">#{tag}</span>
              ))}
            </div>
            <button
              onClick={e => { e.stopPropagation(); setSelected(mod); }}
              className={`mt-auto text-sm py-2 rounded-lg transition-colors ${completed.has(mod.id) ? 'bg-green-900/40 text-green-400 border border-green-800' : 'btn-primary'}`}
            >
              {completed.has(mod.id) ? '✓ Review Module' : '▶ Start Training'}
            </button>
          </div>
        ))}
      </div>

      {/* Training Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="card w-full max-w-2xl my-4">
            <div className="p-6 border-b border-gray-800">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span>{CATEGORY_ICONS[selected.category]}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${LEVEL_STYLES[selected.level]}`}>{selected.level}</span>
                  </div>
                  <h2 className="text-lg font-bold text-white">{selected.title}</h2>
                  <p className="text-sm text-gray-400 mt-1">{selected.description}</p>
                  <div className="flex gap-4 mt-2 text-xs text-gray-500">
                    <span>⏱ {selected.duration}</span>
                    <span>👤 {selected.targetRole === 'all' ? 'All Users' : selected.targetRole?.replace('_', ' ')}</span>
                  </div>
                </div>
                <button onClick={() => setSelected(null)} className="text-gray-500 hover:text-white text-xl">✕</button>
              </div>
            </div>

            <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
              {/* Content sections */}
              {selected.content?.map((section, i) => (
                <div key={i} className="border-l-2 border-blue-600 pl-4">
                  <h3 className="font-semibold text-blue-300 mb-2">{i + 1}. {section.section}</h3>
                  <p className="text-sm text-gray-300 leading-relaxed">{section.text}</p>
                </div>
              ))}

              {/* Video placeholder */}
              <div className="bg-gray-800 rounded-lg overflow-hidden">
                <div className="bg-gray-900 px-4 py-2 text-xs text-gray-500 flex items-center gap-2">
                  <span>🎥</span> Training Video
                </div>
                <div className="flex items-center justify-center h-48 text-gray-600">
                  <div className="text-center">
                    <div className="text-5xl mb-3">▶</div>
                    <div className="text-sm">Video content would play here</div>
                    <div className="text-xs mt-1 text-gray-700">Click to start training video</div>
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1">
                {selected.tags?.map(tag => (
                  <span key={tag} className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded-full">#{tag}</span>
                ))}
              </div>
            </div>

            <div className="p-6 border-t border-gray-800 flex gap-3">
              {!completed.has(selected.id) ? (
                <button onClick={() => { markComplete(selected.id); setSelected(null); }} className="btn-success flex-1">
                  ✓ Mark as Completed
                </button>
              ) : (
                <div className="flex-1 text-center text-green-400 py-2 bg-green-900/20 border border-green-800 rounded-lg text-sm">✓ Module Completed</div>
              )}
              <button onClick={() => setSelected(null)} className="btn-secondary">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
