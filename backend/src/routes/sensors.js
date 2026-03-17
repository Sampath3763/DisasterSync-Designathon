import { Router } from 'express';
import { sensorData } from '../data/mockData.js';

const router = Router();

router.get('/', (req, res) => {
  let result = [...sensorData];
  if (req.query.type) result = result.filter(s => s.type === req.query.type);
  if (req.query.status) result = result.filter(s => s.status === req.query.status);
  if (req.query.region) result = result.filter(s => s.region === req.query.region);
  res.json(result);
});

router.get('/summary', (req, res) => {
  const summary = {
    total: sensorData.length,
    normal: sensorData.filter(s => s.status === 'normal').length,
    warning: sensorData.filter(s => s.status === 'warning').length,
    critical: sensorData.filter(s => s.status === 'critical').length,
    byType: {},
  };
  for (const s of sensorData) {
    if (!summary.byType[s.type]) summary.byType[s.type] = { count: 0, warning: 0, critical: 0 };
    summary.byType[s.type].count++;
    if (s.status === 'warning') summary.byType[s.type].warning++;
    if (s.status === 'critical') summary.byType[s.type].critical++;
  }
  res.json(summary);
});

router.get('/geojson', (req, res) => {
  res.json({
    type: 'FeatureCollection',
    features: sensorData.map(s => ({
      type: 'Feature',
      properties: { ...s },
      geometry: { type: 'Point', coordinates: [s.location.lng, s.location.lat] },
    })),
  });
});

router.get('/:id', (req, res) => {
  const sensor = sensorData.find(s => s.id === req.params.id || s.sensorId === req.params.id);
  if (!sensor) return res.status(404).json({ error: 'Sensor not found' });
  res.json(sensor);
});

export default router;
