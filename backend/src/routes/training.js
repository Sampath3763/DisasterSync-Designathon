import { Router } from 'express';
import { trainingModules } from '../data/mockData.js';

const router = Router();

router.get('/', (req, res) => {
  let result = [...trainingModules];
  if (req.query.category) result = result.filter(t => t.category === req.query.category);
  if (req.query.level) result = result.filter(t => t.level === req.query.level);
  if (req.query.targetRole && req.query.targetRole !== 'all') result = result.filter(t => t.targetRole === 'all' || t.targetRole === req.query.targetRole);
  res.json(result);
});

router.get('/:id', (req, res) => {
  const mod = trainingModules.find(t => t.id === req.params.id);
  if (!mod) return res.status(404).json({ error: 'Training module not found' });
  res.json(mod);
});

export default router;
