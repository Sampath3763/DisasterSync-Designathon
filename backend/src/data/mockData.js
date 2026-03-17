import { v4 as uuidv4 } from 'uuid';

// USERS - various roles
export const users = [
  { id: 'u1', username: 'admin', password: 'admin123', role: 'admin', name: 'Admin Controller', email: 'admin@disaster.gov', team: null, avatar: 'AC' },
  { id: 'u2', username: 'safety1', password: 'safety123', role: 'safety_team', name: 'Sarah Mitchell', email: 'sarah@disaster.gov', team: 'fire', avatar: 'SM' },
  { id: 'u3', username: 'field1', password: 'field123', role: 'field_team', name: 'James Rodriguez', email: 'james@disaster.gov', team: 'flood', avatar: 'JR' },
  { id: 'u4', username: 'user1', password: 'user123', role: 'user', name: 'Maria Garcia', email: 'maria@citizen.com', team: null, avatar: 'MG' },
  { id: 'u5', username: 'medic1', password: 'medic123', role: 'field_team', name: 'Dr. Patel', email: 'patel@disaster.gov', team: 'medical', avatar: 'DP' },
];

// DISASTER ALERTS
export let alerts = [
  {
    id: 'a1', type: 'flood', location: { lat: 28.6139, lng: 77.2090, address: 'New Delhi, India' },
    severity: 'high', description: 'Flash flooding in residential areas. Multiple families trapped on rooftops.',
    status: 'active', submittedBy: 'u4', verifiedBy: 'u2', timestamp: new Date(Date.now() - 3600000).toISOString(),
    riskScore: 78, photoUrl: null, casualties: 12, affectedArea: '5 km²', resourcesAssigned: ['r1', 'r3'],
  },
  {
    id: 'a2', type: 'earthquake', location: { lat: 19.0760, lng: 72.8777, address: 'Mumbai, India' },
    severity: 'critical', description: 'Magnitude 6.2 earthquake. Several buildings collapsed in coastal area.',
    status: 'active', submittedBy: 'u3', verifiedBy: 'u2', timestamp: new Date(Date.now() - 7200000).toISOString(),
    riskScore: 92, photoUrl: null, casualties: 45, affectedArea: '12 km²', resourcesAssigned: ['r2', 'r4', 'r5'],
  },
  {
    id: 'a3', type: 'wildfire', location: { lat: 12.9716, lng: 77.5946, address: 'Bangalore, India' },
    severity: 'medium', description: 'Forest fire spreading towards residential area. Wind speed increasing.',
    status: 'verified', submittedBy: 'u4', verifiedBy: 'u2', timestamp: new Date(Date.now() - 1800000).toISOString(),
    riskScore: 55, photoUrl: null, casualties: 0, affectedArea: '8 km²', resourcesAssigned: ['r6'],
  },
  {
    id: 'a4', type: 'gas_leak', location: { lat: 22.5726, lng: 88.3639, address: 'Kolkata, India' },
    severity: 'high', description: 'Industrial gas leak reported. Evacuation of 500m radius underway.',
    status: 'pending', submittedBy: 'u4', verifiedBy: null, timestamp: new Date(Date.now() - 600000).toISOString(),
    riskScore: 68, photoUrl: null, casualties: 3, affectedArea: '2 km²', resourcesAssigned: [],
  },
  {
    id: 'a5', type: 'flood', location: { lat: 17.3850, lng: 78.4867, address: 'Hyderabad, India' },
    severity: 'low', description: 'Minor flooding in low-lying areas. Road connectivity affected.',
    status: 'resolved', submittedBy: 'u3', verifiedBy: 'u2', timestamp: new Date(Date.now() - 86400000).toISOString(),
    riskScore: 25, photoUrl: null, casualties: 0, affectedArea: '1 km²', resourcesAssigned: [],
  },
];

