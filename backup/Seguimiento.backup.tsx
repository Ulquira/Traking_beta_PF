import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Phone, CheckCircle2, Calendar, User, Navigation, Wrench, Info, Clock, MapPin, CalendarDays, XCircle, Truck } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import L from 'leaflet';
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { mockInstallations } from "@/data/mockData";
import Routing from "@/components/Routing";
import AnimatedMarker from "@/components/AnimatedMarker";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const vehicleIcon = L.divIcon({
  className: 'custom-vehicle-icon',
  html: `<div style="background-color: #0ea5e9; border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.2);">
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg>
  </div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  popupAnchor: [0, -20],
});

const destIcon = L.divIcon({
  className: 'custom-dest-icon',
  html: `<div style="background-color: #ef4444; border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.2);">
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
  </div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 40], // Pointing at the bottom
  popupAnchor: [0, -40],
});

const Seguimiento = () => {
  const { dni } = useParams();
  const navigate = useNavigate();
  const data = dni ? mockInstallations[dni] : null;
  const [routePoints, setRoutePoints] = useState<[number, number][]>([]);
  const [calculatedEta, setCalculatedEta] = useState<string | null>(null);

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 flex-col gap-4">
        <h1 className="text-2xl font-bold">Instalación no encontrada</h1>
        <Button onClick={() => navigate('/')}>Volver al inicio</Button>
      </div>
    );
  }

  const { status, tecnico, eta, trafico } = data;

  const position: [number, number] = [-12.0971, -77.0369];
  const vehiclePosition: [number, number] = [-12.0950, -77.0320];

  const steps = [
    { id: 'aprobada', label: 'Venta Aprobada', sub: 'Tu venta ha sido aprobada', icon: CheckCircle2 },
    { id: 'programada', label: 'Programada', sub: 'Tu instalación ha sido programada', icon: Calendar },
    { id: 'asignado', label: 'Técnico Asignado', sub: 'Ya tenemos un técnico para ti', icon: User },
    { id: 'en_camino', label: 'Técnico en Camino', sub: 'El técnico está en camino', icon: Navigation },
    { id: 'en_proceso', label: 'En Proceso', sub: 'Instalación en progreso', icon: Wrench },
    { id: 'finalizada', label: 'Finalizada', sub: '¡Todo listo!', icon: CheckCircle2 },
  ];

  const statusIndex = ['aprobada', 'programada', 'asignado', 'en_camino', 'en_proceso', 'finalizada'].indexOf(status === 'programada' ? 'programada' : status);
  const progressWidth = `${(statusIndex / (steps.length - 1)) * 100}%`;

  const getMessage = () => {
    switch (status) {
      case 'programada': return 'Tu instalación está programada. Te avisaremos cuando se asigne un técnico.';
      case 'asignado': return '¡Excelente! Ya tenemos un técnico asignado para tu instalación.';
      case 'en_camino': return '¡Tu técnico está en camino! Puedes ver su ubicación en tiempo real.';
      case 'en_proceso': return 'Tu instalación está siendo realizada en este momento.';
      case 'finalizada': return '¡Tu instalación ha sido completada exitosamente! Por favor, cuéntanos sobre tu experiencia.';
      default: return '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-[#ff5a1f] text-white py-6">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-start mb-6">
            <button onClick={() => navigate('/')} className="flex items-center text-sm hover:underline font-medium">
              <ArrowLeft className="w-4 h-4 mr-2" /> Volver
            </button>
            <Button variant="outline" className="bg-transparent border-white/30 text-white hover:bg-white/10">
              <Phone className="w-4 h-4 mr-2" /> Llamar a Central
            </Button>
          </div>
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-white p-2 rounded-lg">
                <span className="text-[#ff5a1f] font-black text-2xl tracking-tighter">WIN</span>
              </div>
            </div>
            <h1 className="text-3xl font-bold mb-2">Seguimiento de Instalación</h1>
            <p className="text-white/80">Número de seguimiento: {dni}</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 -mt-8">
        <div className="max-w-4xl mx-auto space-y-6">
          
          <Card className="p-8 shadow-md border-0 rounded-2xl bg-white overflow-hidden">
            <div className="relative overflow-x-auto pb-4">
              <div className="min-w-[600px]">
                <div className="absolute top-8 left-10 right-10 h-1 bg-gray-200 -z-10">
                  <div className="h-full bg-[#ff5a1f] transition-all duration-500" style={{ width: progressWidth }}></div>
                </div>

                <div className="flex justify-between relative">
                  {steps.map((step, i) => {
                    const isPast = i < statusIndex;
                    const isCurrent = i === statusIndex;
                    const Icon = step.icon;
                    return (
                      <div key={step.id} className="flex flex-col items-center w-32 shrink-0">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 transition-colors ${
                          isPast ? 'bg-[#22c55e] text-white shadow-md' : 
                          isCurrent ? 'bg-[#ff5a1f] text-white shadow-lg ring-4 ring-[#ff5a1f]/20' : 
                          'bg-white border-2 border-gray-200 text-gray-400'
                        }`}>
                          <Icon className="w-8 h-8" />
                        </div>
                        <span className={`font-semibold text-sm text-center ${isPast ? 'text-[#22c55e]' : isCurrent ? 'text-[#ff5a1f]' : 'text-gray-500 font-medium'}`}>
                          {step.label}
                        </span>
                        <span className="text-xs text-gray-400 text-center mt-1">{step.sub}</span>
                        {isCurrent && (
                          <span className="mt-2 text-xs bg-[#fff0eb] text-[#ff5a1f] px-3 py-1 rounded-full font-medium">Estado actual</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="mt-8 bg-[#fffaf8] border border-[#ffe0d4] rounded-xl p-4 text-center">
              <p className="text-gray-700 font-medium">{getMessage()}</p>
            </div>
          </Card>

          {/* Técnico Asignado */}
          {tecnico && (
            <Card className="p-8 shadow-sm border border-orange-100 rounded-2xl bg-[#fffaf8]">
              <div className="flex items-center gap-3 mb-6">
                <User className="w-5 h-5 text-[#ff5a1f]" />
                <h2 className="text-xl font-semibold text-gray-800">Tu Técnico Asignado</h2>
              </div>
              <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <div className="w-16 h-16 rounded-full bg-[#ffe0d4] flex items-center justify-center shrink-0">
                  <User className="w-8 h-8 text-[#ff5a1f]" />
                </div>
                <div>
                  <p className="font-bold text-lg text-gray-900">{tecnico.nombre}</p>
                  <p className="text-sm text-gray-500 flex items-center gap-1 mb-2">
                    <User className="w-3 h-3" /> {tecnico.cuadrilla}
                  </p>
                  <Button size="sm" className="bg-[#ff5a1f] hover:bg-[#e04a15] text-white rounded-lg">
                    <Phone className="w-4 h-4 mr-2" />
                    {tecnico.telefono}
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Mapa (Solo Programada y En Camino) */}
          {(status === 'programada' || status === 'en_camino') && (
            <Card className="p-0 shadow-sm border border-gray-200 rounded-2xl overflow-hidden bg-white">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Navigation className="w-6 h-6 text-[#ff5a1f]" />
                  <h2 className="text-xl font-semibold text-gray-800">
                    {status === 'en_camino' ? 'Ubicación en Tiempo Real' : 'Tu Ubicación'}
                  </h2>
                </div>
                {(calculatedEta || eta) && status === 'en_camino' && (
                  <div className="bg-orange-100 text-[#ff5a1f] px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                    <Clock className="w-4 h-4" /> {calculatedEta || eta}
                  </div>
                )}
              </div>

              <div className="p-6 bg-[#fffaf8]">
                {status === 'programada' && (
                  <div className="flex gap-4 p-4 bg-white rounded-xl border border-orange-100 shadow-sm mb-6">
                    <div className="w-10 h-10 rounded-full bg-[#ff5a1f]/10 flex items-center justify-center shrink-0">
                      <MapPin className="w-5 h-5 text-[#ff5a1f]" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">Tu ubicación de instalación</p>
                      <p className="text-sm text-gray-600 mt-1">El mapa muestra tu dirección. Cuando el técnico inicie su ruta, verás su ubicación en tiempo real.</p>
                    </div>
                  </div>
                )}

                <div className="h-[300px] w-full rounded-xl overflow-hidden border border-gray-200 relative z-0">
                  <MapContainer center={position} zoom={15} scrollWheelZoom={false} className="h-full w-full">
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <Marker position={position} icon={destIcon}><Popup>Tu dirección</Popup></Marker>
                    {status === 'en_camino' && (
                      <>
                        <Routing 
                          start={vehiclePosition} 
                          end={position} 
                          onRouteCalculated={(coords, timeInSeconds) => {
                            setRoutePoints(coords);
                            const minutes = Math.ceil(timeInSeconds / 60);
                            setCalculatedEta(`Llega en ${minutes} minutos`);
                          }} 
                        />
                        {routePoints.length > 0 ? (
                           <AnimatedMarker 
                             routePoints={routePoints} 
                             icon={vehicleIcon} 
                             popupText="El técnico está en camino" 
                           />
                        ) : (
                           <Marker position={vehiclePosition} icon={vehicleIcon}><Popup>El técnico</Popup></Marker>
                        )}
                      </>
                    )}
                  </MapContainer>
                </div>

                {trafico && (
                  <div className="mt-4 bg-yellow-50 border border-yellow-200 p-3 rounded-xl text-sm text-yellow-800 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                    <div>
                      <span className="font-semibold">{trafico}</span>
                      <p className="text-xs text-yellow-700 mt-0.5">ETA calculado considerando condiciones actuales de Lima</p>
                    </div>
                  </div>
                )}

                <div className="mt-4 flex items-start gap-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <MapPin className="w-5 h-5 text-gray-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-800 text-sm">Tu dirección</p>
                    <p className="text-gray-500 text-sm mt-0.5">Calle Las Magnolias 156, San Isidro, Lima</p>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Encuesta (Solo Finalizada) */}
          {status === 'finalizada' && (
            <Card className="p-8 shadow-sm border border-gray-200 rounded-2xl bg-white">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Cuéntanos sobre tu experiencia</h2>
              
              <div className="space-y-6">
                <div>
                  <p className="font-medium mb-3 text-gray-800">¿El técnico llegó dentro del horario acordado?</p>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2"><input type="radio" name="q1" className="accent-[#ff5a1f] w-4 h-4" /> Sí</label>
                    <label className="flex items-center gap-2"><input type="radio" name="q1" className="accent-[#ff5a1f] w-4 h-4" /> No</label>
                  </div>
                </div>

                <div>
                  <p className="font-medium mb-3 text-gray-800">¿Cómo calificaría la amabilidad y profesionalismo del técnico?</p>
                  <div className="space-y-2">
                    {['Excelente', 'Bueno', 'Aceptable', 'Malo', 'Muy malo'].map(opt => (
                      <label key={opt} className="flex items-center gap-2"><input type="radio" name="q2" className="accent-[#ff5a1f] w-4 h-4" /> {opt}</label>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="font-medium mb-3 text-gray-800">¿El técnico explicó de manera clara cómo utilizar su servicio de Internet?</p>
                  <div className="space-y-2">
                    {['Sí, muy claro', 'Sí, algo claro', 'No, no explicó bien', 'No, no me explicó nada'].map(opt => (
                      <label key={opt} className="flex items-center gap-2"><input type="radio" name="q3" className="accent-[#ff5a1f] w-4 h-4" /> {opt}</label>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="font-medium mb-3 text-gray-800">¿Qué tan probable es que nos recomiende a sus amigos o familiares?</p>
                  <p className="text-sm text-gray-500 mb-3">(Escala del 1 al 10, siendo 1 "Nada probable" y 10 "Muy probable")</p>
                  <div className="flex flex-wrap gap-2">
                    {[1,2,3,4,5,6,7,8,9,10].map(num => (
                      <label key={num} className="flex-1 min-w-[40px]">
                        <div className="border rounded-lg text-center py-2 cursor-pointer hover:bg-orange-50 hover:border-orange-200 transition-colors">
                          <input type="radio" name="nps" className="hidden" />
                          <span className="font-medium text-gray-700">{num}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="font-medium mb-3 text-gray-800">Comentarios adicionales</p>
                  <textarea 
                    className="w-full border rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff5a1f]/50" 
                    rows={4} 
                    placeholder="Cuéntanos más sobre tu experiencia..."
                  ></textarea>
                </div>

                <Button className="w-full bg-[#ff5a1f] hover:bg-[#e04a15] text-white h-12 text-lg rounded-xl">
                  Enviar respuestas
                </Button>
              </div>
            </Card>
          )}

          {/* Botones de Acción (Reprogramar, Cancelar, Reportar) */}
          <div className="space-y-3 pt-4">
            {status !== 'finalizada' && (
              <>
                <Button className="w-full bg-[#ff5a1f] hover:bg-[#e04a15] text-white h-14 text-lg rounded-xl flex items-center justify-center gap-2">
                  <CalendarDays className="w-5 h-5" /> Reprogramar Instalación
                </Button>
                <Button variant="destructive" className="w-full bg-[#ef4444] hover:bg-[#dc2626] text-white h-14 text-lg rounded-xl flex items-center justify-center gap-2">
                  <XCircle className="w-5 h-5" /> Cancelar Instalación
                </Button>
              </>
            )}
            
            {(status === 'en_camino' || status === 'en_proceso' || status === 'finalizada') && (
              <Button variant="outline" className="w-full bg-white text-gray-700 hover:bg-gray-50 border-gray-200 h-14 text-lg rounded-xl flex items-center justify-center gap-2">
                <XCircle className="w-5 h-5" /> Reportar Incidente
              </Button>
            )}
          </div>

        </div>
      </main>
    </div>
  );
};

export default Seguimiento;