import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { equipment } from '../data/mockData.js';

const router = Router();

router.get('/', (req, res) => {
  let result = [...equipment];
  if (req.query.status) result = result.filter(e => e.status === req.query.status);
  if (req.query.type) result = result.filter(e => e.type === req.query.type);
  res.json(result);
});

router.post('/', (req, res) => {
  const newEq = { id: uuidv4(), ...req.body };
  equipment.push(newEq);
  res.status(201).json(newEq);
});

router.put('/:id', (req, res) => {
  const idx = equipment.findIndex(e => e.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Equipment not found' });
  equipment[idx] = { ...equipment[idx], ...req.body };
  res.json(equipment[idx]);
});

router.get('/summary', (req, res) => {
  res.json({
    total: equipment.length,
    available: equipment.filter(e => e.status === 'available').reduce((s, e) => s + e.available, 0),
    inUse: equipment.filter(e => e.status === 'in_use').length,
    maintenance: equipment.filter(e => e.status === 'maintenance').length,
    byType: equipment.reduce((acc, e) => { acc[e.type] = (acc[e.type] || 0) + 1; return acc; }, {}),
  });
});

export default router;