// SENSORS
export let sensorData = [
  { id: 's1', sensorId: 'TEMP-001', type: 'temperature', value: 42.5, unit: '°C', threshold: 50, status: 'warning', location: { lat: 28.6139, lng: 77.2090 }, region: 'Delhi', timestamp: new Date().toISOString() },
  { id: 's2', sensorId: 'GAS-001', type: 'gas', value: 320, unit: 'ppm', threshold: 400, status: 'warning', location: { lat: 22.5726, lng: 88.3639 }, region: 'Kolkata', timestamp: new Date().toISOString() },
  { id: 's3', sensorId: 'SEIS-001', type: 'seismic', value: 4.8, unit: 'Richter', threshold: 5.0, status: 'warning', location: { lat: 19.0760, lng: 72.8777 }, region: 'Mumbai', timestamp: new Date().toISOString() },
  { id: 's4', sensorId: 'WATER-001', type: 'water_level', value: 8.2, unit: 'meters', threshold: 10, status: 'warning', location: { lat: 28.6139, lng: 77.2090 }, region: 'Delhi', timestamp: new Date().toISOString() },
  { id: 's5', sensorId: 'TEMP-002', type: 'temperature', value: 38.1, unit: '°C', threshold: 50, status: 'normal', location: { lat: 12.9716, lng: 77.5946 }, region: 'Bangalore', timestamp: new Date().toISOString() },
  { id: 's6', sensorId: 'AIR-001', type: 'air_quality', value: 185, unit: 'AQI', threshold: 200, status: 'warning', location: { lat: 12.9716, lng: 77.5946 }, region: 'Bangalore', timestamp: new Date().toISOString() },
  { id: 's7', sensorId: 'WATER-002', type: 'water_level', value: 2.1, unit: 'meters', threshold: 10, status: 'normal', location: { lat: 17.3850, lng: 78.4867 }, region: 'Hyderabad', timestamp: new Date().toISOString() },
  { id: 's8', sensorId: 'GAS-002', type: 'gas', value: 150, unit: 'ppm', threshold: 400, status: 'normal', location: { lat: 13.0827, lng: 80.2707 }, region: 'Chennai', timestamp: new Date().toISOString() },
];

// RESOURCES
export let resources = [
  { id: 'r1', type: 'rescue_team', name: 'Alpha Rescue Unit', status: 'deployed', location: { lat: 28.6139, lng: 77.2090 }, assignedTo: 'a1', capacity: 8, currentLoad: 6, lastUpdate: new Date().toISOString() },
  { id: 'r2', type: 'ambulance', name: 'Ambulance AMB-12', status: 'deployed', location: { lat: 19.0760, lng: 72.8777 }, assignedTo: 'a2', capacity: 4, currentLoad: 4, lastUpdate: new Date().toISOString() },
  { id: 'r3', type: 'drone', name: 'Surveyor Drone DRN-04', status: 'deployed', location: { lat: 28.6500, lng: 77.2300 }, assignedTo: 'a1', capacity: 1, currentLoad: 1, lastUpdate: new Date().toISOString() },
  { id: 'r4', type: 'rescue_team', name: 'Bravo Rescue Unit', status: 'deployed', location: { lat: 19.0760, lng: 72.8777 }, assignedTo: 'a2', capacity: 10, currentLoad: 10, lastUpdate: new Date().toISOString() },
  { id: 'r5', type: 'helicopter', name: 'Rescue Chopper HC-02', status: 'deployed', location: { lat: 19.1000, lng: 72.9000 }, assignedTo: 'a2', capacity: 6, currentLoad: 4, lastUpdate: new Date().toISOString() },
  { id: 'r6', type: 'rescue_team', name: 'Charlie Fire Unit', status: 'deployed', location: { lat: 12.9716, lng: 77.5946 }, assignedTo: 'a3', capacity: 12, currentLoad: 8, lastUpdate: new Date().toISOString() },
  { id: 'r7', type: 'ambulance', name: 'Ambulance AMB-07', status: 'available', location: { lat: 13.0827, lng: 80.2707 }, assignedTo: null, capacity: 4, currentLoad: 0, lastUpdate: new Date().toISOString() },
  { id: 'r8', type: 'relief_supply', name: 'Supply Depot SD-A', status: 'available', location: { lat: 28.4595, lng: 77.0266 }, assignedTo: null, capacity: 500, currentLoad: 250, lastUpdate: new Date().toISOString() },
  { id: 'r9', type: 'drone', name: 'Cargo Drone DRN-09', status: 'available', location: { lat: 22.5726, lng: 88.3639 }, assignedTo: null, capacity: 2, currentLoad: 0, lastUpdate: new Date().toISOString() },
  { id: 'r10', type: 'rescue_team', name: 'Delta Medical Unit', status: 'available', location: { lat: 17.3850, lng: 78.4867 }, assignedTo: null, capacity: 8, currentLoad: 0, lastUpdate: new Date().toISOString() },
];

