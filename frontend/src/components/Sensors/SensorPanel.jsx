import React, { useEffect, useState } from 'react';
import { useWebSocket } from '../../contexts/WebSocketContext';
import api from '../../services/api';

const TYPE_ICONS = { temperature: '🌡️', gas: '☣️', seismic: '📡', water_level: '🌊', air_quality: '💨' };
const STATUS_STYLES = {
  normal: 'bg-green-900/40 border-green-800 text-green-400',
  warning: 'bg-yellow-900/40 border-yellow-800 text-yellow-400',
  critical: 'bg-red-900/40 border-red-800 text-red-400 animate-pulse',
};

export default function SensorPanel() {
  const [sensors, setSensors] = useState([]);
  const { on } = useWebSocket();

  useEffect(() => {
    api.get('/sensors').then(res => setSensors(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    const unsub = on('sensor_update', (data) => {
      setSensors(prev => prev.map(s => s.id === data.id ? { ...s, ...data } : s));
    });
    return unsub;
  }, [on]);

  const critical = sensors.filter(s => s.status === 'critical').length;
  const warning = sensors.filter(s => s.status === 'warning').length;

  return (
    <div>
      {/* Summary badges */}
      <div className="flex gap-2 mb-3 text-xs">
        <span className="bg-red-900/50 border border-red-800 text-red-400 px-2 py-1 rounded-full">{critical} Critical</span>
        <span className="bg-yellow-900/50 border border-yellow-800 text-yellow-400 px-2 py-1 rounded-full">{warning} Warning</span>
        <span className="bg-green-900/50 border border-green-800 text-green-400 px-2 py-1 rounded-full">{sensors.length - critical - warning} Normal</span>
      </div>

      <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
        {sensors.map(sensor => {
          const pct = Math.min((sensor.value / sensor.threshold) * 100, 100);
          return (
            <div key={sensor.id} className={`border rounded-lg p-3 ${STATUS_STYLES[sensor.status] || STATUS_STYLES.normal}`}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span>{TYPE_ICONS[sensor.type] || '📡'}</span>
                  <span className="text-xs font-medium">{sensor.sensorId}</span>
                  <span className="text-xs text-gray-500">{sensor.region}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold">{sensor.value}</span>
                  <span className="text-xs ml-1">{sensor.unit}</span>
                </div>
              </div>
              {/* Progress bar */}
              <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${pct}%`, background: sensor.status === 'critical' ? '#ef4444' : sensor.status === 'warning' ? '#f59e0b' : '#22c55e' }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>{sensor.type}</span>
                <span>Threshold: {sensor.threshold} {sensor.unit}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
