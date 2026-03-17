# DisasterSync — Smart Disaster Response Coordination Platform

A full-stack prototype demonstrating real-time multi-source data integration for disaster response coordination.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite, TailwindCSS, React-Leaflet, Chart.js |
| Backend | Node.js 20, Express 4, WebSocket (ws) |
| Maps | Leaflet.js with CartoDB dark tiles + GeoJSON overlays |
| Real-time | WebSocket (bidirectional, auto-reconnect) |
| Database | In-memory mock data (JSON objects) |

---

## Quick Start

### Option 1: Docker (Recommended)

```bash
git clone <repo>
cd Designathon
docker-compose up --build
```

- Frontend → http://localhost:5173
- Backend API → http://localhost:3001/api
- WebSocket → ws://localhost:3001

### Option 2: Local Development

**Backend:**
```bash
cd backend
npm install
npm run dev
```

**Frontend** (new terminal):
```bash
cd frontend
npm install
npm run dev
```

---

## Demo Credentials

| Role | Username | Password | Access |
|---|---|---|---|
| Admin | `admin` | `admin123` | Full access, resource allocation |
| Safety Team | `safety1` | `safety123` | Alert verification, team coordination |
| Field Team | `field1` | `field123` | Messaging, status updates |
| Citizen | `user1` | `user123` | Alert submission, training |

---

## Features

### 1. GIS Interactive Dashboard
- Dark CartoDB tile base map centered on India
- Color-coded disaster alert markers (severity-based)
- GeoJSON risk zone polygons (flood, earthquake, wildfire, gas leak zones)
- Real-time IoT sensor markers with status glow
- Resource position markers with type icons
- Layer toggle: Risk Zones / Sensors / Resources
- Filter by disaster type, severity, and status

### 2. Satellite / Geospatial Data
- Simulated GeoJSON risk zones with LOW/MEDIUM/HIGH/CRITICAL risk levels
- Four pre-defined zones: Delhi Flood Zone, Mumbai Seismic Zone, Bangalore Wildfire Risk, Kolkata Industrial Zone

### 3. IoT Sensor Simulation
- 8 live sensors: temperature, gas (ppm), seismic (Richter), water level, air quality
- Backend generates realistic drift every **5 seconds**
- WebSocket push to frontend — no polling needed
- Threshold-based status: `normal → warning → critical`
- Critical state triggers automatic notification broadcast

### 4. Crowd-Sourced Alert System
- Submit form with type, severity, GPS coordinates, description, photo URL
- Safety team moderation queue (Verify / Reject)
- Broadcast verified alerts to all connected clients via WebSocket
- Full alert lifecycle: `pending → verified → active → resolved`

### 5. Risk Analysis Engine
- Combines three data sources:
  - IoT sensor readings (40% weight)
  - Alert frequency in last 24h (30% weight)
  - Satellite zone risk scores (30% weight)
- Outputs: score 0–100, risk level LOW/MEDIUM/HIGH
- Auto-generated recommendations for high-risk scenarios
- Visual gauge chart + breakdown bars

### 6. Resource Tracking
- 10 pre-loaded resources: rescue teams, ambulances, drones, helicopters, supply depots
- Assign to active alerts, release back to pool
- Capacity tracking with visual progress bars

### 7. Optimal Rescue Route Finder
- Haversine formula calculates straight-line distance from resource to alert
- Ranks all available resources by proximity
- Returns waypoints + estimated travel time
- One-click assign closest available resource

### 8. Equipment Usage Monitoring
- Equipment inventory with availability tracking
- Condition monitoring: excellent / good / fair / needs_repair
- Usage hours bar chart + type distribution doughnut chart
- Role-gated status updates (admin/safety team only)

### 9. Training Module
- 5 training modules: Flood Response, Earthquake Safety, Wildfire Protocols, First Aid, Communications
- Content sections with video placeholder
- Browser-local completion tracking
- Filter by category (preparedness/safety/protocols) and level (beginner/intermediate/advanced)

### 10. Inter-Team Communication
- Fire, Medical, Flood, and Earthquake response teams
- Message types: regular message / support request (SOS) / status update
- Priority flag for urgent messages
- Enter-to-send with Shift+Enter for newline
- WebSocket real-time delivery — no refresh needed
- Team "Mark Available" button for task completion handoff
- Coordination panel: team readiness overview, support request queue, quick ping buttons

