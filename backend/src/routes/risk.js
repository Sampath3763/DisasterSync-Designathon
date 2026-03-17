import { Router } from 'express';
import { calculateRiskScore } from '../services/riskEngine.js';
import { riskZones } from '../data/mockData.js';

const router = Router();

router.get('/', (req, res) => {
  const risk = calculateRiskScore();
  res.json(risk);
});

router.get('/zones', (req, res) => {
  res.json(riskZones);
});

export default router;
