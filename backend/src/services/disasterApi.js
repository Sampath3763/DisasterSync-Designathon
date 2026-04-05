import fetch from 'node-fetch';
import { Alert } from '../models.js';

export const integrateRealTimeDisasters = (broadcast) => {
  const fetchRealTimeAlerts = async () => {
    try {
        console.log('Fetching real-time global disaster alerts via Ambee API...');
        
        const apiKey = process.env.DISASTER_API; 
        if (!apiKey) {
            console.error('DISASTER_API is not defined in .env');
            return;
        }

        // Fetch using all continents to get complete world coverage
        const continents = ['AFR', 'ANT', 'ASIA', 'AUS', 'EUR', 'NAR', 'SAR', 'OCEAN'];
        let items = [];

        for (const continent of continents) {
            const apiUrl = `https://api.ambeedata.com/disasters/latest/by-continent?continent=${continent}`;

            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'x-api-key': apiKey,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            
            if (data.message === 'success' && data.result) {
                items = items.concat(data.result);
            }
        }
        
        if (items && items.length > 0) {
            for (const item of items) {
                const alertTitle = item.event_name || 'Unknown Alert';
                const alertDesc = `${item.event_type} - ${item.proximity_severity_level}. Alert Level: ${item.default_alert_levels}`;

                // Parse severity based on proximity risk and default alert levels
                let severityVal = 'medium';
                if (item.default_alert_levels?.toLowerCase() === 'red' || item.proximity_severity_level?.toLowerCase() === 'high risk') {
                    severityVal = 'high';
                } else if (item.default_alert_levels?.toLowerCase() === 'green' || item.proximity_severity_level?.toLowerCase() === 'low risk') {
                    severityVal = 'low';
                }

                const newAlertData = {
                    id: `ambee-${item.event_id || Date.now()}`,
                    type: determineType(alertTitle + " " + item.event_type) || 'other',
                    location: { lat: item.lat || 0, lng: item.lng || 0, address: item.continent || 'Unknown Location' },
                    severity: severityVal,
                    description: `${alertTitle} - ${alertDesc}`,
                    status: 'active',
                    submittedBy: 'Ambee System',
                    verifiedBy: null,
                    timestamp: item.date || item.created_time || new Date().toISOString(),
                    riskScore: severityVal === 'high' ? 90 : (severityVal === 'medium' ? 60 : 30),
                    photoUrl: null,
                    casualties: 0,
                    affectedArea: 'Unknown',
                    resourcesAssigned: [],
                };
                
                // Save to MongoDB via Mongoose
                // To avoid massive duplication, simple check if we recently saved something similar
                const exists = await Alert.findOne({ "description": newAlertData.description });
                if (!exists) {
                    const savedAlert = await Alert.create(newAlertData);
                    console.log(`Saved new real-time alert: ${alertTitle}`);
                    
                    // Broadcast to frontend map / dashboard
                    if (broadcast) {
                      broadcast({ event: 'new_alert', data: savedAlert });
                    }
                }
            }
        } else {
            console.log('No new alerts/items found in the recent Ambee fetch.');
        }

    } catch (error) {
        console.error('Error fetching data from Ambee DISASTER_API:', error.message);
    }
  };

  // Run the fetcher immediately and then every 30 minutes
  fetchRealTimeAlerts();
  setInterval(fetchRealTimeAlerts, 30 * 60 * 1000); 
};

// Helper function to map text to disaster type logic
function determineType(text) {
    if (!text) return null;
    text = text.toLowerCase();
    if (text.includes('flood') || text.includes('fl')) return 'flood';
    if (text.includes('earthquake') || text.includes('eq')) return 'earthquake';
    if (text.includes('fire') || text.includes('wildfire') || text.includes('wf')) return 'wildfire';
    if (text.includes('gas') || text.includes('chemical')) return 'gas_leak';
    if (text.includes('hurricane') || text.includes('storm') || text.includes('tc') || text.includes('cy')) return 'hurricane';
    return null;
}
