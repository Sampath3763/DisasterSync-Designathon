import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { messages, notifications } from '../data/mockData.js';

const router = Router();

router.get('/', (req, res) => {
  let result = [...messages];
  if (req.query.team) result = result.filter(m => m.fromTeam === req.query.team || m.toTeam === req.query.team || m.toTeam === null);
  res.json(result.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
});

router.post('/', (req, res) => {
  const { from, fromName, fromTeam, toTeam, content, type, priority } = req.body;
  if (!content) return res.status(400).json({ error: 'Content required' });
  const newMsg = {
    id: uuidv4(), from, fromName, fromTeam: fromTeam || null, to: null,
    toTeam: toTeam || null, content, timestamp: new Date().toISOString(),
    type: type || 'message', priority: priority || 'normal', read: false,
  };
  messages.push(newMsg);
  if (type === 'support_request') {
    const notif = { id: uuidv4(), type: 'support_request', title: `Support Request from ${fromTeam || fromName}`, message: content, timestamp: new Date().toISOString(), read: false, priority: 'urgent' };
    notifications.push(notif);
    req.app.locals.broadcast({ event: 'notification', data: notif });
  }
  req.app.locals.broadcast({ event: 'team_message', data: newMsg });
  res.status(201).json(newMsg);
});

router.put('/:id/read', (req, res) => {
  const msg = messages.find(m => m.id === req.params.id);
  if (!msg) return res.status(404).json({ error: 'Message not found' });
  msg.read = true;
  res.json(msg);
});

export default router;
