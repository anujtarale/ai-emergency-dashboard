import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Locate, Phone, Navigation } from 'lucide-react';
import { mockServices } from '../mock';
import { apiClient, type EmergencyService } from '../lib/api';
import Map from '../components/Map';
import { Button } from '../components/ui/button';

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

const LiveMap = () => {
  const [position, setPosition] = useState<[number, number]>([23.0225, 72.5714]);
  const [mapCenter, setMapCenter] = useState<[number, number]>([23.0225, 72.5714]);
  const [mapZoom, setMapZoom] = useState<number>(13);
  const [services, setServices] = useState<EmergencyService[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('all');

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setPosition([latitude, longitude]);
          setMapCenter([latitude, longitude]);
        },
        () => {}
      );
    }
  }, []);

  useEffect(() => {
    const fetchServices = async () => {
      await Promise.resolve();
      setLoading(true);
      try {
        const res = await apiClient.getNearbyServices(position[0], position[1], activeTab, 10000);
        if (res.success && res.data && res.data.length > 0) {
          setServices(res.data);
        } else {
          // If backend returns empty array, fallback to filtered mock services
          const mapped = mockServices
            .map(mapMockToEmergencyService)
            .filter(s => activeTab === 'all' || s.type === activeTab);
          setServices(mapped);
        }
      } catch {
        // Fallback to filtered mock services
        const mapped = mockServices
          .map(mapMockToEmergencyService)
          .filter(s => activeTab === 'all' || s.type === activeTab);
        setServices(mapped);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [position, activeTab]);

  const tabs = [
    { id: 'all', label: 'All', emoji: '📍' },
    { id: 'hospital', label: 'Hospitals', emoji: '🏥' },
    { id: 'police', label: 'Police', emoji: '🚔' },
    { id: 'fire', label: 'Fire', emoji: '🚒' },
    { id: 'pharmacy', label: 'Pharmacies', emoji: '💊' },
    { id: 'shelter', label: 'Shelters', emoji: '🏠' },
  ];

  const getIconEmoji = (type: string) => {
    switch (type) {
      case 'hospital': return '🏥';
      case 'police': return '🚔';
      case 'fire': return '🚒';
      case 'pharmacy': return '💊';
      case 'shelter': return '🏠';
      default: return '📍';
    }
  };

  const handleLocateService = (service: EmergencyService) => {
    const lat = service.location?.coordinates[1];
    const lng = service.location?.coordinates[0];
    if (lat !== undefined && lng !== undefined) {
      setMapCenter([lat, lng]);
      setMapZoom(16);
    }
  };

  const resetToUserLocation = () => {
    setMapCenter(position);
    setMapZoom(13);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 h-full flex flex-col">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
            <MapPin className="mr-2 h-8 w-8 text-red-500" />
            Live Map Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2 flex items-center gap-2 text-sm">
            <Locate className="h-4 w-4 text-blue-500" />
            Showing emergency services and resources around your coordinates
          </p>
        </div>
        <Button 
          onClick={resetToUserLocation} 
          variant="outline"
          className="flex items-center gap-2 self-start sm:self-auto border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <Locate className="h-4 w-4" />
          My Location
        </Button>
      </motion.div>

      {/* Tabs */}
      <div className="mb-4 flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 shadow-sm border ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white border-blue-600 shadow-blue-500/20'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750'
            }`}
          >
            <span>{tab.emoji}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Main Split Layout */}
      <div className="flex flex-col lg:flex-row gap-6 items-start w-full">
        {/* Left Side: Leaflet Interactive Map (Dynamically fills width) */}
        <div className="flex-1 w-full h-[550px] rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-md bg-gray-50 dark:bg-gray-900">
          <Map 
            center={mapCenter}
            zoom={mapZoom}
            services={services}
            showUserMarker={true}
          />
        </div>

        {/* Right Side: Scrollable Services List */}
        <div className="w-full lg:w-[450px] h-[550px] flex flex-col bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-md overflow-hidden shrink-0">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
            <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span>Nearby Resources</span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 font-semibold">
                {loading ? '...' : services.length}
              </span>
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Select any item to center on map
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-48 text-gray-500 dark:text-gray-400 gap-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <p className="text-sm font-medium">Scanning local services...</p>
              </div>
            ) : services.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-center text-gray-500 dark:text-gray-400 p-6">
                <span className="text-4xl mb-2">🔍</span>
                <p className="text-sm font-semibold">No services found</p>
                <p className="text-xs mt-1">Try changing the filter or updating your search range.</p>
              </div>
            ) : (
              services.map((service) => (
                <div
                  key={service._id}
                  onClick={() => handleLocateService(service)}
                  className="group relative bg-white dark:bg-gray-800/40 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-800 cursor-pointer transition-all duration-200 shadow-sm"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="text-3xl p-1 bg-gray-50 dark:bg-gray-700/50 rounded-lg group-hover:bg-white dark:group-hover:bg-gray-700 transition-colors">
                      {getIconEmoji(service.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {service.name}
                      </h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mt-1">
                        {service.address}
                      </p>
                      
                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 mt-3.5 pt-3 border-t border-gray-150 dark:border-gray-700/60">
                        <a
                          href={`tel:${service.phone}`}
                          onClick={(e) => e.stopPropagation()}
                          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-650 transition-colors"
                        >
                          <Phone className="h-3 w-3 text-gray-500" />
                          <span>Call</span>
                        </a>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLocateService(service);
                          }}
                          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm shadow-blue-500/10"
                        >
                          <Navigation className="h-3 w-3" />
                          <span>Locate</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveMap;
