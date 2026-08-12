const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src/pages/Seguimiento.tsx');

let content = fs.readFileSync(file, 'utf8');

// Aplicamos reemplazos para llegar directo al estado final minimalista en un solo paso

// 1. Quitar dependencias innecesarias y arreglar importaciones
content = content.replace('import { ArrowLeft, Phone, CheckCircle2, Calendar, User, Navigation, Wrench, Clock, MapPin, CalendarDays, XCircle, Star, BellRing } from "lucide-react";', 'import { Phone, CheckCircle2, User, XCircle, Star, Bell, Check, MapPin, AlertTriangle, ArrowLeft } from "lucide-react";');
content = content.replace('import { MapContainer, TileLayer, Marker, Popup } from \'react-leaflet\';', 'import { MapContainer, TileLayer, Marker, Popup, useMap } from \'react-leaflet\';');
content = content.replace('import { ModeToggle } from "@/components/ModeToggle";', 'import { PeruFibraLogo } from "@/components/PeruFibraLogo";');
content = content.replace('import { es } from "date-fns/locale";', '');
content = content.replace('import { Card } from "@/components/ui/card";', '');

// 2. Colores y diseño del Marker
content = content.replace(/background-color: #ff5a1f/g, 'background-color: #E3001B');
content = content.replace(/rgba\(255, 90, 31, 0.4\)/g, 'rgba(227, 0, 27, 0.4)');

// 3. Añadir AutoFitMap
const autoFitMapCode = `
export interface InstalacionData {
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
 cliente_nombre?: string;
 direccion?: string;
 campana?: string;
}

const AutoFitMap = ({ routePoints, position, vehiclePosition }: { routePoints: [number, number][], position: [number, number], vehiclePosition: [number, number] }) => {
  const map = useMap();
  const fitted = useRef(false);

  useEffect(() => {
    let points = routePoints;
    if (points.length === 0) {
      points = [position, vehiclePosition];
    }
    if (points.length > 0 && !fitted.current) {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { paddingBottomRight: [0, 20], paddingTopLeft: [20, 20], animate: false });
      fitted.current = true;
    }
  }, [map, routePoints, position, vehiclePosition]);
  return null;
};
`;

content = content.replace(/export interface InstalacionData [\s\S]*?\}\n/, autoFitMapCode);

// 4. Actualizar toda la función Seguimiento con la versión final que funcionaba (sin bugs de jsx)

const seguimientoFuncStart = content.indexOf('const Seguimiento = () => {');
const lastBrace = content.lastIndexOf('export default Seguimiento;');