// RESCUE TEAMS
export let rescueTeams = [
  { id: 't1', name: 'Fire Response Team Alpha', type: 'fire', members: ['Sarah Mitchell', 'Tom Harris', 'Raj Kumar'], status: 'deployed', location: { lat: 12.9716, lng: 77.5946 }, currentTask: 'Wildfire suppression - Bangalore', expertise: ['wildfire', 'gas_leak'], contactFreq: '10min' },
  { id: 't2', name: 'Medical Response Team', type: 'medical', members: ['Dr. Patel', 'Nurse Chen', 'Dr. Sharma', 'Nurse Alex'], status: 'deployed', location: { lat: 19.0760, lng: 72.8777 }, currentTask: 'Earthquake casualty support - Mumbai', expertise: ['earthquake', 'flood'], contactFreq: '5min' },
  { id: 't3', name: 'Flood Rescue Team', type: 'flood', members: ['James Rodriguez', 'Maria Silva', 'Sam Wilson'], status: 'deployed', location: { lat: 28.6139, lng: 77.2090 }, currentTask: 'Flood evacuation - Delhi', expertise: ['flood', 'tsunami'], contactFreq: '15min' },
  { id: 't4', name: 'Earthquake Rescue Team', type: 'earthquake', members: ['Mike Chen', 'Priya Nair', 'Carlos Mendez', 'Aisha Khan'], status: 'standby', location: { lat: 13.0827, lng: 80.2707 }, currentTask: null, expertise: ['earthquake', 'landslide'], contactFreq: '30min' },
];

// EQUIPMENT
export let equipment = [
  { id: 'eq1', name: 'Thermal Imaging Camera TIC-01', type: 'rescue_equipment', status: 'in_use', assignedTo: 't1', usageHours: 156, lastMaintenance: '2026-02-15', condition: 'good', quantity: 1, available: 0 },
  { id: 'eq2', name: 'Rescue Jaws RJ-03', type: 'rescue_equipment', status: 'in_use', assignedTo: 't4', usageHours: 89, lastMaintenance: '2026-03-01', condition: 'excellent', quantity: 2, available: 1 },
  { id: 'eq3', name: 'Medical Kit MK-Standard', type: 'medical_kit', status: 'in_use', assignedTo: 't2', usageHours: 0, lastMaintenance: '2026-03-10', condition: 'excellent', quantity: 10, available: 3 },
  { id: 'eq4', name: 'Gas Detector GD-Pro', type: 'rescue_equipment', status: 'available', assignedTo: null, usageHours: 45, lastMaintenance: '2026-03-05', condition: 'good', quantity: 4, available: 4 },
  { id: 'eq5', name: 'Protective Hazmat Suit', type: 'protective_gear', status: 'in_use', assignedTo: 't1', usageHours: 200, lastMaintenance: '2026-01-20', condition: 'fair', quantity: 12, available: 5 },
  { id: 'eq6', name: 'Search Drone SDR-X1', type: 'drone', status: 'in_use', assignedTo: 't3', usageHours: 310, lastMaintenance: '2026-02-28', condition: 'good', quantity: 3, available: 1 },
  { id: 'eq7', name: 'Rope Rescue Kit RRK-2', type: 'rescue_equipment', status: 'available', assignedTo: null, usageHours: 120, lastMaintenance: '2026-03-12', condition: 'excellent', quantity: 6, available: 6 },
  { id: 'eq8', name: 'Breathing Apparatus BA-05', type: 'protective_gear', status: 'maintenance', assignedTo: null, usageHours: 450, lastMaintenance: '2026-03-15', condition: 'needs_repair', quantity: 8, available: 0 },
];

