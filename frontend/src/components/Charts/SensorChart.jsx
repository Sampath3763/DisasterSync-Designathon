import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, LineElement, PointElement, LinearScale, TimeScale, CategoryScale, Filler, Tooltip, Legend } from 'chart.js';

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Filler, Tooltip, Legend);

const SENSOR_COLORS = { temperature: '#ef4444', gas: '#f59e0b', seismic: '#8b5cf6', water_level: '#3b82f6', air_quality: '#10b981' };

export default function SensorChart({ sensors }) {
  const [history, setHistory] = useState({});

  useEffect(() => {
    if (!sensors?.length) return;
    setHistory(prev => {
      const next = { ...prev };
      for (const s of sensors) {
        const key = s.sensorId;
        if (!next[key]) next[key] = [];
        next[key] = [...next[key].slice(-19), { value: s.value, time: new Date().toLocaleTimeString() }];
      }
      return next;
    });
  }, [sensors]);

  const [selected, setSelected] = useState('all');
  const types = [...new Set(sensors?.map(s => s.type) || [])];

  const buildDataset = (sensorId, type, values) => ({
    label: sensorId,
    data: values.map(v => v.value),
    borderColor: SENSOR_COLORS[type] || '#6b7280',
    backgroundColor: (SENSOR_COLORS[type] || '#6b7280') + '20',
    fill: false, tension: 0.4, pointRadius: 2, borderWidth: 2,
  });

  const labels = Object.values(history)[0]?.map(v => v.time) || [];
  const datasets = Object.entries(history).filter(([sid]) => {
    if (selected === 'all') return true;
    const s = sensors?.find(s => s.sensorId === sid);
    return s?.type === selected;
  }).map(([sid, vals]) => {
    const s = sensors?.find(s => s.sensorId === sid);
    return buildDataset(sid, s?.type, vals);
  });

  const options = {
    responsive: true, maintainAspectRatio: false, animation: { duration: 300 },
    scales: {
      x: { ticks: { color: '#6b7280', maxTicksLimit: 6, font: { size: 10 } }, grid: { color: '#1f2937' } },
      y: { ticks: { color: '#6b7280', font: { size: 10 } }, grid: { color: '#1f2937' } },
    },
    plugins: { legend: { labels: { color: '#9ca3af', font: { size: 10 }, boxWidth: 12 } } },
  };

  return (
    <div>
      <div className="flex gap-2 mb-3 flex-wrap">
        <button onClick={() => setSelected('all')} className={`text-xs px-2 py-1 rounded-full transition-colors ${selected === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400'}`}>All</button>
        {types.map(t => (
          <button key={t} onClick={() => setSelected(t)} className={`text-xs px-2 py-1 rounded-full transition-colors ${selected === t ? 'text-white' : 'bg-gray-800 text-gray-400'}`} style={selected === t ? { background: SENSOR_COLORS[t] } : {}}>
            {t}
          </button>
        ))}
      </div>
      <div style={{ height: 200 }}>
        <Line data={{ labels, datasets }} options={options} />
      </div>
    </div>
  );
}
