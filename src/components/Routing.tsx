import { useEffect, useState } from 'react';
import { useMap, Polyline } from 'react-leaflet';
import L from 'leaflet';

interface RoutingProps {
  start: [number, number];
  end: [number, number];
  onRouteCalculated?: (coordinates: [number, number][], timeInSeconds: number) => void;
}

// Función para decodificar la polyline comprimida de Google
function decodePolyline(encoded: string): [number, number][] {
  let points: [number, number][] = [];
  let index = 0, len = encoded.length;
  let lat = 0, lng = 0;

  while (index < len) {
    let b, shift = 0, result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    let dlat = ((result & 1) !== 0 ? ~(result >> 1) : (result >> 1));
    lat += dlat;

    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    let dlng = ((result & 1) !== 0 ? ~(result >> 1) : (result >> 1));
    lng += dlng;

    points.push([lat / 1e5, lng / 1e5]);
  }
  return points;
}

export default function Routing({ start, end, onRouteCalculated }: RoutingProps) {
  const map = useMap();
  const [routePath, setRoutePath] = useState<[number, number][]>([]);

  const startStr = start?.join(',');
  const endStr = end?.join(',');

  useEffect(() => {
    if (!startStr || !endStr) return;

    let isMounted = true;

    const fetchRoute = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/route`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ start, end })
        });
        
        const data = await response.json();
        
        if (data.success && isMounted) {
          const decodedPath = decodePolyline(data.polyline);
          setRoutePath(decodedPath);
          
          if (onRouteCalculated) {
            onRouteCalculated(decodedPath, data.durationSeconds);
          }

          // Ajustar el zoom del mapa para mostrar toda la ruta
          // El padding inferior (bottom) es más grande para evitar que la ruta se esconda detrás del panel desplegable
          const bounds = L.latLngBounds(decodedPath);
          map.fitBounds(bounds, { 
            paddingTopLeft: [50, 50],
            paddingBottomRight: [50, 300]
          });
        } else {
          // Fallback a ruta directa si falla Google Maps
          console.warn("Fallo el cálculo de ruta con Google Maps, usando fallback directo", data.message);
          if (isMounted) {
            const fallbackPath: [number, number][] = [start, end];
            setRoutePath(fallbackPath);
            if (onRouteCalculated) {
              onRouteCalculated(fallbackPath, 0);
            }
            const bounds = L.latLngBounds(fallbackPath);
            map.fitBounds(bounds, { 
              paddingTopLeft: [50, 50],
              paddingBottomRight: [50, 300]
            });
          }
        }
      } catch (err) {
        console.error("Error fetching route from backend:", err);
      }
    };

    fetchRoute();

    return () => {
      isMounted = false;
    };
  }, [map, startStr, endStr]);

  if (routePath.length === 0) return null;

  return (
    <>
      {/* Sombra/Borde oscuro grueso para efecto 3D */}
      <Polyline 
        positions={routePath} 
        pathOptions={{ color: '#1e3a8a', weight: 8, opacity: 0.6, lineCap: 'round', lineJoin: 'round' }} 
      />
      {/* Línea principal azul sólida */}
      <Polyline 
        positions={routePath} 
        pathOptions={{ color: '#3b82f6', weight: 5, opacity: 1, lineCap: 'round', lineJoin: 'round' }} 
      />
    </>
  );
}