### 11. Notification System
- WebSocket-pushed notifications for all major events
- Priority levels: critical, urgent, high, normal — color-coded left borders
- Bell icon with unread count badge in navbar
- Mark individual or all-read
- Auto-populated from: sensor critical events, new alerts, resource assignments, support requests

---

## Project Structure

```
Designathon/
├── docker-compose.yml
├── shared/
│   └── constants.js              # Shared enums/constants
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   └── src/
│       ├── index.js              # Express server + WebSocket + sensor simulation loop
│       ├── data/
│       │   └── mockData.js       # All in-memory data (users, alerts, sensors, resources, etc.)
│       ├── routes/
│       │   ├── auth.js           # POST /login, GET /me, GET /users
│       │   ├── alerts.js         # CRUD + verify/activate/resolve/reject
│       │   ├── sensors.js        # GET list/summary/geojson
│       │   ├── resources.js      # CRUD + assign/release/optimal/route
│       │   ├── teams.js          # GET list/detail + PUT status
│       │   ├── equipment.js      # CRUD + summary
│       │   ├── messages.js       # GET/POST messages + mark read
│       │   ├── training.js       # GET modules
│       │   ├── risk.js           # GET overall risk score + GeoJSON zones
│       │   └── notifications.js  # GET notifications + mark read
│       └── services/
│           ├── riskEngine.js     # Risk scoring (sensor + alert + satellite)
│           └── sensorSimulator.js # Realistic drift simulation + critical alerts
└── frontend/
    ├── Dockerfile
    ├── nginx.conf
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    └── src/
        ├── App.jsx               # Routes + protected routes
        ├── main.jsx
        ├── index.css             # Tailwind + component utilities
        ├── contexts/
        │   ├── AuthContext.jsx   # Login/logout + localStorage persistence
        │   ├── WebSocketContext.jsx  # Auto-reconnect WS client + event bus
        │   └── NotificationContext.jsx
        ├── services/
        │   └── api.js            # Axios instance with auth interceptor
        ├── components/
        │   ├── Layout/           # Layout, Sidebar, Navbar
        │   ├── Map/              # DisasterMap (Leaflet)
        │   ├── Charts/           # RiskGauge, SensorChart, AlertsBarChart
        │   ├── Sensors/          # SensorPanel (live WebSocket)
        │   └── Notifications/    # NotificationPanel
        └── pages/
            ├── LoginPage.jsx
            ├── Dashboard.jsx
            ├── AlertSubmission.jsx
            ├── ResourceManagement.jsx
            ├── EquipmentUsage.jsx
            ├── TrainingModule.jsx
            └── TeamCommunication.jsx
```

---

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Authenticate user |
| GET | `/api/auth/me` | Get current user |
| GET | `/api/alerts` | List alerts (filter: status, type, severity) |
| POST | `/api/alerts` | Submit new alert |
| PUT | `/api/alerts/:id/verify` | Verify pending alert |
| PUT | `/api/alerts/:id/resolve` | Resolve active alert |
| GET | `/api/sensors` | List all sensors |
| GET | `/api/sensors/summary` | Sensor status summary |
| GET | `/api/resources` | List resources |
| PUT | `/api/resources/:id/assign` | Assign to alert |
| GET | `/api/resources/optimal/:alertId` | Find closest resources |
| GET | `/api/resources/route/:resId/:alertId` | Get route details |
| GET | `/api/teams` | List rescue teams |
| PUT | `/api/teams/:id/status` | Update team status |
| GET | `/api/equipment` | List equipment |
| GET | `/api/messages` | Get messages (filter by team) |
| POST | `/api/messages` | Send message |
| GET | `/api/risk` | Get risk analysis |
| GET | `/api/risk/zones` | Get GeoJSON risk zones |
| GET | `/api/notifications` | Get notifications |
| GET | `/api/health` | Health check |

## WebSocket Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `connected` | Server → Client | Initial connection confirmation |
| `sensor_update` | Server → Client | Every 5s: updated sensor reading |
| `alert_created` | Server → Client | New alert submitted |
| `alert_verified` | Server → Client | Alert verified/activated |
| `alert_resolved` | Server → Client | Alert resolved |
| `resource_assigned` | Server → Client | Resource deployed to incident |
| `team_message` | Bidirectional | Inter-team message broadcast |
| `team_status_change` | Server → Client | Team status updated |
| `notification` | Server → Client | Any notification event |
