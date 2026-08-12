const fs = require('fs');

const code = fs.readFileSync('src/pages/Seguimiento.tsx', 'utf8');

const breakPoint = '  if (loading) {';
const topHalf = code.substring(0, code.indexOf(breakPoint));

const newRender = \`  if (loading) {
    return (
      <div className="h-[100dvh] w-full bg-[#f3f4f6] dark:bg-background relative overflow-hidden flex flex-col font-sans">
        <div className="flex-1 bg-gray-200 dark:bg-gray-800 animate-pulse"></div>
        <div className="absolute bottom-0 w-full h-[40vh] bg-white dark:bg-card rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] p-8">
           <div className="w-16 h-2 bg-gray-300 dark:bg-gray-700 rounded-full mx-auto mb-8 animate-pulse"></div>
           <div className="w-3/4 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4 animate-pulse"></div>
           <div className="w-1/2 h-4 bg-gray-200 dark:bg-gray-700 rounded-lg mb-8 animate-pulse"></div>
           <div className="w-full h-20 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background flex-col gap-4 font-sans px-6 text-center">
        <h1 className="text-3xl font-black text-foreground">Instalación no encontrada</h1>
        <p className="text-muted-foreground text-lg">El link de seguimiento proporcionado es inválido o la operación no existe.</p>
        <Button onClick={() => navigate('/')} className="mt-4 rounded-full h-14 px-8 bg-[#FF5A1F] hover:bg-[#e04a17] text-white font-bold text-lg">Volver al inicio</Button>
      </div>
    );
  }

  const { status, tecnico, eta, fecha_programacion, tramo } = data;

  // Coordenadas
  const position = data.coordenadas_cliente || [-12.0971, -77.0369];
  const vehiclePosition = data.coordenadas_tecnico || [-12.0950, -77.0320];

  const steps = [
    { id: 'programada', label: 'Agendada', sub: 'Tu visita ha sido programada.', date: fecha_programacion },
    { id: 'asignado', label: 'Técnico Asignado', sub: 'Tenemos un técnico para ti.' },
    { id: 'en_camino', label: 'En camino', sub: 'El técnico ya está en ruta y pronto se comunicará contigo.' },
    { id: 'en_proceso', label: 'Iniciada', sub: 'Técnico revisando o instalando.' },
    { id: 'finalizada', label: 'Finalizada', sub: 'Instalación completada con éxito.' },
  ];

  const statusIndex = ['programada', 'asignado', 'en_camino', 'en_proceso', 'finalizada', 'cerrada'].indexOf(status);

  const getMessage = () => {
    if (status === 'cerrada' && (encuestaEnviada || localStorage.getItem(\`encuesta_completada_\${token}\`) === 'true')) {
      return '¡Muchas gracias por tus comentarios! Bienvenido a la familia de Perú Fibra.';
    }
    switch (status) {
      case 'programada': return 'Tu instalación está programada.';
      case 'asignado': return '¡Excelente! Tenemos un técnico asignado.';
      case 'en_camino': return '¡Tu técnico está en camino!';
      case 'en_proceso': return 'Instalación en progreso en este momento.';
      case 'finalizada': return '¡Tu instalación ha sido completada!';
      case 'cerrada': return 'Tu atención ha sido cerrada.';
      default: return '';
    }
  };

  return (
    <div className="h-[100dvh] w-full bg-[#f3f4f6] dark:bg-background relative overflow-hidden font-sans">
      
      {/* Floating Header (Back button + Notifs) */}
      <div className="absolute top-0 left-0 w-full p-4 z-20 flex justify-between items-start pointer-events-none">
        <button 
          onClick={() => navigate(\`/seguimiento/\${token}\`)} 
          className="w-12 h-12 bg-white/90 dark:bg-black/80 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg pointer-events-auto transition-transform active:scale-95"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-800 dark:text-gray-200"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <div className="pointer-events-auto bg-white/90 dark:bg-black/80 backdrop-blur-md rounded-full p-1 shadow-lg">
          <ModeToggle />
        </div>
      </div>

      {/* Map Layer (Background) */}
      <div className="absolute top-0 left-0 w-full h-[55vh] z-0 bg-muted">
        <MapContainer center={position} zoom={15} zoomControl={false} scrollWheelZoom={false} className="h-full w-full">
          <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
          <Marker position={position} icon={destIcon}><Popup>Tu dirección</Popup></Marker>
          
          {(status === 'en_camino' || status === 'en_proceso') && (
            <>
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
            </>
          )}
        </MapContainer>
        
        {/* Shadow fade to blend map with bottom sheet */}
        <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-black/20 to-transparent z-10 pointer-events-none"></div>
      </div>

      {/* Bottom Sheet (Draggable-style panel) */}
      <div className="absolute bottom-0 left-0 w-full h-[55vh] sm:h-[60vh] bg-white dark:bg-card rounded-t-[2.5rem] shadow-[0_-15px_40px_rgba(0,0,0,0.15)] z-20 flex flex-col">
        {/* Drag Handle */}
        <div className="w-full flex justify-center py-4 shrink-0 cursor-grab active:cursor-grabbing">
          <div className="w-14 h-1.5 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
        </div>

        {/* Scrollable Content inside Sheet */}
        <div className="flex-1 overflow-y-auto px-6 pb-10 scrollbar-hide">
          
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
                <div className="bg-gray-50 dark:bg-muted/30 rounded-3xl p-5 border border-gray-100 dark:border-border/50">
                  <p className="font-bold mb-4 text-foreground">¿El técnico llegó dentro del horario acordado?</p>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer bg-white dark:bg-card px-4 py-2 rounded-xl border flex-1">
                      <input type="radio" name="q1" value="Sí" onChange={(e) => setEncuesta({...encuesta, llego_horario: e.target.value})} className="accent-[#FF5A1F] w-4 h-4" /> 
                      <span className="font-medium text-sm">Sí</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer bg-white dark:bg-card px-4 py-2 rounded-xl border flex-1">
                      <input type="radio" name="q1" value="No" onChange={(e) => setEncuesta({...encuesta, llego_horario: e.target.value})} className="accent-[#FF5A1F] w-4 h-4" /> 
                      <span className="font-medium text-sm">No</span>
                    </label>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-muted/30 rounded-3xl p-5 border border-gray-100 dark:border-border/50">
                  <p className="font-bold mb-3 text-foreground">Del 1 al 10, ¿qué tan probable es que nos recomiende?</p>
                  <div className="flex flex-wrap gap-2">
                    {[1,2,3,4,5,6,7,8,9,10].map(num => (
                      <label key={num} className="flex-1 min-w-[30px]">
                        <input type="radio" name="nps" value={num} onChange={(e) => setEncuesta({...encuesta, probabilidad_recomendar: e.target.value})} className="peer hidden" />
                        <div className="border border-gray-200 dark:border-border bg-white dark:bg-card rounded-lg text-center py-2 text-sm font-bold text-gray-500 peer-checked:border-[#FF5A1F] peer-checked:bg-[#FF5A1F] peer-checked:text-white transition-all shadow-sm">
                          {num}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <Button 
                  onClick={handleEncuestaSubmit}
                  disabled={isSubmittingEncuesta}
                  className="w-full bg-[#FF5A1F] hover:bg-[#e04a17] text-white h-14 text-lg rounded-2xl shadow-lg transition-transform hover:-translate-y-1 font-bold">
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
              {/* Header inside sheet */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider mb-1">Tracking Nº</p>
                  <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">{data.idoperacion || token}</h2>
                </div>
                {(status === 'en_camino' || status === 'en_proceso') && (eta || calculatedEta) && (
                  <div className="bg-[#FF5A1F]/10 px-4 py-2 rounded-2xl border border-[#FF5A1F]/20 text-right">
                    <p className="text-[10px] text-[#FF5A1F] font-bold uppercase mb-0.5">Llegada est.</p>
                    <p className="text-sm font-black text-[#FF5A1F] leading-none">{calculatedEta || eta}</p>
                  </div>
                )}
              </div>

              {/* Technician Box (Uber-style) */}
              {tecnico && status !== 'finalizada' && (
                <div className="flex items-center gap-4 bg-gray-50 dark:bg-muted/40 p-4 rounded-2xl mb-8 border border-gray-100 dark:border-border/50">
                  <div className="w-14 h-14 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center shrink-0 border-2 border-white shadow-sm overflow-hidden">
                    <User className="w-7 h-7 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-900 dark:text-white text-lg leading-tight mb-1">
                      {tecnico.nombre.split(' ').slice(1).join(' ') || tecnico.nombre}
                    </p>
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                      <span className="text-xs font-bold text-gray-600 dark:text-gray-400">4.9</span>
                      <span className="text-xs text-gray-400 mx-1">•</span>
                      <span className="text-xs text-gray-500 font-medium">Técnico</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => window.open('tel:017546000')}
                    className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center hover:scale-105 transition-transform"
                  >
                    <Phone className="w-5 h-5 fill-current" />
                  </button>
                </div>
              )}

              {/* Vertical Timeline */}
              <div className="relative pl-5 border-l-2 border-gray-200 dark:border-gray-800 ml-3 space-y-8 mb-10">
                {steps.map((step, i) => {
                  const isPast = i <= statusIndex;
                  const isCurrent = i === statusIndex;
                  return (
                    <div key={step.id} className="relative">
                      {/* Timeline Dot */}
                      <div className={\`absolute -left-[29px] w-[18px] h-[18px] rounded-full border-[4px] border-white dark:border-card \${isPast ? 'bg-[#FF5A1F]' : 'bg-gray-300 dark:bg-gray-700'}\`}>
                        {isCurrent && (
                          <div className="absolute -inset-2 rounded-full border border-[#FF5A1F] animate-ping opacity-50"></div>
                        )}
                      </div>
                      
                      {/* Content */}
                      <div className="-mt-1">
                        <h4 className={\`font-black text-[15px] mb-0.5 \${isCurrent ? 'text-[#FF5A1F]' : isPast ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-600'}\`}>
                          {step.label}
                        </h4>
                        <p className="text-[13px] text-gray-500 dark:text-gray-400 font-medium leading-tight">
                          {step.sub}
                        </p>
                        {step.date && i === 0 && (
                          <p className="text-[11px] text-gray-400 mt-1">
                            {format(new Date(step.date), "dd-MM-yyyy, hh:mma")}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Action Buttons Footer */}
              {status !== 'finalizada' && status !== 'cerrada' && (
                <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-border/50">
                  <button 
                    onClick={() => setIsReprogramModalOpen(true)}
                    className="flex-1 bg-gray-100 dark:bg-muted text-gray-800 dark:text-white h-12 rounded-xl text-sm font-bold active:scale-95 transition-transform"
                  >
                    Reprogramar
                  </button>
                  <button 
                    onClick={() => setIsCancelModalOpen(true)}
                    className="flex-1 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 h-12 rounded-xl text-sm font-bold active:scale-95 transition-transform"
                  >
                    Cancelar visita
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* MODALS REPROGRAMAR Y CANCELAR (Se mantienen igual pero estilizados para encajar) */}
      <AnimatePresence>
        {isCancelModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            {/* Same cancel modal content */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white dark:bg-card p-8 rounded-3xl shadow-2xl max-w-md w-full"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-500/20 rounded-full flex items-center justify-center mb-6">
                  <XCircle className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">¿Deseas cancelar?</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-8 text-sm">
                  Si deseas cancelar tu atención por favor comunícate a nuestros canales de atención.
                </p>
                <div className="flex flex-col w-full gap-3">
                  <button 
                    className="w-full bg-[#FF5A1F] text-white rounded-2xl h-12 text-sm font-bold shadow-lg shadow-orange-500/20" 
                    onClick={() => window.open('tel:017546000')}
                  >
                    Llamar a Central
                  </button>
                  <button 
                    className="w-full rounded-2xl h-12 text-sm font-bold text-gray-500 bg-gray-100 dark:bg-gray-800" 
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="bg-white dark:bg-card p-6 sm:p-8 rounded-t-3xl sm:rounded-3xl shadow-2xl max-w-lg w-full"
            >
              <div className="w-12 h-1.5 bg-gray-300 mx-auto rounded-full mb-6 sm:hidden"></div>
              <div className="flex flex-col">
                <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Reprogramar</h3>
                <p className="text-gray-500 text-sm mb-6">Elige la nueva fecha y turno.</p>

                <div className="space-y-5 mb-8">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Nueva Fecha</label>
                    <input 
                      type="date" 
                      min={getTodayLocal()}
                      value={reprogramData.fecha}
                      onChange={(e) => setReprogramData({...reprogramData, fecha: e.target.value})}
                      className="w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm font-bold focus:border-[#FF5A1F] focus:ring-1 focus:ring-[#FF5A1F] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Turno</label>
                    <div className="flex gap-2">
                      <label className="flex-1 cursor-pointer">
                        <input type="radio" name="turno" value="Mañana (8am - 12pm)" checked={reprogramData.turno === 'Mañana (8am - 12pm)'} onChange={(e) => setReprogramData({...reprogramData, turno: e.target.value})} className="peer hidden" />
                        <div className="text-center py-3 rounded-xl border border-gray-200 dark:border-gray-700 peer-checked:border-[#FF5A1F] peer-checked:bg-[#FF5A1F]/10 font-bold text-gray-500 peer-checked:text-[#FF5A1F] transition-all text-xs">
                          Mañana
                        </div>
                      </label>
                      <label className="flex-1 cursor-pointer">
                        <input type="radio" name="turno" value="Tarde (1pm - 6pm)" checked={reprogramData.turno === 'Tarde (1pm - 6pm)'} onChange={(e) => setReprogramData({...reprogramData, turno: e.target.value})} className="peer hidden" />
                        <div className="text-center py-3 rounded-xl border border-gray-200 dark:border-gray-700 peer-checked:border-[#FF5A1F] peer-checked:bg-[#FF5A1F]/10 font-bold text-gray-500 peer-checked:text-[#FF5A1F] transition-all text-xs">
                          Tarde
                        </div>
                      </label>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Motivo (Opcional)</label>
                    <textarea 
                      value={reprogramData.motivo}
                      onChange={(e) => setReprogramData({...reprogramData, motivo: e.target.value})}
                      className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 text-sm focus:outline-none focus:border-[#FF5A1F] focus:ring-1 focus:ring-[#FF5A1F] resize-none" 
                      rows={2} 
                      placeholder="Ej: No estaré en casa..."
                    ></textarea>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={() => setIsReprogramModalOpen(false)}
                    className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-bold rounded-xl h-12 text-sm"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={handleReprogramSubmit}
                    disabled={isSubmittingReprogram}
                    className="flex-[2] bg-[#FF5A1F] text-white font-bold rounded-xl h-12 text-sm shadow-lg shadow-orange-500/20"
                  >
                    {isSubmittingReprogram ? "Enviando..." : "Confirmar Reprogramación"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Seguimiento;\`;

fs.writeFileSync('src/pages/Seguimiento.tsx', topHalf + newRender, 'utf8');
