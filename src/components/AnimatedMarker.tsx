import { useState, useEffect, useRef } from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

interface AnimatedMarkerProps {
  routePoints: [number, number][]; // Necesitamos la ruta completa
  durationSeconds: number; // Duración total estimada en segundos
  icon: L.Icon | L.DivIcon;
  popupText: string;
}

export default function AnimatedMarker({ routePoints, durationSeconds, icon, popupText }: AnimatedMarkerProps) {
  const [currentPos, setCurrentPos] = useState<[number, number] | null>(null);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    // Si no hay ruta, no hacemos nada
    if (!routePoints || routePoints.length === 0) return;

    // Si la duración es 0, simplemente poner el marcador al inicio
    if (durationSeconds <= 0) {
      setCurrentPos(routePoints[0]);
      return;
    }

    // Crear una clave única para esta ruta basada en su inicio y fin
    const startPt = routePoints[0];
    const endPt = routePoints[routePoints.length - 1];
    const routeKey = `route_time_${startPt[0]}_${startPt[1]}_${endPt[0]}_${endPt[1]}`;

    // Buscar si ya habíamos empezado esta simulación antes (incluso si recargó la página)
    const savedTime = localStorage.getItem(routeKey);
    const now = Date.now();

    if (savedTime) {
      const parsedTime = parseInt(savedTime, 10);
      // Si el tiempo guardado no ha expirado (no ha pasado más de la duración total)
      if (now - parsedTime < durationSeconds * 1000) {
        startTimeRef.current = parsedTime;
      } else {
        // Ya debería haber llegado, reiniciamos o lo dejamos al final
        startTimeRef.current = now;
        localStorage.setItem(routeKey, now.toString());
      }
    } else {
      // Primera vez que vemos esta ruta
      startTimeRef.current = now;
      localStorage.setItem(routeKey, now.toString());
    }

    const totalDurationMs = durationSeconds * 1000;
    
    // Función para calcular la distancia total de la ruta
    const calculateTotalDistance = (points: [number, number][]) => {
      let dist = 0;
      for (let i = 0; i < points.length - 1; i++) {
        dist += L.latLng(points[i]).distanceTo(L.latLng(points[i + 1]));
      }
      return dist;
    };

    const totalDistance = calculateTotalDistance(routePoints);

    const animate = () => {
      if (!startTimeRef.current) return;
      
      const currentTime = Date.now();
      const elapsed = currentTime - startTimeRef.current;
      const progress = Math.min(elapsed / totalDurationMs, 1);

      if (progress < 1) {
        const targetDistance = totalDistance * progress;
        let currentDistance = 0;
        
        // Encontrar en qué segmento exacto estamos basados en la distancia física
        for (let i = 0; i < routePoints.length - 1; i++) {
          const p1 = L.latLng(routePoints[i]);
          const p2 = L.latLng(routePoints[i + 1]);
          const segmentDist = p1.distanceTo(p2);
          
          if (currentDistance + segmentDist >= targetDistance) {
            // Estamos en este segmento
            const segmentProgress = (targetDistance - currentDistance) / segmentDist;
            
            // Interpolar latitud y longitud
            const lat = p1.lat + (p2.lat - p1.lat) * segmentProgress;
            const lng = p1.lng + (p2.lng - p1.lng) * segmentProgress;
            
            setCurrentPos([lat, lng]);
            break;
          }
          currentDistance += segmentDist;
        }
        
        animationRef.current = requestAnimationFrame(animate);
      } else {
        // Llegó al destino
        setCurrentPos(routePoints[routePoints.length - 1]);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [routePoints, durationSeconds]);

  // Si aún no hemos calculado la posición, ponemos el marcador en el punto de inicio por defecto
  const positionToRender = currentPos || (routePoints.length > 0 ? routePoints[0] : null);

  if (!positionToRender) return null;

  return (
    <Marker position={positionToRender} icon={icon}>
      <Popup>{popupText}</Popup>
    </Marker>
  );
}