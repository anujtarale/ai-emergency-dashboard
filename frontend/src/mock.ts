export const mockEmergencyContacts = [
  { id: '1', name: 'John Doe', relation: 'Spouse', phone: '+1 234 567 8901' },
  { id: '2', name: 'Jane Smith', relation: 'Sibling', phone: '+1 234 567 8902' },
];

export const mockSafetyAlerts = [
  {
    id: '1',
    severity: 'critical',
    type: 'disaster',
    title: 'Flash Flood Warning',
    description: 'Flash flood warning in effect for low-lying areas of Ahmedabad. Avoid underpasses, river banks and drainage channels. Evacuate immediately if instructed by local authorities.',
    timestamp: new Date(Date.now() - 900000),
  },
  {
    id: '2',
    severity: 'high',
    type: 'security',
    title: 'Gas Leak Reported – Navrangpura',
    description: 'A significant gas leak has been reported near C.G. Road, Navrangpura. Residents within 500m radius are advised to evacuate. Do not use electrical switches. Emergency crews are on site.',
    timestamp: new Date(Date.now() - 1800000),
  },
  {
    id: '3',
    severity: 'high',
    type: 'security',
    title: 'Road Closure – SG Highway',
    description: 'SG Highway between Bodakdev and Thaltej is closed due to a multi-vehicle accident. Alternate routes via Ambawadi are recommended. Emergency vehicles have priority access.',
    timestamp: new Date(Date.now() - 3600000),
  },
  {
    id: '4',
    severity: 'medium',
    type: 'weather',
    title: 'Heavy Rain & Strong Winds',
    description: 'IMD has issued a yellow alert for Ahmedabad district. Expected rainfall of 50–80mm in the next 12 hours. Strong winds up to 60 km/h possible. Avoid open areas and tall trees.',
    timestamp: new Date(Date.now() - 7200000),
  },
  {
    id: '5',
    severity: 'medium',
    type: 'traffic',
    title: 'Traffic Congestion – Maninagar',
    description: 'Heavy congestion reported on Relief Road and Maninagar area due to ongoing road repairs. Commuters are advised to use alternate routes. Expected clearance by 8 PM.',
    timestamp: new Date(Date.now() - 10800000),
  },
  {
    id: '6',
    severity: 'low',
    type: 'weather',
    title: 'Air Quality Advisory',
    description: 'AQI levels in Ahmedabad are currently in the "Moderate" range (AQI 101). Sensitive groups — children, elderly, and those with respiratory conditions — should limit prolonged outdoor activity.',
    timestamp: new Date(Date.now() - 18000000),
  },
];

export const mockServices = [
  { id: '1', name: 'Ahmedabad Civil Hospital', type: 'hospital', address: 'Asarwa, Ahmedabad', phone: '+91 79 2268 1001', lat: 23.0225, lng: 72.5714 },
  { id: '2', name: 'Ahmedabad Police Station', type: 'police', address: 'Navrangpura, Ahmedabad', phone: '+91 79 2640 1234', lat: 23.0250, lng: 72.5600 },
  { id: '3', name: 'Fire Station Maninagar', type: 'fire', address: 'Maninagar, Ahmedabad', phone: '+91 79 2543 5678', lat: 23.0000, lng: 72.6000 },
  { id: '4', name: 'Apollo Hospital', type: 'hospital', address: 'Sola, Ahmedabad', phone: '+91 79 2741 2345', lat: 23.0700, lng: 72.5100 },
  { id: '5', name: 'Medplus Pharmacy', type: 'pharmacy', address: 'C.G. Road, Ahmedabad', phone: '+91 79 2640 8765', lat: 23.0100, lng: 72.5400 },
  { id: '6', name: 'Apollo Pharmacy – C.G. Road', type: 'pharmacy', address: 'C.G. Road, Navrangpura, Ahmedabad', phone: '+91 79 2640 2020', lat: 23.0155, lng: 72.5629 },
  { id: '7', name: 'Fortis Pharmacy – SG Highway', type: 'pharmacy', address: 'SG Highway, Ahmedabad', phone: '+91 79 4020 5000', lat: 23.0480, lng: 72.5200 },
  { id: '8', name: 'PharmEasy Pharmacy – Nikol', type: 'pharmacy', address: 'Nikol, Ahmedabad', phone: '+91 79 2281 9999', lat: 23.0510, lng: 72.6450 },
  { id: '9', name: 'Netmeds Pharmacy – Bapunagar', type: 'pharmacy', address: 'Bapunagar, Ahmedabad', phone: '+91 79 2281 0101', lat: 23.0530, lng: 72.6320 },
  { id: '10', name: 'Apollo Pharmacy – Nikol Ring Road', type: 'pharmacy', address: 'Nikol Ring Road, Ahmedabad', phone: '+91 79 2282 3030', lat: 23.0490, lng: 72.6510 },
];

export const mockCommunityReports = [
  { id: '1', title: 'Car Accident on Main St', description: 'Minor collision, no injuries', location: 'Main Street', timestamp: new Date(Date.now() - 3600000), type: 'accident' },
  { id: '2', title: 'Road Construction Alert', description: 'Expect delays on Ring Road', location: 'Ring Road', timestamp: new Date(Date.now() - 7200000), type: 'other' },
];