// MESSAGES
export let messages = [
  { id: 'm1', from: 'u2', fromName: 'Sarah Mitchell', fromTeam: 'fire', to: null, toTeam: 'medical', content: 'We have 3 burn victims at the Bangalore site. Requesting medical support ASAP.', timestamp: new Date(Date.now() - 1800000).toISOString(), type: 'support_request', priority: 'urgent', read: false },
  { id: 'm2', from: 'u5', fromName: 'Dr. Patel', fromTeam: 'medical', to: null, toTeam: 'fire', content: 'Medical team en route. ETA 25 minutes. Set up a safe triage zone away from smoke.', timestamp: new Date(Date.now() - 1500000).toISOString(), type: 'message', priority: 'urgent', read: true },
  { id: 'm3', from: 'u3', fromName: 'James Rodriguez', fromTeam: 'flood', to: null, toTeam: null, content: 'Water levels rising faster than expected. Delhi flood zone needs additional boats. Requesting reinforcement.', timestamp: new Date(Date.now() - 900000).toISOString(), type: 'support_request', priority: 'urgent', read: false },
  { id: 'm4', from: 'u1', fromName: 'Admin Controller', fromTeam: null, to: null, toTeam: 'earthquake', content: 'Earthquake team - please proceed to Mumbai for support. 6.2 magnitude incident confirmed.', timestamp: new Date(Date.now() - 3600000).toISOString(), type: 'message', priority: 'urgent', read: true },
  { id: 'm5', from: 'u2', fromName: 'Sarah Mitchell', fromTeam: 'fire', to: null, toTeam: null, content: 'Fire at 60% containment. Bangalore wildfire perimeter secured on north side.', timestamp: new Date(Date.now() - 600000).toISOString(), type: 'update', priority: 'normal', read: true },
];

// TRAINING MODULES
export const trainingModules = [
  {
    id: 'tr1', title: 'Flood Emergency Response', category: 'disaster_preparedness', targetRole: 'all',
    description: 'Comprehensive guide for flood emergency response including evacuation procedures, water rescue techniques, and recovery operations.',
    duration: '45 min', level: 'beginner', content: [
      { section: 'Understanding Floods', text: 'Flash floods can occur within minutes of heavy rainfall. Recognize warning signs including rapidly rising water levels, debris in water, and official warnings.' },
      { section: 'Evacuation Procedures', text: 'Move to higher ground immediately. Avoid walking or driving through flood waters — 6 inches of moving water can knock down an adult. Follow designated evacuation routes.' },
      { section: 'Rescue Operations', text: 'Use boats, ropes, and flotation devices. Establish command post on high ground. Prioritize vulnerable populations: elderly, children, disabled.' },
    ],
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', tags: ['flood', 'evacuation', 'water-rescue'], completed: false,
  },
  {
    id: 'tr2', title: 'Earthquake Safety & Response', category: 'safety_guidelines', targetRole: 'all',
    description: 'Essential earthquake preparedness, Drop-Cover-Hold on procedures, and post-earthquake safety assessment.',
    duration: '60 min', level: 'intermediate', content: [
      { section: 'Before the Quake', text: 'Secure heavy objects to walls. Create an emergency kit with 72-hour supplies. Identify safe spots in each room.' },
      { section: 'During the Quake', text: 'DROP to hands and knees. Take COVER under sturdy table or against interior wall. HOLD ON until shaking stops.' },
      { section: 'After the Quake', text: 'Check for injuries. Expect aftershocks. Inspect for gas leaks (do not use open flame). Document damage.' },
    ],
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', tags: ['earthquake', 'safety', 'first-aid'], completed: false,
  },
  {
    id: 'tr3', title: 'Wildfire Containment Protocols', category: 'emergency_protocols', targetRole: 'safety_team',
    description: 'Advanced wildfire suppression strategies, deployment tactics, and team coordination for fire response units.',
    duration: '90 min', level: 'advanced', content: [
      { section: 'Fire Behavior', text: 'Understand fire triangle, wind effects, fuel types, and terrain influence on fire spread. Monitor weather changes closely.' },
      { section: 'Suppression Tactics', text: 'Direct attack: work directly on fire edge. Indirect attack: build fireline ahead of fire. Aerial support coordination for water/retardant drops.' },
      { section: 'Team Safety', text: 'Always maintain escape routes. Carry personal protective equipment. Ten Standard Fire Orders must be followed at all times.' },
    ],
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', tags: ['wildfire', 'suppression', 'safety-team'], completed: false,
  },
  {
    id: 'tr4', title: 'First Aid & Triage', category: 'safety_guidelines', targetRole: 'all',
    description: 'Basic first aid techniques for disaster scenarios including CPR, wound care, and mass casualty triage.',
    duration: '75 min', level: 'intermediate', content: [
      { section: 'Triage System', text: 'Use START triage: Red (immediate), Yellow (delayed), Green (minimal), Black (expectant). Assess in 60 seconds per patient.' },
      { section: 'CPR & AED', text: 'Push hard and fast in center of chest (100-120 compressions/min). Use AED as soon as available. 30 compressions to 2 breaths ratio.' },
      { section: 'Wound Management', text: 'Control bleeding with direct pressure. Do not remove embedded objects. Use tourniquets as last resort for life-threatening limb bleeding.' },
    ],
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', tags: ['first-aid', 'triage', 'medical'], completed: false,
  },
  {
    id: 'tr5', title: 'Communication & Coordination', category: 'emergency_protocols', targetRole: 'safety_team',
    description: 'Effective inter-team communication protocols, incident command system, and resource coordination during disasters.',
    duration: '50 min', level: 'intermediate', content: [
      { section: 'Incident Command System', text: 'ICS provides standardized structure for command, control, and coordination. Establish unified command for multi-agency response.' },
      { section: 'Radio Communication', text: 'Use plain language, not codes. Identify yourself and intended recipient. Keep messages brief and clear. Confirm receipt of critical information.' },
      { section: 'Coordination Panel', text: 'Log all resource requests and deployments. Maintain situational awareness board. Brief incoming teams on current status every 30 minutes.' },
    ],
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', tags: ['communication', 'ICS', 'coordination'], completed: false,
  },
];

