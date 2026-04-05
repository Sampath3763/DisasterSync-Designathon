import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { notifications } from '../data/mockData.js';
import { Alert } from '../models.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const query = {};
    if (req.query.status) query.status = req.query.status;
    if (req.query.type) query.type = req.query.type;
    if (req.query.severity) query.severity = req.query.severity;
    
    // Fetch real-time alerts from MongoDB instead of mock memory data
    const alertsList = await Alert.find(query).sort({ timestamp: -1 });
    
    // Map _id to id to match frontend expectation if needed, or just return directly
    const result = alertsList.map(a => {
      const doc = a.toObject();
      if (doc._id && !doc.id) doc.id = doc._id.toString();
      return doc;
    });
    
    res.json(result);
  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const alert = await Alert.findOne({ id: req.params.id }) || await Alert.findById(req.params.id).catch(() => null);
    if (!alert) return res.status(404).json({ error: 'Alert not found' });
    res.json(alert);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { type, location, severity, description, photoUrl, submittedBy } = req.body;
    if (!type || !location || !severity || !description) return res.status(400).json({ error: 'Missing required fields' });
    
    const newAlertData = {
      id: uuidv4(), type, location, severity, description, photoUrl: photoUrl || null,
      status: 'pending', submittedBy: submittedBy || 'anonymous', verifiedBy: null,
      timestamp: new Date().toISOString(), riskScore: 0, casualties: 0, affectedArea: 'TBD', resourcesAssigned: [],
    };
    
    const newAlert = await Alert.create(newAlertData);

    const notif = { id: uuidv4(), type: 'alert_created', title: `New Alert: ${type} - ${severity.toUpperCase()}`, message: `A new ${type} alert has been submitted. Awaiting verification.`, timestamp: new Date().toISOString(), read: false, priority: severity };
    notifications.push(notif);
    
    req.app.locals.broadcast({ event: 'alert_created', data: newAlert });
    req.app.locals.broadcast({ event: 'notification', data: notif });
    
    res.status(201).json(newAlert);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id/verify', async (req, res) => {
  try {
    const alert = await Alert.findOne({ id: req.params.id }) || await Alert.findById(req.params.id).catch(() => null);
    if (!alert) return res.status(404).json({ error: 'Alert not found' });
    
    const { verifiedBy, riskScore, casualties, affectedArea } = req.body;
    alert.status = 'verified';
    alert.verifiedBy = verifiedBy;
    if (riskScore !== undefined) alert.riskScore = riskScore;
    if (casualties !== undefined) alert.casualties = casualties;
    if (affectedArea) alert.affectedArea = affectedArea;
    
    await alert.save();
    req.app.locals.broadcast({ event: 'alert_verified', data: alert });
    res.json(alert);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id/activate', async (req, res) => {
  try {
    const alert = await Alert.findOne({ id: req.params.id }) || await Alert.findById(req.params.id).catch(() => null);
    if (!alert) return res.status(404).json({ error: 'Alert not found' });
    alert.status = 'active';
    await alert.save();
    req.app.locals.broadcast({ event: 'alert_verified', data: alert });
    res.json(alert);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id/resolve', async (req, res) => {
  try {
    const alert = await Alert.findOne({ id: req.params.id }) || await Alert.findById(req.params.id).catch(() => null);
    if (!alert) return res.status(404).json({ error: 'Alert not found' });
    alert.status = 'resolved';
    await alert.save();
    req.app.locals.broadcast({ event: 'alert_resolved', data: alert });
    res.json(alert);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id/reject', async (req, res) => {
  try {
    const alert = await Alert.findOne({ id: req.params.id }) || await Alert.findById(req.params.id).catch(() => null);
    if (!alert) return res.status(404).json({ error: 'Alert not found' });
    alert.status = 'rejected';
    await alert.save();
    res.json(alert);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const alert = await Alert.findOne({ id: req.params.id }) || await Alert.findById(req.params.id).catch(() => null);
    if (!alert) return res.status(404).json({ error: 'Alert not found' });
    await Alert.deleteOne({ _id: alert._id });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
