import express from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import authRouter from './routes/auth.js';
import alertsRouter from './routes/alerts.js';
import sensorsRouter from './routes/sensors.js';
import resourcesRouter from './routes/resources.js';
import teamsRouter from './routes/teams.js';
import equipmentRouter from './routes/equipment.js';
import messagesRouter from './routes/messages.js';
import trainingRouter from './routes/training.js';
import riskRouter from './routes/risk.js';
import notificationsRouter from './routes/notifications.js';
import { updateSensorReadings } from './services/sensorSimulator.js';

const app = express();
const server = createServer(app);

app.use(cors({ origin: '*' }));
app.use(express.json());

// Global broadcast function (set after WSS init)
let wssInstance = null;
app.locals.broadcast = (data) => {
  if (!wssInstance) return;
  const msg = JSON.stringify(data);
  wssInstance.clients.forEach(client => { if (client.readyState === 1) client.send(msg); });
};

// Routes
app.use('/api/auth', authRouter);
app.use('/api/alerts', alertsRouter);
app.use('/api/sensors', sensorsRouter);
app.use('/api/resources', resourcesRouter);
app.use('/api/teams', teamsRouter);
app.use('/api/equipment', equipmentRouter);
app.use('/api/messages', messagesRouter);
app.use('/api/training', trainingRouter);
app.use('/api/risk', riskRouter);
app.use('/api/notifications', notificationsRouter);

app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// WebSocket Server
const wss = new WebSocketServer({ server });
wssInstance = wss;

wss.on('connection', (ws, req) => {
  console.log('New WebSocket connection');
  ws.send(JSON.stringify({ event: 'connected', data: { message: 'Connected to Disaster Response Platform', timestamp: new Date().toISOString() } }));
  ws.on('message', (raw) => {
    try {
      const msg = JSON.parse(raw.toString());
      // Echo team messages to all clients
      if (msg.event === 'team_message') {
        app.locals.broadcast(msg);
      }
    } catch {}
  });
  ws.on('close', () => console.log('WebSocket disconnected'));
});

// Sensor simulation interval (every 5 seconds)
setInterval(() => {
  updateSensorReadings(app.locals.broadcast);
}, 5000);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`Disaster Response Backend running on port ${PORT}`));
