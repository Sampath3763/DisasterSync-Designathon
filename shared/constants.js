// Shared constants between frontend and backend

export const DISASTER_TYPES = ['flood', 'earthquake', 'wildfire', 'gas_leak', 'tsunami', 'landslide'];

export const SEVERITY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
};

export const RISK_LEVELS = {
  LOW: { label: 'LOW', color: '#22c55e', score: [0, 30] },
  MEDIUM: { label: 'MEDIUM', color: '#f59e0b', score: [31, 60] },
  HIGH: { label: 'HIGH', color: '#ef4444', score: [61, 100] },
};

export const ALERT_STATUS = {
  PENDING: 'pending',
  VERIFIED: 'verified',
  ACTIVE: 'active',
  RESOLVED: 'resolved',
  REJECTED: 'rejected',
};

export const RESOURCE_TYPES = ['rescue_team', 'ambulance', 'drone', 'relief_supply', 'helicopter'];
export const RESOURCE_STATUS = { AVAILABLE: 'available', DEPLOYED: 'deployed', MAINTENANCE: 'maintenance' };

export const TEAM_TYPES = ['fire', 'medical', 'flood', 'earthquake'];
export const TEAM_STATUS = { AVAILABLE: 'available', DEPLOYED: 'deployed', STANDBY: 'standby', OFFLINE: 'offline' };

export const SENSOR_TYPES = ['temperature', 'gas', 'seismic', 'water_level', 'air_quality'];

export const EQUIPMENT_STATUS = { AVAILABLE: 'available', IN_USE: 'in_use', MAINTENANCE: 'maintenance', RETIRED: 'retired' };

export const USER_ROLES = { ADMIN: 'admin', SAFETY_TEAM: 'safety_team', FIELD_TEAM: 'field_team', USER: 'user' };

export const WS_EVENTS = {
  SENSOR_UPDATE: 'sensor_update',
  ALERT_CREATED: 'alert_created',
  ALERT_VERIFIED: 'alert_verified',
  ALERT_RESOLVED: 'alert_resolved',
  RESOURCE_ASSIGNED: 'resource_assigned',
  TEAM_MESSAGE: 'team_message',
  TEAM_STATUS_CHANGE: 'team_status_change',
  RISK_UPDATE: 'risk_update',
  NOTIFICATION: 'notification',
  SUPPORT_REQUEST: 'support_request',
  CONNECTED: 'connected',
};
