import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { PhoneCall, MapPin, Locate, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { mockServices } from '../mock';
import { apiClient, type EmergencyService } from '../lib/api';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix default marker icon paths (webpack/vite issue)
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const serviceIcons: Record<string, L.DivIcon> = {
  hospital: L.divIcon({ className: '', html: '<div style="background:#ef4444;color:white;border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;font-size:16px;box-shadow:0 2px 8px rgba(0,0,0,0.3);border:2px solid white;">🏥</div>', iconSize: [32, 32], iconAnchor: [16, 16] }),
  police: L.divIcon({ className: '', html: '<div style="background:#3b82f6;color:white;border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;font-size:16px;box-shadow:0 2px 8px rgba(0,0,0,0.3);border:2px solid white;">🚔</div>', iconSize: [32, 32], iconAnchor: [16, 16] }),
  fire: L.divIcon({ className: '', html: '<div style="background:#f97316;color:white;border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;font-size:16px;box-shadow:0 2px 8px rgba(0,0,0,0.3);border:2px solid white;">🚒</div>', iconSize: [32, 32], iconAnchor: [16, 16] }),
  pharmacy: L.divIcon({ className: '', html: '<div style="background:#22c55e;color:white;border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;font-size:16px;box-shadow:0 2px 8px rgba(0,0,0,0.3);border:2px solid white;">💊</div>', iconSize: [32, 32], iconAnchor: [16, 16] }),
  shelter: L.divIcon({ className: '', html: '<div style="background:#a855f7;color:white;border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;font-size:16px;box-shadow:0 2px 8px rgba(0,0,0,0.3);border:2px solid white;">🏠</div>', iconSize: [32, 32], iconAnchor: [16, 16] }),
};

const userIcon = L.divIcon({
  className: '',
  html: '<div style="background:#3b82f6;color:white;border-radius:50%;width:24px;height:24px;display:flex;align-items:center;justify-content:center;font-size:14px;box-shadow:0 0 0 4px rgba(59,130,246,0.3);border:2px solid white;"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg></div>',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

function MapController({ center, zoom }: { center: [number, number]; zoom?: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom ?? map.getZoom(), { animate: true });
  }, [center, map, zoom]);
  return null;
}

const mapMockToEmergencyService = (mock: typeof mockServices[0]): EmergencyService => {
  return {
    _id: mock.id,
    name: mock.name,
    type: mock.type as EmergencyService['type'],
    address: mock.address,
    phone: mock.phone,
    location: {
      type: 'Point',
      coordinates: [mock.lng, mock.lat]
    }
  };
};

const NearbyServices = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [currentLocation, setCurrentLocation] = useState<[number, number]>([23.0225, 72.5714]);
  const [loading, setLoading] = useState(true);
  const [fetchingServices, setFetchingServices] = useState(true);
  const [services, setServices] = useState<EmergencyService[]>([]);
  const [mapCenter, setMapCenter] = useState<[number, number]>([23.0225, 72.5714]);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const cardsRef = useRef<Map<string, HTMLDivElement | null>>(new Map());

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setCurrentLocation([latitude, longitude]);
          setMapCenter([latitude, longitude]);
          setLoading(false);
        },
        () => { setLoading(false); }
      );
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const fetchServices = async () => {
      setFetchingServices(true);
      try {
        const res = await apiClient.getNearbyServices(currentLocation[0], currentLocation[1], activeTab, 10000);
        if (res.success && res.data && res.data.length > 0) {
          setServices(res.data);
        } else {
          const mapped = mockServices
            .map(mapMockToEmergencyService)
            .filter(s => activeTab === 'all' || s.type === activeTab);
          setServices(mapped);
        }
      } catch {
        const mapped = mockServices
          .map(mapMockToEmergencyService)
          .filter(s => activeTab === 'all' || s.type === activeTab);
        setServices(mapped);
      } finally {
        setFetchingServices(false);
      }
    };

    fetchServices();
  }, [currentLocation, activeTab]);

  const handleCardClick = useCallback((serviceId: string) => {
    setSelectedService(serviceId);
    const service = services.find(s => s._id === serviceId);
    if (service && service.location?.coordinates) {
      setMapCenter([service.location.coordinates[1], service.location.coordinates[0]]);
    }
    cardsRef.current.get(serviceId)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [services]);

  const tabs = [
    { id: 'all', label: 'All Services' },
    { id: 'hospital', label: 'Hospitals' },
    { id: 'police', label: 'Police' },
    { id: 'fire', label: 'Fire' },
    { id: 'pharmacy', label: 'Pharmacies' },
    { id: 'shelter', label: 'Shelters' },
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case 'hospital': return '🏥';
      case 'police': return '🚔';
      case 'fire': return '🚒';
      case 'pharmacy': return '💊';
      case 'shelter': return '🏠';
      default: return '📍';
    }
  };

  const getDirectionsUrl = (service: EmergencyService) => {
    const lat = service.location?.coordinates[1];
    const lng = service.location?.coordinates[0];
    if (lat !== undefined && lng !== undefined) {
      return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    }
    return '#';
  };

  const hasValidCoords = (s: EmergencyService) =>
    s.location?.coordinates && s.location.coordinates.length === 2;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Nearby Services</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2 flex items-center gap-2">
          <Locate className="h-4 w-4 text-blue-500" />
          {loading
            ? 'Getting your location...'
            : `Showing services near [${currentLocation[0].toFixed(4)}, ${currentLocation[1].toFixed(4)}]`}
        </p>
      </motion.div>

      <div className="mb-6 flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-200 shadow-sm border ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white border-blue-600 shadow-blue-500/20'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Map */}
      <div className="mb-8 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm" style={{ height: '350px' }}>
        {loading ? (
          <div className="h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
            <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
          </div>
        ) : (
          <MapContainer center={mapCenter} zoom={14} className="h-full w-full" scrollWheelZoom={true}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapController center={mapCenter} />
            <Marker position={currentLocation} icon={userIcon}>
              <Popup>Your Location</Popup>
            </Marker>
            {services.filter(hasValidCoords).map((service) => (
              <Marker
                key={service._id}
                position={[service.location!.coordinates[1], service.location!.coordinates[0]]}
                icon={serviceIcons[service.type] || serviceIcons.hospital}
              >
                <Popup>
                  <div className="font-semibold text-sm">{service.name}</div>
                  <div className="text-xs text-gray-500 capitalize">{service.type}</div>
                  <div className="text-xs mt-1">{service.address}</div>
                  <div className="text-xs">{service.phone}</div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}
      </div>

      {/* Services List */}
      {fetchingServices ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-500 dark:text-gray-400 gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <p className="text-sm font-medium">Scanning local services...</p>
        </div>
      ) : services.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center text-gray-500 dark:text-gray-400">
          <span className="text-4xl mb-2">🔍</span>
          <p className="text-sm font-semibold">No services found</p>
          <p className="text-xs mt-1">Try changing the filter or updating your search range.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service, idx) => (
            <motion.div
              key={service._id}
              ref={(el) => { cardsRef.current.set(service._id, el); }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => handleCardClick(service._id)}
              className={`cursor-pointer transition-all duration-200 ${
                selectedService === service._id ? 'ring-2 ring-blue-500 rounded-xl' : ''
              }`}
            >
              <Card className="h-full flex flex-col justify-between border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-200">
                <CardHeader>
                  <div className="flex items-center">
                    <span className="text-4xl mr-3">{getIcon(service.type)}</span>
                    <div>
                      <CardTitle className="text-gray-900 dark:text-white text-lg font-bold leading-snug">{service.name}</CardTitle>
                      <CardDescription className="capitalize text-xs text-blue-600 dark:text-blue-400 font-semibold mt-0.5">{service.type}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-start">
                      <MapPin className="h-4 w-4 mr-2 mt-0.5 text-gray-400 shrink-0" />
                      <p className="text-sm text-gray-650 dark:text-gray-305">{service.address}</p>
                    </div>
                    <div className="flex items-start">
                      <PhoneCall className="h-4 w-4 mr-2 mt-0.5 text-gray-400 shrink-0" />
                      <p className="text-sm text-gray-650 dark:text-gray-305">{service.phone}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <a
                      href={`tel:${service.phone}`}
                      className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-650 transition-colors border border-transparent dark:border-gray-700"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <PhoneCall className="h-4 w-4 text-gray-500" />
                      Call
                    </a>
                    <a
                      href={getDirectionsUrl(service)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm shadow-blue-500/10"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MapPin className="h-4 w-4" />
                      Directions
                    </a>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NearbyServices;
