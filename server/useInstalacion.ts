import { useState, useEffect, useRef } from 'react';
import { InstalacionData } from '@/pages/Seguimiento';

const POLLING_INTERVAL = 10000; // 10 segundos

export function useInstalacion(token: string | undefined) {
  const [data, setData] = useState<InstalacionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const previousStatus = useRef<string | null>(null);

  const triggerNotification = (newStatus: string, tecnicoData: any, logoImg: string) => {
    let title = "¡Actualización de tu servicio!";
    let body = "";

    switch(newStatus) {
      case 'asignado': body = `El técnico ${tecnicoData?.nombre || ''} ha sido asignado a tu instalación.`; break;
      case 'en_camino': body = "Tu técnico ya está en camino a tu domicilio. Revisa el mapa."; break;
      case 'en_proceso': body = "La instalación está en proceso en este momento."; break;
      case 'finalizada': body = "Instalación completada. Por favor evalúa nuestro servicio."; break;
      default: return;
    }

    // Lanzar Notificación Nativa del Sistema Operativo/Navegador
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, { body, icon: logoImg });
    }
    
    return { title, body, time: new Date(), read: false };
  };

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;

    const fetchInstalacion = async () => {
      if (!token) return;

      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/instalaciones/${token}`);
        const result = await response.json();

        if (result.success) {
          const fetchedData: InstalacionData = result.data;
          
          // Verificar si la encuesta ya fue completada
          const hasCompletedSurveyLocal = localStorage.getItem(`encuesta_completada_${token}`);
          if (hasCompletedSurveyLocal === 'true') {
            fetchedData.status = 'cerrada';
          }

          setData(fetchedData);
          setError(false);

          // Devolvemos la notificación para que el componente la gestione
          if (previousStatus.current && previousStatus.current !== fetchedData.status) {
            return triggerNotification(fetchedData.status, fetchedData.tecnico, '/logo-1.png');
          }
          previousStatus.current = fetchedData.status;

        } else {
          setError(true);
        }
      } catch (err) {
        console.error("Error fetching data", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchInstalacion();
    intervalId = setInterval(fetchInstalacion, POLLING_INTERVAL);

    return () => clearInterval(intervalId);
  }, [token]);

  return { data, loading, error, setData };
}