// GEOJSON RISK ZONES
export const riskZones = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { id: 'rz1', name: 'Delhi Flood Zone', risk: 'high', type: 'flood', riskScore: 78 },
      geometry: { type: 'Polygon', coordinates: [[[77.1500, 28.5500], [77.2800, 28.5500], [77.2800, 28.6700], [77.1500, 28.6700], [77.1500, 28.5500]]] },
    },
    {
      type: 'Feature',
      properties: { id: 'rz2', name: 'Mumbai Seismic Zone', risk: 'critical', type: 'earthquake', riskScore: 92 },
      geometry: { type: 'Polygon', coordinates: [[[72.7700, 18.9500], [72.9800, 18.9500], [72.9800, 19.1800], [72.7700, 19.1800], [72.7700, 18.9500]]] },
    },
    {
      type: 'Feature',
      properties: { id: 'rz3', name: 'Bangalore Wildfire Risk', risk: 'medium', type: 'wildfire', riskScore: 55 },
      geometry: { type: 'Polygon', coordinates: [[[77.4800, 12.8800], [77.7200, 12.8800], [77.7200, 13.0700], [77.4800, 13.0700], [77.4800, 12.8800]]] },
    },
    {
      type: 'Feature',
      properties: { id: 'rz4', name: 'Kolkata Industrial Zone', risk: 'high', type: 'gas_leak', riskScore: 68 },
      geometry: { type: 'Polygon', coordinates: [[[88.2800, 22.4900], [88.4600, 22.4900], [88.4600, 22.6400], [88.2800, 22.6400], [88.2800, 22.4900]]] },
    },
  ],
};

export let notifications = [
  { id: 'n1', type: 'alert_created', title: 'New Alert: Gas Leak in Kolkata', message: 'High severity gas leak reported. Awaiting verification.', timestamp: new Date(Date.now() - 600000).toISOString(), read: false, priority: 'high' },
  { id: 'n2', type: 'sensor_warning', title: 'Sensor Warning: High Seismic Activity', message: 'SEIS-001 in Mumbai reading 4.8 Richter — approaching critical threshold.', timestamp: new Date(Date.now() - 1200000).toISOString(), read: false, priority: 'high' },
  { id: 'n3', type: 'support_request', title: 'Support Request: Flood Team', message: 'Flood Rescue Team requesting additional boats for Delhi operation.', timestamp: new Date(Date.now() - 900000).toISOString(), read: false, priority: 'urgent' },
  { id: 'n4', type: 'resource_assigned', title: 'Resources Deployed', message: 'Ambulance AMB-12 and Rescue Chopper HC-02 deployed to Mumbai earthquake site.', timestamp: new Date(Date.now() - 7200000).toISOString(), read: true, priority: 'normal' },
];
