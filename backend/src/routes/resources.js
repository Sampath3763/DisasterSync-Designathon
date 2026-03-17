import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { resources, alerts, notifications } from '../data/mockData.js';
import { calculateRouteDistance } from '../services/riskEngine.js';

const router = Router();

router.get('/', (req, res) => {
  let result = [...resources];
  if (req.query.status) result = result.filter(r => r.status === req.query.status);
  if (req.query.type) result = result.filter(r => r.type === req.query.type);
  res.json(result);
});

router.post('/', (req, res) => {
  const newResource = { id: uuidv4(), ...req.body, lastUpdate: new Date().toISOString() };
  resources.push(newResource);
  res.status(201).json(newResource);
});

router.put('/:id', (req, res) => {
  const idx = resources.findIndex(r => r.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Resource not found' });
  resources[idx] = { ...resources[idx], ...req.body, lastUpdate: new Date().toISOString() };
  res.json(resources[idx]);
});

router.put('/:id/assign', (req, res) => {
  const { alertId } = req.body;
  const resource = resources.find(r => r.id === req.params.id);
  const alert = alerts.find(a => a.id === alertId);
  if (!resource) return res.status(404).json({ error: 'Resource not found' });
  if (!alert) return res.status(404).json({ error: 'Alert not found' });
  resource.status = 'deployed';
  resource.assignedTo = alertId;
  resource.location = { ...alert.location };
  resource.lastUpdate = new Date().toISOString();
  if (!alert.resourcesAssigned.includes(resource.id)) alert.resourcesAssigned.push(resource.id);
  const notif = { id: uuidv4(), type: 'resource_assigned', title: `Resource Deployed: ${resource.name}`, message: `${resource.name} assigned to ${alert.type} alert at ${alert.location.address}.`, timestamp: new Date().toISOString(), read: false, priority: 'normal' };
  notifications.push(notif);
  req.app.locals.broadcast({ event: 'resource_assigned', data: { resource, alert } });
  req.app.locals.broadcast({ event: 'notification', data: notif });
  res.json(resource);
});

router.put('/:id/release', (req, res) => {
  const resource = resources.find(r => r.id === req.params.id);
  if (!resource) return res.status(404).json({ error: 'Resource not found' });
  resource.status = 'available';
  resource.assignedTo = null;
  resource.lastUpdate = new Date().toISOString();
  res.json(resource);
});

router.get('/optimal/:alertId', (req, res) => {
  const alert = alerts.find(a => a.id === req.params.alertId);
  if (!alert) return res.status(404).json({ error: 'Alert not found' });
  const available = resources.filter(r => r.status === 'available');
  const ranked = available.map(r => ({ ...r, distance: parseFloat(calculateRouteDistance(r.location, alert.location).toFixed(2)) })).sort((a, b) => a.distance - b.distance);
  res.json(ranked);
});

router.get('/route/:resourceId/:alertId', (req, res) => {
  const resource = resources.find(r => r.id === req.params.resourceId);
  const alert = alerts.find(a => a.id === req.params.alertId);
  if (!resource || !alert) return res.status(404).json({ error: 'Resource or alert not found' });
  const dist = calculateRouteDistance(resource.location, alert.location);
  const midLat = (resource.location.lat + alert.location.lat) / 2;
  const midLng = (resource.location.lng + alert.location.lng) / 2;
  const waypoints = [resource.location, { lat: midLat + 0.01, lng: midLng + 0.01 }, alert.location];
  res.json({ from: resource.location, to: alert.location, distance: parseFloat(dist.toFixed(2)), estimatedTime: Math.round(dist / 60 * 60), waypoints });
});

export default router;
