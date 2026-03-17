import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function AlertsBarChart({ alerts }) {
  const types = ['flood', 'earthquake', 'wildfire', 'gas_leak', 'tsunami', 'landslide'];
  const severities = ['low', 'medium', 'high', 'critical'];
  const colors = { low: '#22c55e', medium: '#f59e0b', high: '#ef4444', critical: '#7c3aed' };

  const datasets = severities.map(sev => ({
    label: sev.charAt(0).toUpperCase() + sev.slice(1),
    data: types.map(t => alerts.filter(a => a.type === t && a.severity === sev).length),
    backgroundColor: colors[sev] + 'cc',
    borderColor: colors[sev],
    borderWidth: 1, borderRadius: 4,
  }));

  const options = {
    responsive: true, maintainAspectRatio: false,
    scales: {
      x: { stacked: true, ticks: { color: '#9ca3af', font: { size: 10 } }, grid: { display: false } },
      y: { stacked: true, ticks: { color: '#9ca3af', font: { size: 10 } }, grid: { color: '#1f2937' } },
    },
    plugins: { legend: { labels: { color: '#9ca3af', font: { size: 10 }, boxWidth: 12 } } },
  };

  return <div style={{ height: 200 }}><Bar data={{ labels: types, datasets }} options={options} /></div>;
}
