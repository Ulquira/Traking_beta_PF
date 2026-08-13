import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import AnimatedMarker from '@/components/AnimatedMarker';
import Routing from '@/components/Routing';

// Solución al bug clásico del icono de Leaflet en React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Color primario de Perú Fibra hsl(354, 97%, 43%) ~= #D70318
const vehicleIcon = L.divIcon({
  className: 'custom-vehicle-icon',
  html: `<div style="background-color: hsl(354, 97%, 43%); border-radius: 50%; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 4px 12px rgba(215, 3, 24, 0.4); transition: transform 0.3s ease;">
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg>
  </div>`,
  iconSize: [44, 44],
  iconAnchor: [22, 22],
  popupAnchor: [0, -22],
});

const destIcon = L.divIcon({
  className: 'custom-dest-icon',
  html: `<div style="background-color: #111827; border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 4px 12px rgba(0,0,0,0.3);">
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
  </div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

interface TrackingMapProps {
  status: string;
  position: [number, number];
  vehiclePosition: [number, number];
  setCalculatedDurationSec: (sec: number) => void;
  setRoutePoints: (pts: [number, number][]) => void;
  etaReferenceTimeRef: React.MutableRefObject<number | null>;
  setRemainingSeconds: (sec: number) => void;
  clienteNombre?: string;
  routePoints: [number, number][];
}

const TrackingMap: React.FC<TrackingMapProps> = ({
  status, position, vehiclePosition, setCalculatedDurationSec, setRoutePoints, etaReferenceTimeRef, setRemainingSeconds, clienteNombre, routePoints
}) => {
  return (
    <div className="absolute inset-0 z-0 h-full w-full bg-gray-100">
      <MapContainer 
        center={position} 
        zoom={14} 
        zoomControl={false} 
        className="h-[80vh] w-full" 
        style={{ background: '#f3f4f6' }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        />
        
        {['en_camino', 'en_proceso'].includes(status) && (
          <Routing 
            start={vehiclePosition} 
            end={position} 
            onRouteCalculated={(coords: [number, number][], timeInSeconds: number) => {
              setRoutePoints(coords);
              setCalculatedDurationSec(timeInSeconds);
              
              if (etaReferenceTimeRef.current === null) {
                setRemainingSeconds(timeInSeconds);
                etaReferenceTimeRef.current = Date.now();
              }
            }} 
          />
        )}
        
        {status === 'en_camino' && routePoints.length > 0 ? (
          <AnimatedMarker 
            routePoints={routePoints} 
            durationSeconds={120} 
            icon={vehicleIcon} 
            popupText="El técnico está en camino"
          />
        ) : (
          ['asignado', 'en_camino', 'en_proceso'].includes(status) && (
            <Marker position={vehiclePosition} icon={vehicleIcon}>
              <Popup>Técnico en ruta</Popup>
            </Marker>
          )
        )}
        
        <Marker position={position} icon={destIcon}>
          <Popup>{clienteNombre || 'Tu domicilio'}</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default TrackingMap;