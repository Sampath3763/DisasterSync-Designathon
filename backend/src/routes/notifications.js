import { Router } from 'express';
import { notifications } from '../data/mockData.js';

const router = Router();

router.get('/', (req, res) => {
  res.json(notifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
});

router.put('/:id/read', (req, res) => {
  const notif = notifications.find(n => n.id === req.params.id);
  if (!notif) return res.status(404).json({ error: 'Notification not found' });
  notif.read = true;
  res.json(notif);
});

router.put('/read-all', (req, res) => {
  notifications.forEach(n => n.read = true);
  res.json({ success: true });
});

export default router;
