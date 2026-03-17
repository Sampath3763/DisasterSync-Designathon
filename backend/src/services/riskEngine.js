import { alerts, sensorData, riskZones, resources } from '../data/mockData.js';

const SENSOR_WEIGHTS = { temperature: 0.2, gas: 0.3, seismic: 0.35, water_level: 0.25, air_quality: 0.15 };
const ALERT_FREQUENCY_WEIGHT = 0.3;
const SATELLITE_WEIGHT = 0.3;

function getSensorRiskByRegion() {
  const regionRisk = {};
  for (const sensor of sensorData) {
    const region = sensor.region;
    const normalizedValue = (sensor.value / sensor.threshold) * 100;
    const weight = SENSOR_WEIGHTS[sensor.type] || 0.2;
    if (!regionRisk[region]) regionRisk[region] = { totalScore: 0, count: 0, sensors: [] };
    regionRisk[region].totalScore += normalizedValue * weight;
    regionRisk[region].count += 1;
    regionRisk[region].sensors.push({ type: sensor.type, value: sensor.value, threshold: sensor.threshold, status: sensor.status });
  }
  return regionRisk;
}

function getAlertFrequencyRisk() {
  const last24h = new Date(Date.now() - 86400000);
  const recentAlerts = alerts.filter(a => new Date(a.timestamp) > last24h && a.status !== 'resolved');
  const frequencyScore = Math.min(recentAlerts.length * 15, 100);
  return { score: frequencyScore, count: recentAlerts.length, activeAlerts: recentAlerts.map(a => ({ id: a.id, type: a.type, severity: a.severity })) };
}

function getSatelliteRisk() {
  const riskScores = { low: 20, medium: 50, high: 75, critical: 95 };
  return riskZones.features.map(f => ({ id: f.properties.id, name: f.properties.name, risk: f.properties.risk, score: riskScores[f.properties.risk] || 0, type: f.properties.type }));
}

export function calculateRiskScore() {
  const sensorRisk = getSensorRiskByRegion();
  const alertRisk = getAlertFrequencyRisk();
  const satelliteRisk = getSatelliteRisk();

  const avgSensorScore = Object.values(sensorRisk).reduce((sum, r) => sum + (r.totalScore / Math.max(r.count, 1)), 0) / Math.max(Object.keys(sensorRisk).length, 1);
  const avgSatelliteScore = satelliteRisk.reduce((sum, r) => sum + r.score, 0) / Math.max(satelliteRisk.length, 1);
  const overallScore = (avgSensorScore * 0.4) + (alertRisk.score * ALERT_FREQUENCY_WEIGHT) + (avgSatelliteScore * SATELLITE_WEIGHT);
  const clampedScore = Math.min(Math.round(overallScore), 100);

  let riskLevel;
  if (clampedScore <= 30) riskLevel = 'LOW';
  else if (clampedScore <= 60) riskLevel = 'MEDIUM';
  else riskLevel = 'HIGH';

  const recommendations = [];
  if (clampedScore >= 70) recommendations.push('Activate emergency response protocol immediately');
  if (alertRisk.count >= 3) recommendations.push('Multiple active alerts — consider unified command structure');
  const criticalSensors = sensorData.filter(s => s.status === 'critical');
  if (criticalSensors.length > 0) recommendations.push(`${criticalSensors.length} sensor(s) at critical levels — immediate inspection required`);

  return {
    overallScore: clampedScore, riskLevel, timestamp: new Date().toISOString(),
    breakdown: { sensorScore: Math.round(avgSensorScore), alertFrequencyScore: alertRisk.score, satelliteScore: Math.round(avgSatelliteScore) },
    regionRisk: sensorRisk, alertRisk, satelliteRisk, recommendations,
    activeAlerts: alerts.filter(a => a.status === 'active').length,
    criticalSensors: sensorData.filter(s => s.status === 'critical').length,
  };
}

export function calculateRouteDistance(from, to) {
  const R = 6371;
  const dLat = (to.lat - from.lat) * Math.PI / 180;
  const dLng = (to.lng - from.lng) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(from.lat * Math.PI / 180) * Math.cos(to.lat * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function findOptimalResource(alertId) {
  const alert = alerts.find(a => a.id === alertId);
  if (!alert) return null;
  const available = resources.filter(r => r.status === 'available');
  if (available.length === 0) return null;
  return available.map(r => ({ ...r, distance: calculateRouteDistance(r.location, alert.location) })).sort((a, b) => a.distance - b.distance)[0];
}
