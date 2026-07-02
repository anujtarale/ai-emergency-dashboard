import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { EmergencyService } from '../lib/api';

// Fix Leaflet assets path issues in Vite
delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;

const getUserIcon = () => {
  return L.divIcon({
    html: `
      <div class="relative flex items-center justify-center w-8 h-8">
        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
        <span class="relative inline-flex rounded-full h-4.5 w-4.5 bg-blue-600 border-2 border-white shadow-lg"></span>
      </div>
    `,
    className: 'custom-user-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

const getCustomIcon = (type: string) => {
  let color = 'bg-blue-600';
  let emoji = '📍';
  switch (type) {
    case 'hospital':
      color = 'bg-red-500 shadow-red-500/50';
      emoji = '🏥';
      break;
    case 'police':
      color = 'bg-blue-600 shadow-blue-600/50';
      emoji = '🚔';
      break;
    case 'fire':
      color = 'bg-orange-500 shadow-orange-500/50';
      emoji = '🚒';
      break;
    case 'pharmacy':
      color = 'bg-green-500 shadow-green-500/50';
      emoji = '💊';
      break;
    case 'shelter':
      color = 'bg-yellow-500 shadow-yellow-500/50';
      emoji = '🏠';
      break;
  }

  return L.divIcon({
    html: `
      <div class="flex items-center justify-center w-9 h-9 rounded-full ${color} text-white shadow-lg border-2 border-white transform transition-transform duration-200 hover:scale-110">
        <span class="text-lg leading-none">${emoji}</span>
      </div>
    `,
    className: 'custom-marker',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18],
  });
};

// Component to dynamically re-center the map when coords change
const RecenterMap = ({ center, zoom }: { center: [number, number]; zoom: number }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
    map.invalidateSize();
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 100);
    return () => clearTimeout(timer);
  }, [center, zoom, map]);
  return null;
};

interface MapProps {
  center: [number, number];
  zoom?: number;
  services?: EmergencyService[];
  showUserMarker?: boolean;
  className?: string;
}

const Map = ({
  center,
  zoom = 13,
  services = [],
  showUserMarker = true,
  className = 'h-full w-full'
}: MapProps) => {
  const tileUrl = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

  const attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

  return (
    <div className={`relative overflow-hidden rounded-lg ${className}`}>
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        className="h-full w-full z-0"
      >
        <TileLayer
          attribution={attribution}
          url={tileUrl}
        />
        
        <RecenterMap center={center} zoom={zoom} />

        {showUserMarker && (
          <Marker position={center} icon={getUserIcon()}>
            <Popup>
              <div className="text-center font-medium">
                You are here
              </div>
            </Popup>
          </Marker>
        )}

        {services.map((service) => {
          // Coordinates in Mongo are [lng, lat]
          const lat = service.location?.coordinates[1];
          const lng = service.location?.coordinates[0];
          
          if (lat === undefined || lng === undefined) return null;

          return (
            <Marker
              key={service._id}
              position={[lat, lng]}
              icon={getCustomIcon(service.type)}
            >
              <Popup>
                <div className="p-1 max-w-[200px]">
                  <h3 className="font-bold text-gray-900 text-sm leading-tight mb-1">{service.name}</h3>
                  <p className="text-xs text-gray-600 mb-1 capitalize"><strong>Type:</strong> {service.type}</p>
                  <p className="text-xs text-gray-600 mb-1"><strong>Address:</strong> {service.address}</p>
                  <a
                    href={`tel:${service.phone}`}
                    className="mt-2 inline-flex items-center justify-center w-full px-2 py-1 text-xs font-semibold text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors"
                  >
                    📞 Call: {service.phone}
                  </a>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default Map;