const newSeguimientoCode = `const Seguimiento = () => {
 const { token } = useParams();
 const navigate = useNavigate();
 
 const [data, setData] = useState<InstalacionData | null>(null);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState(false);

 const [routePoints, setRoutePoints] = useState<[number, number][]>([]);
 const [calculatedEta, setCalculatedEta] = useState<string | null>(null);
 const [calculatedDurationSec, setCalculatedDurationSec] = useState<number>(0);
 const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
 const [isReprogramModalOpen, setIsReprogramModalOpen] = useState(false);
 const [reprogramStep, setReprogramStep] = useState<'confirm_initial' | 'form' | 'success'>('confirm_initial');
 const [reprogramData, setReprogramData] = useState({ fecha: '', turno: '', motivo: '' });
 const [isSubmittingReprogram, setIsSubmittingReprogram] = useState(false);
 
 const [encuesta, setEncuesta] = useState({
 llego_horario: '',
 calificacion_tecnico: '',
 explicacion_clara: '',
 tiempo_adecuado: '',
 informacion_clara: '',
 probabilidad_recomendar: '',
 comentarios: ''
 });
 const [isSubmittingEncuesta, setIsSubmittingEncuesta] = useState(false);
 const [encuestaEnviada, setEncuestaEnviada] = useState(false);

 const previousStatus = useRef<string | null>(null);
 const [notifications, setNotifications] = useState<{title: string, body: string, time: Date, read: boolean}[]>([]);
 const [showNotifications, setShowNotifications] = useState(false);
 const [sheetHeight, setSheetHeight] = useState(40);

 useEffect(() => {
 if ("Notification" in window && Notification.permission === "default") {
 Notification.requestPermission();
 }
 }, []);

 const triggerNotification = (newStatus: string, tecnicoData: any) => {
 let title = "¡Actualización de tu servicio!";
 let body = "";
 
 switch(newStatus) {
 case 'asignado': body = \`El técnico \${tecnicoData?.nombre || ''} ha sido asignado a tu instalación.\`; break;
 case 'en_camino': body = "Tu técnico ya está en camino a tu domicilio. Revisa el mapa."; break;
 case 'en_proceso': body = "La instalación está en proceso en este momento."; break;
 case 'finalizada': body = "Instalación completada. Por favor evalúa nuestro servicio."; break;
 default: return;
 }

 setNotifications(prev => [{ title, body, time: new Date(), read: false }, ...prev]);

 if ("Notification" in window && Notification.permission === "granted") {
 new Notification(title, { body });
 }
 };

 const getTodayLocal = () => {
 const today = new Date();
 const localDate = new Date(today.getTime() - (today.getTimezoneOffset() * 60000));
 return localDate.toISOString().split('T')[0];
 };

 const handleReprogramSubmit = async () => {
 setIsSubmittingReprogram(true);
 try {
 const response = await fetch(\`\${import.meta.env.VITE_API_URL}/api/reprogramar\`, {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({
 token,
 ...reprogramData
 })
 });

 const result = await response.json();
 if (result.success) {
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
 if (!encuesta.probabilidad_recomendar) {
 alert("Por favor bríndanos una calificación del 1 al 10 antes de enviar.");
 return;
 }

 setIsSubmittingEncuesta(true);
 try {
 const response = await fetch(\`\${import.meta.env.VITE_API_URL}/api/encuesta\`, {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({
 token,
 ...encuesta
 })
 });

 const result = await response.json();
 if (result.success) {
 setEncuestaEnviada(true);
 localStorage.setItem(\`encuesta_completada_\${token}\`, 'true');
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

 useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;

    const fetchInstalacion = async () => {
      try {
        const response = await fetch(\`\${import.meta.env.VITE_API_URL}/api/instalaciones/\${token}\`);
        const result = await response.json();
        
        if (result.success) {
          const fetchedData = result.data;

          const hasCompletedSurveyLocal = localStorage.getItem(\`encuesta_completada_\${token}\`);
          
          if (hasCompletedSurveyLocal === 'true') {
            fetchedData.status = 'cerrada';
          } else {
            try {
              const checkResponse = await fetch(\`\${import.meta.env.VITE_API_URL}/api/encuesta/verificar/\${token}\`);
              const checkResult = await checkResponse.json();
              
              if (checkResult.success && checkResult.completada) {
                localStorage.setItem(\`encuesta_completada_\${token}\`, 'true');
                fetchedData.status = 'cerrada';
              }
            } catch (e) {
              console.error("Error verificando encuesta en servidor", e);
            }
          }
          
          if (previousStatus.current && previousStatus.current !== fetchedData.status) {
            triggerNotification(fetchedData.status, fetchedData.tecnico);
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
 <h1 className="text-3xl font-black text-foreground">Instalación no encontrada</h1>
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

 const handleDragEnd = (e: any, info: any) => {
   if (info.offset.y < -50) {
     setSheetHeight(85);
   } else if (info.offset.y > 50) {
     setSheetHeight(25);
   }
 };

 const getMessage = () => {
 if (status === 'cerrada' && (encuestaEnviada || localStorage.getItem(\`encuesta_completada_\${token}\`) === 'true')) {
 return '¡Muchas gracias por tus comentarios!';
 }
 switch (status) {
 case 'programada': return 'Tu instalación está programada.';
 case 'asignado': return '¡Excelente! Tenemos un técnico asignado.';
 case 'en_camino': return '¡Tu técnico está en camino!';
 case 'en_proceso': return 'Instalación en progreso.';
 case 'finalizada': return '¡Tu instalación ha sido completada!';
 case 'cerrada': return 'Tu atención ha sido cerrada.';
 default: return '';
 }
 };

 return (
 <div className="h-[100dvh] w-full bg-[#f3f4f6] relative overflow-hidden font-sans">
 
 {/* Floating Header (Only for map view to go back) */}
 {(status === 'en_camino' || status === 'en_proceso') && (
 <div className="absolute top-0 left-0 w-full p-4 z-20 flex justify-between items-start pointer-events-none mt-2">
 <button 
 onClick={() => navigate(\`/\`)} 
 className="w-12 h-12 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg pointer-events-auto transition-transform active:scale-95"
 >
 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-800"><path d="m15 18-6-6 6-6"/></svg>
 </button>
 </div>
 )}

 {/* Map Layer (Background) */}
 {(status === 'en_camino' || status === 'en_proceso') && (
 <div className="absolute top-0 left-0 w-full h-[65vh] z-0 bg-muted">
 <MapContainer center={position} zoom={15} zoomControl={false} scrollWheelZoom={false} className="h-full w-full">
 <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
 <Marker position={position} icon={destIcon}><Popup>Tu dirección</Popup></Marker>
 
 <AutoFitMap routePoints={routePoints} position={position} vehiclePosition={vehiclePosition} />

 <Routing 
 start={vehiclePosition} 
 end={position} 
 onRouteCalculated={(coords, timeInSeconds) => {
 setRoutePoints(coords);
 setCalculatedDurationSec(timeInSeconds);
 const minutes = Math.ceil(timeInSeconds / 60);
 const arrivalTime = new Date();
 arrivalTime.setMinutes(arrivalTime.getMinutes() + minutes);
 const timeFormat = arrivalTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
 setCalculatedEta(\`\${minutes} min (\${timeFormat})\`);
 }} 
 />
 {routePoints.length > 0 ? (
 <AnimatedMarker 
 routePoints={routePoints} 
 durationSeconds={calculatedDurationSec}
 icon={vehicleIcon} 
 popupText="El técnico está en camino" 
 />
 ) : (
 <Marker position={vehiclePosition} icon={vehicleIcon}><Popup>El técnico</Popup></Marker>
 )}
 </MapContainer>
 </div>
 )}

 {/* Dynamic Content Container */}
 <motion.div 
  animate={{ 
    height: (status === 'en_camino' || status === 'en_proceso') ? \`\${sheetHeight}vh\` : '100vh' 
  }}
  transition={{ type: "spring", stiffness: 300, damping: 30 }}
  drag={(status === 'en_camino' || status === 'en_proceso') ? "y" : false}
  dragConstraints={{ top: 0, bottom: 0 }}
  dragElastic={0.2}
  onDragEnd={handleDragEnd}
  className={\`absolute left-0 bottom-0 w-full bg-white shadow-[0_-15px_40px_rgba(0,0,0,0.15)] z-20 flex flex-col \${
    status === 'en_camino' || status === 'en_proceso' ? 'rounded-t-[2.5rem]' : 'rounded-none top-0 pt-0'
 }\`}>
 
 {/* Top Banner Orange (Always visible if no map) */}
 {!(status === 'en_camino' || status === 'en_proceso') && (
 <div className="bg-[#E3001B] w-full pt-12 pb-6 px-6 text-white shrink-0 relative z-30">
 <div className="flex justify-between items-center mb-4">
 <div className="flex items-center">
 <PeruFibraLogo white className="h-6 sm:h-7" />
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
 <h1 className="text-2xl font-black mt-2">
 Hola, {data.cliente_nombre ? data.cliente_nombre.split(' ')[0] : 'Cliente'}
 </h1>
 </div>
 )}

 {/* Drag Handle (Only when map is visible) */}
 {(status === 'en_camino' || status === 'en_proceso') && (
 <div className="w-full flex flex-col items-center justify-center pt-3 pb-2 shrink-0 cursor-grab active:cursor-grabbing hover:bg-gray-50 rounded-t-[2.5rem] transition-colors">
 <div className="w-12 h-1.5 bg-gray-300 rounded-full mb-1"></div>
 {sheetHeight === 25 && <p className="text-[10px] text-gray-400 font-bold tracking-widest uppercase">Desliza para más detalles</p>}
 </div>
 )}

 {/* Scrollable Content inside Sheet */}
 <div className="flex-1 overflow-y-auto px-6 pb-10 scrollbar-hide pt-1">
 
 {status === 'cerrada' && !encuestaEnviada && localStorage.getItem(\`encuesta_completada_\${token}\`) !== 'true' ? (
 <div className="text-center py-8">
 <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
 <XCircle className="w-10 h-10 text-primary" />
 </div>
 <h2 className="text-3xl font-black text-foreground mb-4">Atención Cerrada</h2>
 <p className="text-lg text-muted-foreground mb-8 font-medium">
 {getMessage()}
 </p>
 <Button 
 onClick={() => window.open('tel:017546000')} 
 className="w-full bg-secondary hover:bg-yellow-500 text-black font-bold rounded-2xl h-14 shadow-lg text-lg"
 >
 <Phone className="w-5 h-5 mr-2" /> Llamar a ATC
 </Button>
 </div>
 ) : status === 'finalizada' && !encuestaEnviada && localStorage.getItem(\`encuesta_completada_\${token}\`) !== 'true' ? (
 <div className="py-2">
 <div className="flex items-center gap-3 mb-6">
 <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
 <Star className="w-6 h-6 text-yellow-600 fill-yellow-500" />
 </div>
 <h2 className="text-2xl font-black text-foreground leading-tight">Cuéntanos sobre<br/>tu experiencia</h2>
 </div>
 
 <div className="space-y-6">
 <div className="bg-gray-50 rounded-3xl p-5 border border-gray-100 ">
 <p className="font-bold mb-4 text-foreground">¿El técnico llegó dentro del horario acordado?</p>
 <div className="flex gap-4">
 <label className="flex items-center gap-2 cursor-pointer bg-white px-4 py-2 rounded-xl border flex-1">
 <input type="radio" name="q1" value="Sí" onChange={(e) => setEncuesta({...encuesta, llego_horario: e.target.value})} className="accent-[#E3001B] w-4 h-4" /> 
 <span className="font-medium text-sm">Sí</span>
 </label>
 <label className="flex items-center gap-2 cursor-pointer bg-white px-4 py-2 rounded-xl border flex-1">
 <input type="radio" name="q1" value="No" onChange={(e) => setEncuesta({...encuesta, llego_horario: e.target.value})} className="accent-[#E3001B] w-4 h-4" /> 
 <span className="font-medium text-sm">No</span>
 </label>
 </div>
 </div>

 <div className="bg-gray-50 rounded-3xl p-5 border border-gray-100 ">
 <p className="font-bold mb-3 text-foreground">Del 1 al 10, ¿qué tan probable es que nos recomiende?</p>
 <div className="flex flex-wrap gap-2">
 {[1,2,3,4,5,6,7,8,9,10].map(num => (
 <label key={num} className="flex-1 min-w-[30px]">
 <input type="radio" name="nps" value={num} onChange={(e) => setEncuesta({...encuesta, probabilidad_recomendar: e.target.value})} className="peer hidden" />
 <div className="border border-gray-200 bg-white rounded-lg text-center py-2 text-sm font-bold text-gray-500 peer-checked:border-[#E3001B] peer-checked:bg-[#E3001B] peer-checked:text-white transition-all shadow-sm">
 {num}
 </div>
 </label>
 ))}
 </div>
 </div>

 <Button 
 onClick={handleEncuestaSubmit}
 disabled={isSubmittingEncuesta}
 className="w-full bg-[#E3001B] hover:bg-[#c90018] text-white h-14 text-lg rounded-2xl shadow-lg transition-transform hover:-translate-y-1 font-bold">
 {isSubmittingEncuesta ? "Enviando..." : "Enviar encuesta"}
 </Button>
 </div>
 </div>
 ) : (encuestaEnviada || localStorage.getItem(\`encuesta_completada_\${token}\`) === 'true') && (status === 'finalizada' || status === 'cerrada') ? (
 <div className="text-center py-10">
 <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
 <CheckCircle2 className="w-12 h-12 text-green-500" />
 </div>
 <h2 className="text-3xl font-black text-foreground mb-4">¡Gracias!</h2>
 <p className="text-lg text-muted-foreground font-medium px-4">
 {getMessage()}
 </p>
 </div>
 ) : (
 <>
 {/* Info Card Minimalista */}
 <div className="border border-gray-200 rounded-[20px] p-5 mb-8 bg-white shadow-sm mt-4">
 <div className="flex justify-between items-center mb-4">
 <span className="text-gray-500 text-[13px] font-medium">Día</span>
 <span className="font-bold text-gray-900 text-sm">
 {data.fecha_programacion ? format(new Date(data.fecha_programacion), "dd/MM/yyyy") : 'Por definir'}
 </span>
 </div>
 <div className="flex justify-between items-center mb-4">
 <span className="text-gray-500 text-[13px] font-medium">Hora estimada</span>
 <span className="font-bold text-gray-900 text-sm">
 {data.tramo || 'De 8:00 am. a 12:00 pm'}
 </span>
 </div>
 {(status === 'en_camino' || status === 'en_proceso') && (eta || calculatedEta) && (
 <div className="flex justify-between items-center mb-4 bg-[#E3001B]/10 px-3 py-2 rounded-lg">
 <span className="text-[#E3001B] text-[13px] font-bold flex items-center gap-2">
    <span className="relative flex h-2.5 w-2.5">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E3001B] opacity-75"></span>
      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#E3001B]"></span>
    </span>
    Llegada del técnico
 </span>
 <span className="font-black text-[#E3001B] text-sm">{calculatedEta || eta}</span>
 </div>
 )}
 <div className="flex justify-between items-start">
 <span className="text-gray-500 text-[13px] font-medium mt-0.5">Dirección</span>
 <span className="font-bold text-gray-900 text-sm text-right w-2/3 leading-snug">
 {data.direccion || 'Cargando...'}
 </span>
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
 <div className={\`absolute -left-[35px] top-0 w-[20px] h-[20px] rounded-full flex items-center justify-center border-[2px] border-white shadow-sm \${isCompleted ? 'bg-[#E3001B]' : 'bg-gray-300 '}\`}>
 {isCompleted && <Check className="w-[11px] h-[11px] text-white" strokeWidth={4} />}
 </div>
 
 {/* Content */}
 <div className="flex flex-col justify-start">
 <h4 className={\`font-bold text-[15px] leading-tight \${isCompleted ? 'text-gray-900 ' : 'text-gray-400 '}\`}>
 {step.label}
 </h4>
 
 {/* Solo mostramos subtítulos y fecha si ya se completó o es el estado actual */}
 {isCompleted && (
 <>
 <p className={\`text-[12px] leading-tight mt-1 \${isCurrent ? 'text-gray-500 ' : 'text-gray-400'}\`}>
 {step.sub}
 </p>
 {step.date && i === 0 && (
 <p className="text-[12px] text-gray-500 mt-1">
 {format(new Date(step.date), "dd-MM-yyyy, hh:mma a")}
 </p>
 )}
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
 <span className="text-[11px] text-gray-500 font-medium">Técnico asignado</span>
 </div>
 </div>
 <button 
 onClick={() => window.open('tel:017546000')}
 className="w-10 h-10 rounded-full border border-[#E3001B] text-[#E3001B] flex items-center justify-center hover:bg-[#E3001B]/10 transition-colors shrink-0"
 >
 <Phone className="w-4 h-4 fill-current" />
 </button>
 </div>
 )}
 
 </div>
 </div>
 );
 })}
 </div>

 {/* Action Buttons and Help Center CTA (Bottom) */}
 <div className="flex flex-col gap-3 pt-6 pb-2 border-t border-gray-100 mt-2">
 <p className="text-[12px] text-gray-500 text-center mb-1">¿Necesitas ayuda?</p>
 <button 
 onClick={() => window.open('https://wa.me/51999999999')}
 className="w-full flex items-center justify-center gap-2 border border-[#E3001B] text-[#E3001B] h-12 rounded-full text-[14px] font-bold hover:bg-[#E3001B]/5 active:scale-95 transition-all"
 >
 Comunícate con nosotros
 <Phone className="w-4 h-4" />
 </button>
 {status !== 'finalizada' && status !== 'cerrada' && (
 <button 
 onClick={() => {
 setIsReprogramModalOpen(true);
 setReprogramStep('confirm_initial');
 }}
 className="w-full bg-[#1a202c] text-white h-12 rounded-full text-[14px] font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-md"
 >
 Reprogramar solicitud
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
 <h3 className="text-2xl font-black text-gray-900 mb-2">¿Deseas cancelar?</h3>
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
 <p className="text-[13px] font-medium text-gray-600 leading-tight">{data.direccion || 'Cargando...'}</p>
 </div>
 </div>

 {/* Date Box */}
 <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
 <h3 className="font-bold text-[15px] text-gray-900 mb-2">Selecciona la fecha</h3>
 <div className="flex items-start gap-2 mb-4">
 <div className="w-4 h-4 rounded-full border border-[#E3001B] text-[#E3001B] flex items-center justify-center shrink-0 mt-0.5">
 <span className="text-[10px] font-bold">i</span>
 </div>
 <p className="text-[11px] text-[#E3001B] leading-tight font-medium">Ten en cuenta que depende de la disponibilidad de cupos.</p>
 </div>
 <div className="bg-gray-50 rounded-xl px-4 py-2 border border-gray-100">
 <p className="text-[10px] text-gray-400 mb-0.5">Fin de la suspensión</p>
 <input 
 type="date"
 min={getTodayLocal()}
 value={reprogramData.fecha}
 onChange={(e) => setReprogramData({...reprogramData, fecha: e.target.value})}
 className="w-full bg-transparent text-[14px] font-medium text-gray-900 focus:outline-none"
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
 <h3 className="font-bold text-[15px] text-gray-900 mb-4">Motivo (Opcional)</h3>
 <textarea 
 value={reprogramData.motivo}
 onChange={(e) => setReprogramData({...reprogramData, motivo: e.target.value})}
 className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm focus:outline-none focus:border-[#E3001B] focus:ring-1 focus:ring-[#E3001B] resize-none" 
 rows={2} 
 placeholder="Ej: No estaré en casa..."
 ></textarea>
 </div>
 )}
 </div>

 {/* Footer CTA */}
 <div className="bg-white p-4 shadow-[0_-10px_20px_rgba(0,0,0,0.05)] shrink-0">
 <button 
 disabled={!reprogramData.fecha || !reprogramData.turno}
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
 <h3 className="text-[18px] font-black text-gray-900 mb-4 leading-tight">¿Estás seguro de reprogramar tu visita?</h3>
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
 <h3 className="text-[20px] font-black text-gray-900 mb-3">Visita reprogramada</h3>
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
`;

content = content.replace(content.substring(seguimientoFuncStart, lastBrace), newSeguimientoCode);

fs.writeFileSync(file, content);
console.log("Restauración a estado final lista");
