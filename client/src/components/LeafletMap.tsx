'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { HelpRequest } from '@/lib/data';

// Fix for default marker icon in React Leaflet
const iconUrl = 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png';
const iconRetinaUrl = 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png';
const shadowUrl = 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png';

const defaultIcon = L.icon({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = defaultIcon;

const DISTRICT_COORDINATES: Record<string, { lat: number; lng: number }> = {
  'Dhaka': { lat: 23.8103, lng: 90.4125 },
  'Chittagong': { lat: 22.3569, lng: 91.7832 },
  'Sylhet': { lat: 24.8949, lng: 91.8687 },
  'Rajshahi': { lat: 24.3636, lng: 88.6241 },
  'Khulna': { lat: 22.8456, lng: 89.5403 },
  'Barisal': { lat: 22.7010, lng: 90.3535 },
  'Rangpur': { lat: 25.7439, lng: 89.2752 },
  'Mymensingh': { lat: 24.7471, lng: 90.4203 },
  'Comilla': { lat: 23.4607, lng: 91.1809 },
  'Gazipur': { lat: 24.0023, lng: 90.4264 },
  'Narayanganj': { lat: 23.6238, lng: 90.5000 }
};

const defaultCenter = {
  lat: 23.8103,
  lng: 90.4125
};

interface LeafletMapProps {
  requests: HelpRequest[];
  onSelectRequest: (request: HelpRequest) => void;
  getCategoryColor: (category: string) => string;
}

const LeafletMap: React.FC<LeafletMapProps> = ({ requests, onSelectRequest, getCategoryColor }) => {
  const [isMounted, setIsMounted] = useState(false);
  const [mapKey, setMapKey] = useState(0);
  const containerIdRef = useRef(`map-${Date.now()}`);

  // Only render map after component is mounted (client-side only)
  useEffect(() => {
    setIsMounted(true);
    
    // Force re-render with new key to handle StrictMode double-mounting
    setMapKey(prev => prev + 1);
  }, []);

  if (!isMounted) {
    return (
      <div style={{ height: '600px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>Loading map...</p>
      </div>
    );
  }

  return (
    <div id={containerIdRef.current} key={mapKey} style={{ height: '600px', width: '100%' }}>
      <MapContainer 
        center={[defaultCenter.lat, defaultCenter.lng]} 
        zoom={7} 
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://api.maptiler.com/maps/basic-v2/256/{z}/{x}/{y}.png?key=shl2U6Nedx9hxSnp8RmI"
        />
        
        {requests.map((request) => {
          const coords = DISTRICT_COORDINATES[request.district] || defaultCenter;
          // Add a small random offset to prevent markers from stacking perfectly
          const lat = coords.lat + (Math.random() - 0.5) * 0.01;
          const lng = coords.lng + (Math.random() - 0.5) * 0.01;
          
          return (
            <Marker
              key={request.id}
              position={[lat, lng]}
            >
              <Popup>
                <div className="p-1 max-w-xs">
                  <h3 className="font-bold text-sm">{request.title}</h3>
                  <p className="text-xs text-gray-600 mb-1">{request.district}</p>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <Badge className={`${getCategoryColor(request.category)} text-[10px] px-1 py-0`}>
                      {request.category}
                    </Badge>
                    <span className="text-xs font-semibold">
                      {request.quantity} {request.unit}
                    </span>
                  </div>
                  <Button 
                    size="sm" 
                    className="w-full h-7 text-xs"
                    onClick={() => onSelectRequest(request)}
                  >
                    View Details
                  </Button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default LeafletMap;
