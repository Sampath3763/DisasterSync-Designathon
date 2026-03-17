import { Router } from 'express';
import { rescueTeams, notifications } from '../data/mockData.js';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

router.get('/', (req, res) => {
  let result = [...rescueTeams];
  if (req.query.status) result = result.filter(t => t.status === req.query.status);
  if (req.query.type) result = result.filter(t => t.type === req.query.type);
  res.json(result);
});

router.get('/:id', (req, res) => {
  const team = rescueTeams.find(t => t.id === req.params.id);
  if (!team) return res.status(404).json({ error: 'Team not found' });
  res.json(team);
});

router.put('/:id/status', (req, res) => {
  const team = rescueTeams.find(t => t.id === req.params.id);
  if (!team) return res.status(404).json({ error: 'Team not found' });
  const { status, currentTask } = req.body;
  team.status = status;
  if (currentTask !== undefined) team.currentTask = currentTask;
  req.app.locals.broadcast({ event: 'team_status_change', data: team });
  res.json(team);
});

export default router;
