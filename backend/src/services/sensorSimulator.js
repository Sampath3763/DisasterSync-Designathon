import { sensorData, alerts, notifications } from '../data/mockData.js';
import { v4 as uuidv4 } from 'uuid';

const SENSOR_RANGES = {
  temperature: { min: 25, max: 75, threshold: 50, unit: '°C' },
  gas: { min: 50, max: 600, threshold: 400, unit: 'ppm' },
  seismic: { min: 0.1, max: 7.0, threshold: 5.0, unit: 'Richter' },
  water_level: { min: 0.5, max: 15, threshold: 10, unit: 'meters' },
  air_quality: { min: 50, max: 350, threshold: 200, unit: 'AQI' },
};

function randomInRange(min, max, current, drift = 0.1) {
  const change = (Math.random() - 0.5) * 2 * drift * (max - min);
  return Math.max(min, Math.min(max, current + change));
}

export function updateSensorReadings(broadcast) {
  const updates = [];
  for (const sensor of sensorData) {
    const range = SENSOR_RANGES[sensor.type];
    if (!range) continue;
    const newValue = parseFloat(randomInRange(range.min, range.max, sensor.value, 0.08).toFixed(2));
    const prevStatus = sensor.status;
    sensor.value = newValue;
    sensor.timestamp = new Date().toISOString();
    if (newValue >= range.threshold * 1.2) sensor.status = 'critical';
    else if (newValue >= range.threshold * 0.8) sensor.status = 'warning';
    else sensor.status = 'normal';

    if (prevStatus !== 'critical' && sensor.status === 'critical') {
      const notif = {
        id: uuidv4(), type: 'sensor_critical',
        title: `CRITICAL: ${sensor.sensorId} Alert`,
        message: `Sensor ${sensor.sensorId} (${sensor.type}) reached critical level: ${newValue} ${sensor.unit}`,
        timestamp: new Date().toISOString(), read: false, priority: 'critical',
      };
      notifications.push(notif);
      if (broadcast) broadcast({ event: 'notification', data: notif });
    }
    updates.push({ ...sensor });
    if (broadcast) broadcast({ event: 'sensor_update', data: { ...sensor } });
  }
  return updates;
}
