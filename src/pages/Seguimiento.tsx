import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

import { Phone, CheckCircle2, User, XCircle, Star, Bell, Check, MapPin, AlertTriangle, ArrowLeft } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import L from 'leaflet';
import { format } from "date-fns";

import Routing from "@/components/Routing";
import AnimatedMarker from "@/components/AnimatedMarker";
import { motion, AnimatePresence } from "framer-motion";
import { PeruFibraLogo } from "@/components/PeruFibraLogo";
import { trackEvent } from "@/lib/firebaseConfig";

const parseSafeDate = (dateStr?: string) => {
  if (!dateStr) return null;
  const match = dateStr.match(/^(\d{4}-\d{2}-\d{2})/);
  if (match) {
    const [year, month, day] = match[1].split('-').map(Number);
    return new Date(year, month - 1, day);
  }
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
};


delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
 iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
 iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
 shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const vehicleIcon = L.divIcon({
 className: 'custom-vehicle-icon',
 html: `<div style="background-color: #E3001B; border-radius: 50%; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 4px 12px rgba(227, 0, 27, 0.4); transition: transform 0.3s ease;">
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

// Componente para animar elementos al entrar
export interface InstalacionData {
 cliente_nombre?: string;
 direccion?: string;
 idoperacion?: string | number;
 status: 'programada' | 'asignado' | 'en_camino' | 'en_proceso' | 'finalizada' | 'cerrada' | string;
 tecnico?: {
 nombre: string;
 cuadrilla: string;
 telefono: string;
 };
 eta?: string;
 trafico?: string;
 coordenadas_cliente?: [number, number];
 coordenadas_tecnico?: [number, number];
 fecha_programacion?: string;
 tramo?: string;
 token_inicio?: string;
 campana?: string;
 tipo?: 'instalacion' | 'ticket';
}

const Seguimiento = () => {
 const { token } = useParams<{ token: string }>();
 const navigate = useNavigate();
 
 const [data, setData] = useState<InstalacionData | null>(null);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState(false);

 const [routePoints, setRoutePoints] = useState<[number, number][]>([]);
 const [calculatedEta, setCalculatedEta] = useState<string | null>(null);
 const [calculatedDurationSec, setCalculatedDurationSec] = useState<number>(0);
 // Estado para manejar el tiempo restante actual en segundos
 const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
 
 const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
 const [isReprogramModalOpen, setIsReprogramModalOpen] = useState(false);
 const [reprogramStep, setReprogramStep] = useState<'confirm_initial' | 'form' | 'success'>('confirm_initial');
 const [reprogramData, setReprogramData] = useState({ fecha: '', turno: '', motivo: '', motivoSeleccionado: '', pin_confirmacion: '' });
 const [isSubmittingReprogram, setIsSubmittingReprogram] = useState(false);
 
 const [encuesta, setEncuesta] = useState({
 instalacion_concretada: '',
 tecnico_trato: '',
 tecnico_puntualidad: '',
 tecnico_claridad: '',
 tecnico_orden: '',
 tecnico_efectividad: '',
 satisfaccion_general: '',
 satisfaccion_comentario: '',
 facilidad_gestion: '',
 facilidad_motivo: ''
 });
 const [isSubmittingEncuesta, setIsSubmittingEncuesta] = useState(false);
 const [encuestaEnviada, setEncuestaEnviada] = useState(false);

 const previousStatus = useRef<string | null>(null);
 const etaReferenceTime = useRef<number | null>(null);
 const [notifications, setNotifications] = useState<{title: string, body: string, time: Date, read: boolean}[]>([]);
 const [showNotifications, setShowNotifications] = useState(false);
 const [sheetHeight, setSheetHeight] = useState(22);

 useEffect(() => {
 if ("Notification" in window && Notification.permission === "default") {
 Notification.requestPermission();
 }
 }, []);

 // Registrar tiempo de estadía y si refrescó la página en nuestra base de datos
 useEffect(() => {
   if (!token) return;

   let startTime = Date.now();
   // Hacemos un cast a "any" para evitar el error de TypeScript con PerformanceEntry
   const isReload = window.performance && (window.performance.getEntriesByType("navigation")[0] as any)?.type === "reload";

   if (isReload) {
     trackEvent('pagina_refrescada', { token });
   }

   const sendDurationLog = () => {
     const endTime = Date.now();
     const durationSeconds = Math.round((endTime - startTime) / 1000);
     
     // Evitar registrar visitas ultra cortas de 0 segundos
     if (durationSeconds <= 0) return;

     const logData = JSON.stringify({
       token,
       evento: 'visita_finalizada',
       detalles: { duracion_segundos: durationSeconds }
     });

     // El uso de fetch con keepalive es el estándar moderno y 100% confiable
     fetch(`${import.meta.env.VITE_API_URL}/api/log`, {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: logData,
       keepalive: true
     }).catch(err => console.error("Error al registrar duracion:", err));
   };

   const handleVisibilityChange = () => {
     if (document.visibilityState === 'hidden') {
       sendDurationLog();
     } else if (document.visibilityState === 'visible') {
       // Resetear el tiempo de inicio cuando el usuario vuelve a abrir/mirar la pestaña
       startTime = Date.now();
     }
   };

   document.addEventListener('visibilitychange', handleVisibilityChange);

   return () => {
     document.removeEventListener('visibilitychange', handleVisibilityChange);
     sendDurationLog(); // Registrar última duración si el componente se desmonta
   };
 }, [token]);

 const triggerNotification = (newStatus: string, tecnicoData: any) => {
 let title = "¡Actualización de tu servicio!";
 let body = "";
 
 switch(newStatus) {
 case 'asignado': body = `El técnico ${tecnicoData?.nombre || ''} ha sido asignado a tu instalación.`; break;
 case 'en_camino': body = "Tu técnico ya está en camino a tu domicilio. Revisa el mapa."; break;
 case 'en_proceso': body = "La instalación está en proceso en este momento."; break;
 case 'finalizada': body = "Instalación completada. Por favor evalúa nuestro servicio."; break;
 default: return;
 }

 setNotifications(prev => [{ title, body, time: new Date(), read: false }, ...prev]);

 if ("Notification" in window && Notification.permission === "granted") {
   if ('serviceWorker' in navigator) {
     navigator.serviceWorker.ready.then(registration => {
       registration.showNotification(title, { 
         body,
         icon: '/favicon.ico',
         vibrate: [200, 100, 200]
       } as NotificationOptions);
     }).catch(() => {
       // Fallback for non-sw environments
       new Notification(title, { body });
     });
   } else {
     new Notification(title, { body });
   }
 }
 };

 const getTomorrowLocal = () => {
 const tomorrow = new Date();
 tomorrow.setDate(tomorrow.getDate() + 1);
 const localDate = new Date(tomorrow.getTime() - (tomorrow.getTimezoneOffset() * 60000));
 return localDate.toISOString().split('T')[0];
 };

 const handleReprogramSubmit = async () => {
 if (reprogramData.pin_confirmacion !== data?.token_inicio) {
   alert("El PIN de seguridad ingresado es incorrecto.");
   return;
 }

 setIsSubmittingReprogram(true);
 try {
 const response = await fetch(`${import.meta.env.VITE_API_URL}/api/reprogramar`, {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({
 token,
 ...reprogramData
 })
 });

 const result = await response.json();
 if (result.success) {
 trackEvent('reprogramar_solicitud_completada', { token, motivo: reprogramData.motivoSeleccionado });
 setReprogramStep('success');
 } else {
 alert("Ocurrió un error. Por favor intenta de nuevo más tarde.");
 }
 } catch (e) {
 alert("Error de conexión al guardar la solicitud.");
 } finally {
 setIsSubmittingReprogram(false);
 }
 };

 const handleEncuestaSubmit = async () => {
 if (!encuesta.instalacion_concretada || !encuesta.satisfaccion_general || !encuesta.facilidad_gestion) {
 alert("Por favor responde las preguntas principales antes de enviar.");
 return;
 }

 setIsSubmittingEncuesta(true);
 try {
 const response = await fetch(`${import.meta.env.VITE_API_URL}/api/encuesta`, {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({
 token,
 ...encuesta
 })
 });

 const result = await response.json();
 if (result.success) {
 trackEvent('encuesta_completada', { 
   token, 
   instalacion_concretada: encuesta.instalacion_concretada,
   satisfaccion_general: encuesta.satisfaccion_general,
   facilidad_gestion: encuesta.facilidad_gestion
 });
 setEncuestaEnviada(true);
 localStorage.setItem(`encuesta_completada_${token}`, 'true');
 setData(prev => prev ? { ...prev, status: 'cerrada' } : null);
 } else {
 alert("Ocurrió un error. Por favor intenta de nuevo más tarde.");
 }
 } catch (e) {
 alert("Error de conexión al guardar la encuesta.");
 } finally {
 setIsSubmittingEncuesta(false);
 }
 };

 // Efecto para el contador regresivo local del ETA
 useEffect(() => {
   if (remainingSeconds === null || remainingSeconds <= 0) return;

   const interval = setInterval(() => {
     setRemainingSeconds(prev => {
       if (prev === null || prev <= 0) {
         clearInterval(interval);
         return 0;
       }
       return prev - 1;
     });
   }, 1000);

   return () => clearInterval(interval);
 }, [remainingSeconds]);

 // Formatear el ETA calculado cada vez que cambian los segundos restantes
 useEffect(() => {
   if (remainingSeconds === null) return;
   
   const totalSecsWithBuffer = remainingSeconds + (15 * 60); // Agregamos los 15 minutos extra
   
   if (etaReferenceTime.current) {
     const arrivalTimeMin = new Date(etaReferenceTime.current + (totalSecsWithBuffer * 1000));
     // Damos un margen de 20 minutos para el límite superior del rango
     const arrivalTimeMax = new Date(arrivalTimeMin.getTime() + (20 * 60 * 1000)); 
     
     const timeFormatMin = arrivalTimeMin.toLocaleTimeString('es-PE', { hour: 'numeric', minute: '2-digit', hour12: true }).toLowerCase();
     const timeFormatMax = arrivalTimeMax.toLocaleTimeString('es-PE', { hour: 'numeric', minute: '2-digit', hour12: true }).toLowerCase();
     
     setCalculatedEta(`${timeFormatMin} - ${timeFormatMax}`);
   }
 }, [remainingSeconds]);

 useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;

    const fetchInstalacion = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/instalaciones/${token}`);
        const result = await response.json();
        
        if (result.success) {
          const fetchedData = result.data;

          const hasCompletedSurveyLocal = localStorage.getItem(`encuesta_completada_${token}`);
          
          if (hasCompletedSurveyLocal === 'true') {
            fetchedData.status = 'cerrada';
          } else {
            try {
              const checkResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/encuesta/verificar/${token}`);
              const checkResult = await checkResponse.json();
              
              if (checkResult.success && checkResult.completada) {
                localStorage.setItem(`encuesta_completada_${token}`, 'true');
                fetchedData.status = 'cerrada';
              }
            } catch (e) {
              console.error("Error verificando encuesta en servidor", e);
            }
          }
          
          if (previousStatus.current && previousStatus.current !== fetchedData.status) {
            trackEvent('actualizacion_estado_visto', { 
              token, 
              estado_anterior: previousStatus.current, 
              estado_nuevo: fetchedData.status 
            });
            triggerNotification(fetchedData.status, fetchedData.tecnico);
          } else if (previousStatus.current === null) {
            // Primer carga/visita de la web por parte del usuario
            trackEvent('ver_seguimiento_instalacion', { 
              token, 
              estado_actual: fetchedData.status 
            });
          }
          previousStatus.current = fetchedData.status;

          setData(fetchedData);
          setError(false);
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

    if (token) {
      fetchInstalacion();
      intervalId = setInterval(fetchInstalacion, 10000);
    }

    return () => clearInterval(intervalId);
 }, [token]);

 if (loading) {
return (
 <div className="h-[100dvh] w-full bg-[#f3f4f6] relative overflow-hidden flex flex-col font-sans">
 <div className="flex-1 bg-gray-200 animate-pulse"></div>
 <div className="absolute bottom-0 w-full h-[40vh] bg-white rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] p-8">
 <div className="w-16 h-1.5 bg-gray-300 rounded-full mx-auto mb-8 animate-pulse"></div>
 <div className="w-3/4 h-8 bg-gray-200 rounded-lg mb-4 animate-pulse"></div>
 <div className="w-1/2 h-4 bg-gray-200 rounded-lg mb-8 animate-pulse"></div>
 <div className="w-full h-20 bg-gray-200 rounded-2xl animate-pulse"></div>
 </div>
 </div>
 );
 }

 if (error || !data) {
 return (
 <div className="min-h-screen flex items-center justify-center bg-[#f3f4f6] flex-col gap-4 font-sans px-6 text-center">
 <h1 className="text-3xl font-bold text-foreground">Instalación no encontrada</h1>
 <p className="text-muted-foreground text-lg">El link de seguimiento proporcionado es inválido o la operación no existe.</p>
 <Button onClick={() => navigate('/')} className="mt-4 rounded-2xl h-14 px-8 bg-[#E3001B] hover:bg-[#c90018] text-white font-bold text-lg">Volver al inicio</Button>
 </div>
 );
 }

 const { status, tecnico, eta, fecha_programacion } = data;

 const position: [number, number] = data.coordenadas_cliente || [-12.0971, -77.0369];
 const vehiclePosition: [number, number] = data.coordenadas_tecnico || [-12.0950, -77.0320];

 const steps = [
 { id: 'programada', label: 'Agendada', sub: 'Tu visita ha sido programada.', date: fecha_programacion },
 { id: 'asignado', label: 'Técnico Asignado', sub: 'Tenemos un técnico para ti.' },
 { id: 'en_camino', label: 'En camino', sub: 'El técnico ya está en ruta.' },
 { id: 'en_proceso', label: 'Iniciada', sub: 'Técnico revisando o instalando.' },
 { id: 'finalizada', label: 'Finalizada', sub: 'Instalación completada.' },
 ];

 const statusIndex = ['programada', 'asignado', 'en_camino', 'en_proceso', 'finalizada', 'cerrada'].indexOf(status);

 const formatTramoToRange = (tramoStr?: string) => {
   if (!tramoStr) return '08:00 - 12:00';
   
   // Si el string ya tiene el formato de rango (contiene un guion o la palabra " a ") lo dejamos tal cual
   if (tramoStr.includes('-') || tramoStr.toLowerCase().includes(' a ')) return tramoStr;
   
   const t = tramoStr.toLowerCase();
   if (t.includes('8') || t.includes('08')) return '08:00 - 12:00';
   if (t.includes('12')) return '12:00 - 16:00';
   if (t.includes('16') || t.includes('4')) return '16:00 - 20:00';
   
   return tramoStr; // Por defecto retorna lo que venga si no coincide con los 3 tramos
 };

 const toTitleCase = (text?: string) => {
   if (!text) return '';
   return text.toLowerCase().replace(/(?:^|\s)\S/g, (a) => a.toUpperCase());
 };

 const formatAddress = (address?: string) => {
   if (!address) return 'Cargando...';
   // Limpiar campos vacíos al final como "DPTO/INTERIOR -"
   let clean = address.replace(/PISO\s*-?\s*$/i, '').replace(/DPTO\/INTERIOR\s*-?\s*$/i, '').trim();
   // Remover la doble coma o coma al final
   clean = clean.replace(/,\s*$/, '').trim();
   return toTitleCase(clean);
 };

 const handleDragEnd = (_e: any, info: any) => {
   if (info.offset.y < -50) {
     setSheetHeight(85);
   } else if (info.offset.y > 50) {
     setSheetHeight(22);
   }
 };

 return (
 <div className="h-[100dvh] w-full bg-[#f3f4f6] relative overflow-hidden font-sans">
 
 {/* Floating Header (Only for map view to go back) */}
 {status === 'en_camino' && (
 <div className="absolute top-0 left-0 w-full p-4 z-20 flex justify-between items-start pointer-events-none mt-2">
 <button 
 onClick={() => navigate(`/`)} 
 className="w-12 h-12 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg pointer-events-auto transition-transform active:scale-95"
 >
 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-800"><path d="m15 18-6-6 6-6"/></svg>
 </button>
 </div>
 )}

 {/* Map Layer (Background) */}
 {status === 'en_camino' && (
 <div className="absolute top-0 left-0 w-full h-full z-0 bg-muted">
 <MapContainer center={position} zoom={15} zoomControl={false} scrollWheelZoom={false} className="h-full w-full">
 <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
 <Marker position={position} icon={destIcon}><Popup>Tu dirección</Popup></Marker>
 
 

 {status === 'en_camino' && (
 <Routing 
 start={vehiclePosition} 
 end={position} 
 onRouteCalculated={(coords, timeInSeconds) => {
 setRoutePoints(coords);
 setCalculatedDurationSec(timeInSeconds);
 
 // Solo seteamos el tiempo restante si es la primera vez o si la nueva estimación de Google
 // difiere por más de 5 minutos (300 segundos) de lo que nos queda, para evitar resetear el 
 // contador por pequeñas fluctuaciones del GPS.
 if (remainingSeconds === null || Math.abs(remainingSeconds - timeInSeconds) > 300) {
   setRemainingSeconds(timeInSeconds);
   etaReferenceTime.current = Date.now();
 }
 }} 
 />
 )}
 {routePoints.length > 0 && status === 'en_camino' ? (
 <AnimatedMarker 
 routePoints={routePoints} 
 durationSeconds={calculatedDurationSec}
 icon={vehicleIcon} 
 popupText="El técnico está en camino" 
 />
 ) : (
 <Marker position={status === 'en_camino' ? vehiclePosition : position} icon={status === 'en_camino' ? vehicleIcon : destIcon}>
   <Popup>{status === 'en_camino' ? 'El técnico' : 'Tu dirección'}</Popup>
 </Marker>
 )}
 </MapContainer>

 {/* Mensaje Referencial superpuesto en el mapa */}
 <div className="absolute bottom-[26vh] left-4 z-[400] bg-white/90 backdrop-blur-sm px-3.5 py-2.5 rounded-xl shadow-md border border-gray-100 max-w-[200px]">
   <div className="flex items-center gap-1.5">
     <AlertTriangle className="w-5 h-5 text-[#E3001B] shrink-0" />
     <p className="text-[11px] text-gray-600 font-normal leading-tight">
       El tiempo de llegada puede variar según el tráfico.
     </p>
   </div>
 </div>
 </div>
 )}

 {/* Dynamic Content Container */}
 <motion.div 
  animate={{ 
    height: status === 'en_camino' ? `${sheetHeight}vh` : '100vh' 
  }}
  transition={{ type: "spring", stiffness: 300, damping: 30 }}
  drag={status === 'en_camino' ? "y" : false}
  dragConstraints={{ top: 0, bottom: 0 }}
  dragElastic={0.2}
  onDragEnd={handleDragEnd}
  className={`absolute left-0 bottom-0 w-full bg-white shadow-[0_-15px_40px_rgba(0,0,0,0.15)] z-20 flex flex-col ${
    status === 'en_camino' ? 'rounded-t-[2.5rem]' : 'rounded-none top-0 pt-0'
 }`}>
 
 {/* Top Banner Orange (Always visible if no map) */}
 {status !== 'en_camino' && (
 <div className="bg-[#E3001B] w-full pt-8 pb-4 px-6 text-white shrink-0 relative z-30 shadow-sm">
 <div className="flex justify-between items-center mb-2">
 <div className="flex items-center">
 <PeruFibraLogo white className="h-5 sm:h-6" />
 </div>
 <div className="relative">
 <button 
 onClick={() => {
 setShowNotifications(!showNotifications);
 setNotifications(prev => prev.map(n => ({...n, read: true})));
 }} 
 className="relative p-1 hover:bg-white/10 rounded-full transition-colors"
 >
 <Bell className="w-6 h-6" />
 {notifications.some(n => !n.read) && (
 <div className="absolute top-1 right-1 w-2.5 h-2.5 bg-yellow-400 rounded-full border-2 border-[#E3001B]"></div>
 )}
 </button>
 
 {/* Notifications Dropdown */}
 <AnimatePresence>
 {showNotifications && (
 <motion.div 
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: 10 }}
 className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 text-left"
 >
 <div className="p-3 bg-gray-50 border-b border-gray-100 font-bold text-gray-800 text-sm">
 Notificaciones
 </div>
 <div className="max-h-60 overflow-y-auto">
 {notifications.length === 0 ? (
 <div className="p-4 text-center text-sm text-gray-500">No hay notificaciones recientes</div>
 ) : (
 notifications.map((notif, idx) => (
 <div key={idx} className="p-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
 <p className="text-xs font-bold text-gray-900 mb-0.5">{notif.title}</p>
 <p className="text-xs text-gray-500 leading-tight">{notif.body}</p>
 <p className="text-[10px] text-gray-400 mt-1">{format(notif.time, "hh:mm a")}</p>
 </div>
 ))
 )}
 </div>
 </motion.div>
 )}
 </AnimatePresence>
 </div>
 </div>
 <h1 className="text-xl font-bold mt-1">
 Detalle de visita
 </h1>
 </div>
 )}

 {/* Drag Handle (Only when map is visible) */}
 {status === 'en_camino' && (
 <div className="w-full flex flex-col items-center justify-center pt-3 pb-1 shrink-0 cursor-grab active:cursor-grabbing hover:bg-gray-50 rounded-t-[2.5rem] transition-colors">
 <div className="w-12 h-1.5 bg-gray-300 rounded-full mb-1 mt-1"></div>
 </div>
 )}

 {/* Scrollable Content inside Sheet */}
 <div className="flex-1 overflow-y-auto px-5 pb-32 scrollbar-hide pt-0">
 
 {status === 'cerrada' && !encuestaEnviada && localStorage.getItem(`encuesta_completada_${token}`) !== 'true' ? (
 <div className="py-6">
 <div className="bg-white border border-gray-200 rounded-[24px] p-6 sm:p-8 shadow-sm text-center">
 <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-5 border border-gray-100">
 <AlertTriangle className="w-8 h-8 text-gray-400" />
 </div>
 <h2 className="text-2xl font-bold text-gray-900 mb-3">Atención Cerrada</h2>
 <p className="text-[15px] text-gray-500 mb-8 font-normal leading-relaxed px-2">
 Tu visita ha sido cerrada. Si no reconoces esta cancelación, comunícate con nosotros, con gusto te atenderemos.
 </p>
 <button 
 onClick={() => {
  trackEvent('click_contactar_soporte_cerrada', { token });
  window.open('https://wa.me/51937096003');
}} 
 className="w-full bg-[#E3001B] text-white font-bold rounded-2xl h-14 shadow-lg text-[15px] flex items-center justify-center gap-2 transition-transform active:scale-95"
 >
 <Phone className="w-5 h-5" /> Contactar con Soporte
 </button>
 </div>
 </div>
 ) : status === 'finalizada' && !encuestaEnviada && localStorage.getItem(`encuesta_completada_${token}`) !== 'true' ? (
 <div className="py-4">
 <div className="mb-6">
 <h2 className="text-[22px] font-black text-gray-900 leading-tight">
   Cuéntanos sobre<br/>tu experiencia
 </h2>
 </div>
 
 <div className="space-y-4">
 {/* Pregunta 1 */}
 <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-5">
 <p className="font-bold text-[14px] mb-3 text-gray-900">1. ¿La instalación se concretó correctamente?</p>
 <div className="flex gap-3">
 <label className="flex items-center justify-center gap-2 cursor-pointer bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-100 flex-1 hover:bg-gray-100 transition-colors has-[:checked]:border-[#E3001B] has-[:checked]:bg-[#E3001B]/5">
 <input type="radio" name="q1" value="Sí" onChange={(e) => setEncuesta({...encuesta, instalacion_concretada: e.target.value})} className="accent-[#E3001B] w-4 h-4" /> 
 <span className="font-bold text-[13px] text-gray-800">Sí</span>
 </label>
 <label className="flex items-center justify-center gap-2 cursor-pointer bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-100 flex-1 hover:bg-gray-100 transition-colors has-[:checked]:border-[#E3001B] has-[:checked]:bg-[#E3001B]/5">
 <input type="radio" name="q1" value="No" onChange={(e) => setEncuesta({...encuesta, instalacion_concretada: e.target.value})} className="accent-[#E3001B] w-4 h-4" /> 
 <span className="font-bold text-[13px] text-gray-800">No</span>
 </label>
 </div>
 </div>

 {/* Pregunta 2 */}
 <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-5">
 <p className="font-bold text-[14px] mb-1 text-gray-900">2. Evalúa al técnico en los siguientes aspectos:</p>
 <p className="text-[11px] text-gray-400 mb-4 font-normal">1 = Totalmente Insatisfecho, 5 = Totalmente Satisfecho</p>
 
 {[
   { key: 'tecnico_trato', label: 'Trato y respeto' },
   { key: 'tecnico_puntualidad', label: 'Puntualidad y cumplimiento de la instalación' },
   { key: 'tecnico_claridad', label: 'Claridad de la explicación (Uso, recomendaciones, cuidados)' },
   { key: 'tecnico_orden', label: 'Orden y cuidado del espacio (limpieza, cableado prolijo)' },
   { key: 'tecnico_efectividad', label: 'Efectividad del trabajo realizado' }
 ].map(aspect => (
   <div key={aspect.key} className="mb-4 last:mb-0">
     <p className="text-[12px] font-bold text-gray-800 mb-2">{aspect.label}</p>
     <div className="flex justify-between gap-1">
     {[1,2,3,4,5].map(num => (
     <label key={`${aspect.key}_${num}`} className="flex-1">
     <input type="radio" name={aspect.key} value={num} onChange={(e) => setEncuesta({...encuesta, [aspect.key]: e.target.value})} className="peer hidden" />
     <div className="border border-gray-100 bg-gray-50 rounded-xl flex flex-col items-center justify-center py-2 cursor-pointer hover:bg-gray-100 peer-checked:border-[#E3001B] peer-checked:bg-[#E3001B]/10 transition-all">
     <span className={`text-[14px] font-bold ${(encuesta as any)[aspect.key] === num.toString() ? 'text-[#E3001B]' : 'text-gray-500'}`}>{num}</span>
     </div>
     </label>
     ))}
     </div>
   </div>
 ))}
 </div>

 {/* Pregunta 3 */}
 <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-5">
 <p className="font-bold text-[14px] mb-1 text-gray-900">3. En general, ¿Qué tan satisfecho(a) estás con la atención recibida durante la instalación?</p>
 <p className="text-[11px] text-gray-400 mb-4 font-normal">1 = Totalmente Insatisfecho, 5 = Totalmente Satisfecho</p>
 <div className="flex justify-between gap-1 mb-4">
 {[1,2,3,4,5].map(num => (
 <label key={`sat_${num}`} className="flex-1">
 <input type="radio" name="satisfaccion" value={num} onChange={(e) => {
   setEncuesta({...encuesta, satisfaccion_general: e.target.value, satisfaccion_comentario: ''});
 }} className="peer hidden" />
 <div className="border border-gray-100 bg-gray-50 rounded-xl flex flex-col items-center justify-center py-2 cursor-pointer hover:bg-gray-100 peer-checked:border-[#E3001B] peer-checked:bg-[#E3001B]/10 transition-all">
 <span className={`text-[14px] font-bold ${encuesta.satisfaccion_general === num.toString() ? 'text-[#E3001B]' : 'text-gray-500'}`}>{num}</span>
 </div>
 </label>
 ))}
 </div>

 {encuesta.satisfaccion_general === '1' || encuesta.satisfaccion_general === '2' ? (
   <div className="animate-in fade-in slide-in-from-top-2 duration-300">
     <p className="font-bold text-[13px] text-gray-900 mb-2">Lamentamos que tu experiencia no haya sido la ideal ¿Cuál fue el motivo principal de tu calificación?</p>
     <textarea value={encuesta.satisfaccion_comentario} onChange={(e) => setEncuesta({...encuesta, satisfaccion_comentario: e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-[13px] font-normal text-gray-800 focus:outline-none focus:border-[#E3001B] resize-none" rows={3}></textarea>
   </div>
 ) : encuesta.satisfaccion_general === '3' ? (
   <div className="animate-in fade-in slide-in-from-top-2 duration-300">
     <p className="font-bold text-[13px] text-gray-900 mb-2">Gracias por tu respuesta. ¿Qué hubiéramos podido hacer diferente para mejorar tu experiencia?</p>
     <textarea value={encuesta.satisfaccion_comentario} onChange={(e) => setEncuesta({...encuesta, satisfaccion_comentario: e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-[13px] font-normal text-gray-800 focus:outline-none focus:border-[#E3001B] resize-none" rows={3}></textarea>
   </div>
 ) : encuesta.satisfaccion_general === '4' || encuesta.satisfaccion_general === '5' ? (
   <div className="animate-in fade-in slide-in-from-top-2 duration-300">
     <p className="font-bold text-[13px] text-gray-900 mb-2">¡Nos alegramos! Para seguir brindándote el mejor servicio: ¿Qué fue lo que más te gustó de la atención recibida?</p>
     <textarea value={encuesta.satisfaccion_comentario} onChange={(e) => setEncuesta({...encuesta, satisfaccion_comentario: e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-[13px] font-normal text-gray-800 focus:outline-none focus:border-[#E3001B] resize-none" rows={3}></textarea>
   </div>
 ) : null}
 </div>

 {/* Pregunta 4 */}
 <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-5 mb-4">
 <p className="font-bold text-[14px] mb-1 text-gray-900">4. ¿Qué tan fácil fue gestionar tu solicitud de instalación?</p>
 <p className="text-[11px] text-gray-400 mb-4 font-normal">1 = Muy difícil, 5 = Muy fácil</p>
 <div className="flex justify-between gap-1 mb-4">
 {[1,2,3,4,5].map(num => (
 <label key={`fac_${num}`} className="flex-1">
 <input type="radio" name="facilidad" value={num} onChange={(e) => {
   setEncuesta({...encuesta, facilidad_gestion: e.target.value, facilidad_motivo: ''});
 }} className="peer hidden" />
 <div className="border border-gray-100 bg-gray-50 rounded-xl flex flex-col items-center justify-center py-2 cursor-pointer hover:bg-gray-100 peer-checked:border-[#E3001B] peer-checked:bg-[#E3001B]/10 transition-all">
 <span className={`text-[14px] font-bold ${encuesta.facilidad_gestion === num.toString() ? 'text-[#E3001B]' : 'text-gray-500'}`}>{num}</span>
 </div>
 </label>
 ))}
 </div>

 {(encuesta.facilidad_gestion === '1' || encuesta.facilidad_gestion === '2') && (
   <div className="animate-in fade-in slide-in-from-top-2 duration-300 mt-4">
     <p className="font-bold text-[13px] text-gray-900 mb-3">¿Qué fue lo más difícil o incómodo del proceso de instalación?</p>
     <div className="flex flex-col gap-2">
       {['Coordinar la visita', 'Tiempo de espera', 'Información o tracking poco claro', 'Atención del técnico', 'Duración de la instalación', 'Otro'].map(opcion => (
         <label key={opcion} className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-gray-50 border border-transparent has-[:checked]:border-[#E3001B] has-[:checked]:bg-[#E3001B]/5">
           <input type="radio" name="facilidad_motivo" value={opcion} onChange={(e) => setEncuesta({...encuesta, facilidad_motivo: e.target.value})} className="accent-[#E3001B] w-4 h-4" />
           <span className="text-[13px] font-normal text-gray-700">{opcion}</span>
         </label>
       ))}
     </div>
   </div>
 )}
 </div>

 <Button 
 onClick={handleEncuestaSubmit}
 disabled={isSubmittingEncuesta}
 className="w-full bg-[#E3001B] hover:bg-[#c90018] text-white h-14 text-[15px] rounded-full shadow-[0_8px_20px_rgba(227,0,27,0.2)] transition-transform active:scale-95 font-bold mt-2">
 {isSubmittingEncuesta ? "Enviando..." : "Enviar encuesta"}
 </Button>
 </div>
 </div>
 ) : (encuestaEnviada || localStorage.getItem(`encuesta_completada_${token}`) === 'true') && (status === 'finalizada' || status === 'cerrada') ? (
 <div className="py-6">
 <div className="bg-white border border-gray-200 rounded-[24px] p-8 shadow-sm text-center">
 <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-100">
 <CheckCircle2 className="w-10 h-10 text-green-500" strokeWidth={2.5} />
 </div>
 <h2 className="text-2xl font-bold text-gray-900 mb-3">¡Encuesta enviada!</h2>
 <p className="text-[15px] text-gray-500 mb-6 font-normal leading-relaxed px-2">
 Muchas gracias por tomarte el tiempo de responder. Tu opinión es súper valiosa y nos ayuda a seguir mejorando el servicio de PerúFibra para ti.
 </p>
 <div className="inline-flex items-center justify-center px-6 py-3 bg-gray-50 rounded-xl border border-gray-100">
 <span className="text-[13px] font-bold text-gray-700">¡Que disfrutes tu conexión! 🚀</span>
 </div>
 </div>
 </div>
 ) : (
 <>
 {/* Token de Inicio (Si está en camino) */}
 {status === 'en_camino' && data.token_inicio && (
 <div className="bg-gray-900 rounded-3xl p-4 mb-3 shadow-[0_8px_30px_rgb(0,0,0,0.12)] mt-1 flex items-center justify-between mx-0 overflow-hidden relative">
   {/* Elemento decorativo de fondo */}
   <div className="absolute top-0 right-0 w-32 h-32 bg-[#E3001B] rounded-full blur-[50px] opacity-20 -mr-10 -mt-10"></div>
   
   <div className="flex flex-col relative z-10 w-2/3 pr-2">
     <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Código de seguridad</p>
     <p className="text-[12px] text-gray-300 font-normal leading-tight">
       Comparte este PIN cuando el instalador llegue a tu domicilio.
     </p>
   </div>
   
   <div className="relative z-10 flex gap-1.5 shrink-0 bg-black/40 p-2 rounded-2xl border border-gray-700/50 backdrop-blur-md">
     {data.token_inicio.split('').map((digit, i) => (
       <div key={i} className="w-8 h-10 bg-gray-800 rounded-lg flex items-center justify-center text-xl font-bold text-white shadow-inner border border-gray-700/50">
         {digit}
       </div>
     ))}
   </div>
 </div>
 )}

 {/* Llegada del técnico separada del Info Card */}
 {status === 'en_camino' && (eta || calculatedEta) && (
 <div className="flex justify-between items-center mb-3 bg-[#E3001B]/10 px-4 py-3.5 rounded-2xl gap-2">
   <div className="flex items-center gap-2">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E3001B] opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#E3001B]"></span>
      </span>
      <span className="text-[#E3001B] text-[13px] font-bold uppercase tracking-wide">Llegada estimada</span>
   </div>
   <div className="flex justify-between items-center text-right">
      <span className="font-bold text-[#E3001B] text-[15px]">
        {calculatedEta || eta}
      </span>
   </div>
 </div>
 )}

 {/* Info Card Minimalista */}
 <div className={`border border-gray-200 rounded-[20px] p-5 mb-6 bg-white shadow-sm ${status === 'en_camino' && (data.token_inicio || eta || calculatedEta) ? '' : 'mt-4'}`}>
 <h3 className="text-[16px] font-bold text-gray-900 mb-4 pb-3 border-b border-gray-100">
   {data.tipo === 'ticket' ? 'Visita Técnica de ' : 'Instalación de '}{data.cliente_nombre ? toTitleCase(data.cliente_nombre.split(' ')[0]) : 'Cliente'}
 </h3>
 <div className="flex flex-col gap-3">
   <div className="flex justify-between items-center">
     <span className="text-gray-500 text-[14px] font-normal">Día</span>
     <span className="font-bold text-gray-900 text-[14px]">
     {data.fecha_programacion && parseSafeDate(data.fecha_programacion) ? format(parseSafeDate(data.fecha_programacion)!, "dd/MM/yyyy") : 'Por definir'}
     </span>
   </div>
   {status !== 'en_camino' && (
     <div className="flex justify-between items-center">
       <span className="text-gray-500 text-[14px] font-normal">Horario programado</span>
       <span className="font-bold text-gray-900 text-[14px]">
       {formatTramoToRange(data.tramo)}
       </span>
     </div>
   )}
   {data.tipo !== 'ticket' && (
     <div className="flex justify-between items-start">
       <span className="text-gray-500 text-[14px] font-normal mr-4">Plan</span>
       <span className="font-bold text-gray-900 text-[14px] text-right">
       {toTitleCase(data.campana || 'No especificado')}
       </span>
     </div>
   )}
   <div className="flex justify-between items-start">
     <span className="text-gray-500 text-[14px] font-normal mt-0.5 mr-4">Dirección</span>
     <span className="font-bold text-gray-900 text-[14px] text-right leading-snug line-clamp-3">
     {formatAddress(data.direccion)}
     </span>
   </div>
 </div>
 </div>

 {/* Vertical Timeline - Minimalista */}
 <div className="relative pl-[24px] border-l-[2px] border-dashed border-gray-300 ml-4 mb-10 mt-2">
 {steps.map((step, i) => {
 const isCurrent = i === statusIndex;
 const isCompleted = i <= statusIndex;
 return (
 <div key={step.id} className="relative pb-8 last:pb-0">
 {/* Timeline Dot */}
 <div className={`absolute -left-[35px] top-0 w-[20px] h-[20px] rounded-full flex items-center justify-center border-[2px] border-white shadow-sm ${isCompleted ? 'bg-[#E3001B]' : 'bg-gray-300 '}`}>
 {isCompleted && <Check className="w-[11px] h-[11px] text-white" strokeWidth={4} />}
 </div>
 
 {/* Content */}
 <div className="flex flex-col justify-start">
 <h4 className={`font-bold text-[15px] leading-tight ${isCompleted ? 'text-gray-900 ' : 'text-gray-400 '}`}>
 {step.label}
 </h4>
 
 {/* Solo mostramos subtítulos si ya se completó o es el estado actual */}
 {isCompleted && (
 <>
 <p className={`text-[12px] leading-tight mt-1 ${isCurrent ? 'text-gray-500 ' : 'text-gray-400'}`}>
 {step.sub}
 </p>
 </>
 )}

 {/* Technician Box integrado en la línea de tiempo */}
 {step.id === 'asignado' && isCompleted && tecnico && status !== 'finalizada' && status !== 'cerrada' && (
 <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-[16px] border border-gray-100 mt-4 -ml-2">
 <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center shrink-0 overflow-hidden">
 <User className="w-5 h-5 text-gray-400" />
 </div>
 <div className="flex-1">
 <p className="font-bold text-gray-900 text-[14px] leading-tight mb-0.5">
 {tecnico.nombre.split(' ').slice(1).join(' ') || tecnico.nombre}
 </p>
 <div className="flex items-center gap-1 mt-0.5">
 <Star className="w-3 h-3 text-[#E3001B] fill-[#E3001B]" />
 <span className="text-[11px] font-bold text-gray-600">4.9</span>
 <span className="text-[11px] text-gray-400 mx-1">•</span>
 <span className="text-[11px] text-gray-500 font-normal">Técnico asignado</span>
 </div>
 </div>
 </div>
 )}
 
 </div>
 </div>
 );
 })}
 </div>

 {/* Action Buttons and Help Center CTA (Bottom) */}
 <div className="flex flex-col gap-3 pt-6 pb-2 border-t border-gray-100 mt-2">
 <p className="text-[14px] text-gray-500 text-center mb-2">¿Necesitas ayuda?</p>
 <button 
 onClick={() => {
   trackEvent('click_contactar_soporte', { token });
   window.open('https://wa.me/51937096003');
 }}
 className="w-full flex items-center justify-center gap-2 border border-[#E3001B] text-[#E3001B] h-12 rounded-full text-[14px] font-bold hover:bg-[#E3001B]/5 active:scale-95 transition-all flex-row-reverse"
 >
 Contactar soporte
 <Phone className="w-4 h-4" />
 </button>
 {status !== 'finalizada' && status !== 'cerrada' && (
 <button 
 onClick={() => {
   trackEvent('click_iniciar_reprogramacion', { token, estado_actual: status });
   setIsReprogramModalOpen(true);
   setReprogramStep('confirm_initial');
 }}
 className="w-full bg-[#1a202c] text-white h-12 rounded-full text-[14px] font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-md flex-row-reverse"
 >
 Reprogramar visita
 <AlertTriangle className="w-4 h-4" />
 </button>
 )}
 </div>
 </>
 )}
 </div>
 </motion.div>

 {/* MODALS REPROGRAMAR Y CANCELAR */}
 <AnimatePresence>
 {isCancelModalOpen && (
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
 >
 <motion.div
 initial={{ scale: 0.9, opacity: 0, y: 20 }}
 animate={{ scale: 1, opacity: 1, y: 0 }}
 exit={{ scale: 0.9, opacity: 0, y: 20 }}
 className="bg-white p-8 rounded-3xl shadow-2xl max-w-md w-full"
 >
 <div className="flex flex-col items-center text-center">
 <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
 <XCircle className="w-8 h-8 text-red-500" />
 </div>
 <h3 className="text-2xl font-bold text-gray-900 mb-2">¿Deseas cancelar?</h3>
 <p className="text-gray-500 mb-8 text-sm">
 Si deseas cancelar tu atención por favor comunícate a nuestros canales de atención.
 </p>
 <div className="flex flex-col w-full gap-3">
 <button 
 className="w-full bg-[#E3001B] text-white rounded-2xl h-12 text-sm font-bold shadow-lg shadow-red-500/20" 
 onClick={() => window.open('tel:017546000')}
 >
 Llamar a Central
 </button>
 <button 
 className="w-full rounded-2xl h-12 text-sm font-bold text-gray-500 bg-gray-100 " 
 onClick={() => setIsCancelModalOpen(false)}
 >
 Volver al seguimiento
 </button>
 </div>
 </div>
 </motion.div>
 </motion.div>
 )}
 </AnimatePresence>

 <AnimatePresence>
 {isReprogramModalOpen && (
 <motion.div
 initial={{ x: "100%" }}
 animate={{ x: 0 }}
 exit={{ x: "100%" }}
 transition={{ type: "spring", damping: 25, stiffness: 200 }}
 className="fixed inset-0 z-[100] bg-[#f3f4f6] flex flex-col font-sans"
 >
 {/* Header */}
 <div className="bg-white px-4 py-4 flex items-center shadow-sm z-10 shrink-0">
 <button 
 onClick={() => {
 setIsReprogramModalOpen(false);
 setReprogramStep('form');
 }} 
 className="p-2 -ml-2 text-[#E3001B] active:bg-[#E3001B]/10 rounded-full transition-colors"
 >
 <ArrowLeft className="w-6 h-6" />
 </button>
 <h2 className="flex-1 text-center font-bold text-[#E3001B] pr-8 text-[16px]">Reprogramación de visita</h2>
 </div>
 
 {/* Body */}
 <div className="flex-1 overflow-y-auto p-4 space-y-4">
 {/* Direction Box */}
 <div className="bg-white p-4 rounded-2xl flex items-start gap-3 shadow-sm border border-gray-100">
 <MapPin className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
 <div>
 <p className="text-[11px] text-gray-400 font-bold mb-0.5">Dirección</p>
 <p className="text-[13px] font-normal text-gray-600 leading-tight">{data.direccion || 'Cargando...'}</p>
 </div>
 </div>

 {/* Date Box */}
 <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
 <h3 className="font-bold text-[15px] text-gray-900 mb-2">Selecciona la fecha</h3>
 <div className="flex items-start gap-2 mb-4">
 <div className="w-4 h-4 rounded-full border border-[#E3001B] text-[#E3001B] flex items-center justify-center shrink-0 mt-0.5">
 <span className="text-[10px] font-bold">i</span>
 </div>
 <p className="text-[11px] text-[#E3001B] leading-tight font-normal">Ten en cuenta que depende de la disponibilidad de cupos.</p>
 </div>
 <div className="bg-gray-50 rounded-xl px-4 py-2 border border-gray-100">
 <p className="text-[10px] text-gray-400 mb-0.5">Fecha de Programación</p>
 <input 
 type="date"
 min={getTomorrowLocal()}
 value={reprogramData.fecha}
 onChange={(e) => setReprogramData({...reprogramData, fecha: e.target.value})}
 className="w-full bg-transparent text-[14px] font-normal text-gray-900 focus:outline-none"
 />
 </div>
 </div>

 {/* Time Slot Box (Only visible if Date is selected) */}
 {reprogramData.fecha && (
 <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
 <h3 className="font-bold text-[15px] text-gray-900 mb-4">Selecciona el tramo horario</h3>
 <div className="flex flex-wrap gap-2">
 {['08:00 - 12:00', '12:00 - 16:00', '16:00 - 20:00'].map(turno => (
 <label key={turno} className="flex-[1_1_30%]">
 <input 
 type="radio" 
 name="turno" 
 value={turno} 
 checked={reprogramData.turno === turno}
 onChange={(e) => setReprogramData({...reprogramData, turno: e.target.value})}
 className="peer hidden" 
 />
 <div className="text-center py-3 px-1 rounded-lg border border-gray-200 peer-checked:border-[#E3001B] peer-checked:text-[#E3001B] text-gray-600 text-[12px] font-bold transition-all bg-white cursor-pointer hover:border-[#E3001B]/50">
 {turno}
 </div>
 </label>
 ))}
 </div>
 </div>
 )}

 {/* Comments Box */}
 {reprogramData.turno && (
 <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
 <h3 className="font-bold text-[15px] text-gray-900 mb-4">Motivo de Reprogramación</h3>
 
 <div className="mb-4">
 <select
 value={reprogramData.motivoSeleccionado}
 onChange={(e) => setReprogramData({...reprogramData, motivoSeleccionado: e.target.value})}
 className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm text-gray-700 focus:outline-none focus:border-[#E3001B] focus:ring-1 focus:ring-[#E3001B]"
 >
 <option value="" disabled>Selecciona un motivo...</option>
 <option value="emergencia_personal">Emergencia personal / familiar</option>
 <option value="problemas_salud">Problemas de salud</option>
 <option value="viaje_inesperado">Viaje de último minuto</option>
 <option value="choque_horarios">Cruce de horarios con el trabajo / estudios</option>
 <option value="olvido">Olvidé la cita original</option>
 <option value="otro">Otro motivo</option>
 </select>
 </div>

 <h3 className="font-bold text-[14px] text-gray-900 mb-3">Detalle adicional (Opcional)</h3>
 <textarea 
 value={reprogramData.motivo}
 onChange={(e) => setReprogramData({...reprogramData, motivo: e.target.value})}
 className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm focus:outline-none focus:border-[#E3001B] focus:ring-1 focus:ring-[#E3001B] resize-none" 
 rows={2} 
 placeholder="Ej: No estaré en casa, por favor venir por la tarde..."
 ></textarea>

 <h3 className="font-bold text-[14px] text-gray-900 mb-3 mt-5">PIN de Seguridad</h3>
 <p className="text-[11px] text-gray-500 mb-2 leading-tight">
   Ingresa el PIN de 4 dígitos que te fue asignado para confirmar tu identidad.
 </p>
 <input 
 type="text"
 maxLength={4}
 value={reprogramData.pin_confirmacion}
 onChange={(e) => setReprogramData({...reprogramData, pin_confirmacion: e.target.value.replace(/\D/g, '')})}
 className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-center text-lg font-bold tracking-[0.5em] text-gray-900 focus:outline-none focus:border-[#E3001B] focus:ring-1 focus:ring-[#E3001B]"
 placeholder="----"
 />
 </div>
 )}
 </div>

 {/* Footer CTA */}
 <div className="bg-white p-4 shadow-[0_-10px_20px_rgba(0,0,0,0.05)] shrink-0">
 <button 
 disabled={!reprogramData.fecha || !reprogramData.turno || reprogramData.pin_confirmacion.length !== 4}
 onClick={handleReprogramSubmit}
 className="w-full bg-[#E3001B] disabled:bg-gray-300 disabled:text-gray-500 text-white font-bold h-12 rounded-full text-[14px] transition-colors shadow-lg shadow-[#E3001B]/20"
 >
 {isSubmittingReprogram ? "Confirmando..." : "Confirmar Reprogramación"}
 </button>
 </div>
 </motion.div>
 )}
 </AnimatePresence>

 {/* Confirm & Success Modals inside Reprogram flow */}
 <AnimatePresence>
 {isReprogramModalOpen && reprogramStep === 'confirm_initial' && (
 <motion.div 
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 className="fixed inset-0 z-[110] bg-black/40 flex items-center justify-center p-6 backdrop-blur-sm"
 >
 <motion.div 
 initial={{ scale: 0.9, y: 20 }}
 animate={{ scale: 1, y: 0 }}
 className="bg-white rounded-3xl p-8 max-w-sm w-full flex flex-col items-center text-center shadow-2xl"
 >
 <AlertTriangle className="w-16 h-16 text-[#E3001B] mb-6" strokeWidth={1.5} />
 <h3 className="text-[18px] font-bold text-gray-900 mb-4 leading-tight">¿Estás seguro de reprogramar tu visita?</h3>
 <p className="text-[12px] text-gray-500 mb-8 leading-relaxed">
 Al reprogramarla, se cancelará la fecha actual y deberás seleccionar una nueva disponibilidad para la visita.
 </p>
 <button 
 onClick={() => setReprogramStep('form')}
 className="w-full bg-[#E3001B] text-white font-bold h-12 rounded-full text-[14px] mb-3 shadow-lg shadow-[#E3001B]/20"
 >
 Confirmar
 </button>
 <button 
 onClick={() => setIsReprogramModalOpen(false)}
 className="w-full bg-white text-[#E3001B] font-bold h-12 rounded-full text-[14px]"
 >
 Volver
 </button>
 </motion.div>
 </motion.div>
 )}

 {isReprogramModalOpen && reprogramStep === 'success' && (
 <motion.div 
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 className="fixed inset-0 z-[120] bg-black/40 flex items-center justify-center p-6 backdrop-blur-sm"
 >
 <motion.div 
 initial={{ scale: 0.9, y: 20 }}
 animate={{ scale: 1, y: 0 }}
 className="bg-white rounded-3xl p-8 max-w-sm w-full flex flex-col items-center text-center shadow-2xl"
 >
 <div className="w-20 h-20 bg-white border-4 border-[#E3001B] rounded-full flex items-center justify-center mb-6">
 <Check className="w-10 h-10 text-gray-900" strokeWidth={4} />
 </div>
 <h3 className="text-[20px] font-bold text-gray-900 mb-3">Visita reprogramada</h3>
 <p className="text-[13px] text-gray-500 mb-8 leading-relaxed">
 Tu nueva visita ha sido confirmada. Revisa todos los detalles desde el historial de visitas.
 </p>
 <button 
 onClick={() => {
 setIsReprogramModalOpen(false);
 setReprogramStep('confirm_initial');
 }}
 className="w-full bg-[#E3001B] text-white font-bold h-12 rounded-full text-[14px] shadow-lg shadow-[#E3001B]/20"
 >
 Aceptar
 </button>
 </motion.div>
 </motion.div>
 )}
 </AnimatePresence>

 </div>
  );
};
export default Seguimiento;