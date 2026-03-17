import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { alerts, notifications } from '../data/mockData.js';

const router = Router();

router.get('/', (req, res) => {
  let result = [...alerts];
  if (req.query.status) result = result.filter(a => a.status === req.query.status);
  if (req.query.type) result = result.filter(a => a.type === req.query.type);
  if (req.query.severity) result = result.filter(a => a.severity === req.query.severity);
  res.json(result.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
});

router.get('/:id', (req, res) => {
  const alert = alerts.find(a => a.id === req.params.id);
  if (!alert) return res.status(404).json({ error: 'Alert not found' });
  res.json(alert);
});

router.post('/', (req, res) => {
  const { type, location, severity, description, photoUrl, submittedBy } = req.body;
  if (!type || !location || !severity || !description) return res.status(400).json({ error: 'Missing required fields' });
  const newAlert = {
    id: uuidv4(), type, location, severity, description, photoUrl: photoUrl || null,
    status: 'pending', submittedBy: submittedBy || 'anonymous', verifiedBy: null,
    timestamp: new Date().toISOString(), riskScore: 0, casualties: 0, affectedArea: 'TBD', resourcesAssigned: [],
  };
  alerts.push(newAlert);
  const notif = { id: uuidv4(), type: 'alert_created', title: `New Alert: ${type} - ${severity.toUpperCase()}`, message: `A new ${type} alert has been submitted. Awaiting verification.`, timestamp: new Date().toISOString(), read: false, priority: severity };
  notifications.push(notif);
  req.app.locals.broadcast({ event: 'alert_created', data: newAlert });
  req.app.locals.broadcast({ event: 'notification', data: notif });
  res.status(201).json(newAlert);
});

router.put('/:id/verify', (req, res) => {
  const alert = alerts.find(a => a.id === req.params.id);
  if (!alert) return res.status(404).json({ error: 'Alert not found' });
  const { verifiedBy, riskScore, casualties, affectedArea } = req.body;
  alert.status = 'verified';
  alert.verifiedBy = verifiedBy;
  if (riskScore !== undefined) alert.riskScore = riskScore;
  if (casualties !== undefined) alert.casualties = casualties;
  if (affectedArea) alert.affectedArea = affectedArea;
  req.app.locals.broadcast({ event: 'alert_verified', data: alert });
  res.json(alert);
});

router.put('/:id/activate', (req, res) => {
  const alert = alerts.find(a => a.id === req.params.id);
  if (!alert) return res.status(404).json({ error: 'Alert not found' });
  alert.status = 'active';
  req.app.locals.broadcast({ event: 'alert_verified', data: alert });
  res.json(alert);
});

router.put('/:id/resolve', (req, res) => {
  const alert = alerts.find(a => a.id === req.params.id);
  if (!alert) return res.status(404).json({ error: 'Alert not found' });
  alert.status = 'resolved';
  req.app.locals.broadcast({ event: 'alert_resolved', data: alert });
  res.json(alert);
});

router.put('/:id/reject', (req, res) => {
  const alert = alerts.find(a => a.id === req.params.id);
  if (!alert) return res.status(404).json({ error: 'Alert not found' });
  alert.status = 'rejected';
  res.json(alert);
});

router.delete('/:id', (req, res) => {
  const idx = alerts.findIndex(a => a.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Alert not found' });
  alerts.splice(idx, 1);
  res.json({ success: true });
});

export default router;
