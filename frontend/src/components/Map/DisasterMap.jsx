import React, { useEffect, useState, useCallback, useRef } from 'react';
import Globe from 'react-globe.gl';
import api from '../../services/api';

const SEVERITY_COLORS = { low: '#22c55e', medium: '#f59e0b', high: '#ef4444', critical: '#7c3aed' };
const TYPE_EMOJIS = { flood: '🌊', earthquake: '🏚', wildfire: '🔥', gas_leak: '☣', tsunami: '🌊', landslide: '⛰' };
const SENSOR_COLORS = { normal: '#22c55e', warning: '#f59e0b', critical: '#ef4444' };

export default function DisasterMap({ filters = {}, selectedAlert, onAlertClick }) {
  const globeEl = useRef();
  const [alerts, setAlerts] = useState([]);
  const [sensors, setSensors] = useState([]);
  const [resources, setResources] = useState([]);
  const [riskZones, setRiskZones] = useState(null);
  const [showSensors, setShowSensors] = useState(true);
  const [showResources, setShowResources] = useState(true);
  const [showRiskZones, setShowRiskZones] = useState(true);

  // Responsive dimensions
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const containerRef = useRef(null);

  useEffect(() => {
    function handleResize() {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        });
      }
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchData = useCallback(async () => {
    const [a, s, r, z] = await Promise.all([
      api.get('/alerts').catch(() => ({ data: [] })),
      api.get('/sensors').catch(() => ({ data: [] })),
      api.get('/resources').catch(() => ({ data: [] })),
      api.get('/risk/zones').catch(() => ({ data: null })),
    ]);
    setAlerts(a.data); setSensors(s.data); setResources(r.data); setRiskZones(z.data);
  }, []);

  useEffect(() => { 
    fetchData(); 
    const i = setInterval(fetchData, 10000); 
    return () => clearInterval(i); 
  }, [fetchData]);

  // Set initial camera position after Globe initializes
  useEffect(() => {
    if (globeEl.current) {
      globeEl.current.controls().autoRotate = true;
      globeEl.current.controls().autoRotateSpeed = 0.5;
      // Focus on India region (lat 20, lng 78)
      globeEl.current.pointOfView({ lat: 20.5937, lng: 78.9629, altitude: 1.5 }, 2000);
    }
  }, [globeEl.current]); // trigger once ref is attached

  // Filter alerts based on UI props
  const filteredAlerts = alerts.filter(a => {
    if (filters.type && filters.type !== 'all' && a.type !== filters.type) return false;
    if (filters.severity && filters.severity !== 'all' && a.severity !== filters.severity) return false;
    if (filters.status && filters.status !== 'all' && a.status !== filters.status) return false;
    return true;
  });

  // Combine markers for the Globe
  const generateMarkers = () => {
    const list = [];
    
    filteredAlerts.forEach(alert => {
      list.push({
        lat: alert.location.lat,
        lng: alert.location.lng,
        size: 20,
        color: SEVERITY_COLORS[alert.severity] || '#ef4444',
        type: 'alert',
        label: `${TYPE_EMOJIS[alert.type] || '⚠'} ${alert.type.toUpperCase()}`,
        data: alert
      });
    });

    if (showSensors) {
      sensors.forEach(sensor => {
        list.push({
          lat: sensor.location.lat,
          lng: sensor.location.lng,
          size: 5,
          color: SENSOR_COLORS[sensor.status] || '#22c55e',
          type: 'sensor',
          label: `${sensor.sensorId} (${sensor.value}${sensor.unit})`,
          data: sensor
        });
      });
    }

    if (showResources) {
      resources.forEach(res => {
        list.push({
          lat: res.location.lat,
          lng: res.location.lng,
          size: 10,
          color: '#3b82f6',
          type: 'resource',
          label: res.name,
          data: res
        });
      });
    }

    return list;
  };

  const markers = generateMarkers();

  return (
    <div ref={containerRef} className="h-full relative rounded-xl overflow-hidden border border-gray-800 bg-gray-950">
      
      {/* Layer toggles overlay */}
      <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
        {[
          { label: 'Risk Zones', state: showRiskZones, set: setShowRiskZones, color: 'bg-red-600' },
          { label: 'Sensors', state: showSensors, set: setShowSensors, color: 'bg-yellow-600' },
          { label: 'Resources', state: showResources, set: setShowResources, color: 'bg-blue-600' },
        ].map(({ label, state, set, color }) => (
          <button 
            key={label} 
            onClick={() => set(s => !s)} 
            className={`flex items-center gap-1 text-[10px] lg:text-xs px-2 py-1 lg:px-3 lg:py-1.5 rounded-full border transition-all ${state ? `${color} border-transparent text-white` : 'bg-gray-900/80 border-gray-700 text-gray-400'}`}
          >
            <div className="w-1 h-1 lg:w-1.5 lg:h-1.5 rounded-full bg-white/70"></div>{label}
          </button>
        ))}
      </div>

      {/* Legend overlay */}
      <div className="absolute bottom-2 right-2 z-10 bg-gray-900/80 border border-gray-700 rounded-lg p-2 text-xs space-y-1 backdrop-blur-sm">
        <div className="font-semibold text-gray-300 mb-1">Severity</div>
        {Object.entries(SEVERITY_COLORS).map(([sev, col]) => (
          <div key={sev} className="flex items-center gap-2">
            <div style={{ background: col }} className="w-3 h-3 rounded-full shadow-[0_0_8px_currentColor]"></div>
            <span className="text-gray-400 capitalize">{sev}</span>
          </div>
        ))}
      </div>

      {/* Globe Container */}
      {dimensions.width > 0 && (
        <Globe
          ref={globeEl}
          width={dimensions.width}
          height={dimensions.height}
          
          globeImageUrl="//unpkg.com/three-globe/example/img/earth-dark.jpg"
          bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
          backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
          
          htmlElementsData={markers}
          htmlElement={(d) => {
            const el = document.createElement('div');
            
            const CONTINENT_MAP = {
              'AFR': 'Africa',
              'afr': 'Africa',
              'ANT': 'Antarctica',
              'ant': 'Antarctica',
              'ASIA': 'Asia',
              'asia': 'Asia',
              'AUS': 'Australia',
              'aus': 'Australia',
              'EUR': 'Europe',
              'eur': 'Europe',
              'NAR': 'North America',
              'nar': 'North America',
              'SAR': 'South America',
              'sar': 'South America',
              'OCEAN': 'Oceania',
              'ocean': 'Oceania'
            };

            const displayLocation = CONTINENT_MAP[d.data?.location?.address] || d.data?.location?.address || 'Unknown Location';

            // Build tooltip inner HTML based on type
            let tooltipHTML = '';
            if (d.type === 'alert') {
              tooltipHTML = `
                <div class="font-bold text-[14px] text-white mb-1 flex items-center gap-1.5 border-b border-gray-700/50 pb-1">${TYPE_EMOJIS[d.data.type] || '⚠'} ${d.data.type.toUpperCase()}</div>
                <div class="text-[12px] text-gray-300 mt-1"><b>Location:</b> ${displayLocation}</div>
                <div class="text-[12px] text-gray-300 mt-0.5"><b>Severity:</b> <span style="color:${d.color}; font-weight: bold; text-shadow: 0 0 5px ${d.color};">${d.data.severity.toUpperCase()}</span></div>
                <div class="text-[11px] text-gray-400 mt-2 italic leading-tight break-words max-w-[200px] overflow-hidden" style="display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical;">${d.data.description}</div>
              `;
            } else if (d.type === 'sensor') {
              tooltipHTML = `
                <div class="font-bold text-[13px] text-white mb-1 border-b border-gray-700/50 pb-1">Sensor: ${d.data.sensorId}</div>
                <div class="text-[12px] text-gray-300 mt-1"><b>Type:</b> ${d.data.type}</div>
                <div class="text-[12px] text-gray-300 mt-0.5"><b>Reading:</b> ${d.data.value} ${d.data.unit}</div>
                <div class="text-[12px] text-gray-300 mt-0.5"><b>Status:</b> <span style="color:${d.color}; font-weight: bold;">${d.data.status.toUpperCase()}</span></div>
              `;
            } else if (d.type === 'resource') {
              tooltipHTML = `
                <div class="font-bold text-[13px] text-white mb-1 border-b border-gray-700/50 pb-1">${d.data.name}</div>
                <div class="text-[12px] text-gray-300 mt-1"><b>Type:</b> ${d.data.type}</div>
                <div class="text-[12px] text-gray-300 mt-0.5"><b>Status:</b> ${d.data.status}</div>
                <div class="text-[12px] text-gray-300 mt-0.5"><b>Capacity:</b> ${d.data.currentLoad}/${d.data.capacity}</div>
              `;
            }

            el.innerHTML = `
              <div class="relative cursor-pointer group hover:scale-110 transition-transform z-10" 
                   style="color:${d.color};">
                <!-- Marker Dot -->
                <div class="absolute w-3 h-3 bg-current rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 shadow-[0_0_15px_currentColor]"></div>
                
                <!-- Radar Ping Animation -->
                ${d.type === 'alert' ? '<div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"><div class="w-8 h-8 border-[1.5px] border-current rounded-full animate-ping opacity-60"></div></div>' : ''}
                
                <!-- Glowing Aura -->
                <div class="absolute w-6 h-6 rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-current opacity-30 blur-md pointer-events-none"></div>

                <!-- Hover Tooltip -->
                <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 opacity-0 group-hover:opacity-100 transition-all duration-300 ease-out pointer-events-none scale-95 group-hover:scale-100 z-50">
                  <div class="bg-[#0f172a]/95 backdrop-blur-xl border border-gray-700/60 p-3.5 rounded-xl shadow-2xl min-w-[220px] text-left">
                    ${tooltipHTML}
                    <!-- Pointer Triangle -->
                    <div class="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#0f172a]/95 border-b border-r border-gray-700/60 rotate-45"></div>
                  </div>
                </div>
              </div>
            `;
            // Simple click interaction to zoom onto element and trigger handler
            el.style.pointerEvents = 'auto';
            el.onclick = () => {
              if (globeEl.current) {
                globeEl.current.pointOfView({ lat: d.lat, lng: d.lng, altitude: 0.5 }, 1000);
              }
              if (d.type === 'alert' && onAlertClick) {
                onAlertClick(d.data);
              }
            };
            return el;
          }}
          htmlTransitionDuration={1000}
        />
      )}
      
    </div>
  );
}
