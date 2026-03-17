import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const getRiskColor = (score) => {
  if (score <= 30) return { main: '#22c55e', bg: '#166534' };
  if (score <= 60) return { main: '#f59e0b', bg: '#78350f' };
  return { main: '#ef4444', bg: '#7f1d1d' };
};

export default function RiskGauge({ score = 0, label = 'Overall Risk' }) {
  const { main, bg } = getRiskColor(score);
  const data = {
    datasets: [{ data: [score, 100 - score], backgroundColor: [main, '#1f2937'], borderWidth: 0, circumference: 270, rotation: 225 }],
  };
  const options = { cutout: '75%', plugins: { legend: { display: false }, tooltip: { enabled: false } }, animation: { animateRotate: true, duration: 1000 } };

  return (
    <div className="relative flex flex-col items-center">
      <div className="relative" style={{ width: 160, height: 130 }}>
        <Doughnut data={data} options={options} />
        <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ top: '10%' }}>
          <span className="text-3xl font-bold" style={{ color: main }}>{score}</span>
          <span className="text-xs text-gray-400">/100</span>
        </div>
      </div>
      <span className="text-sm text-gray-400 mt-1">{label}</span>
    </div>
  );
}
