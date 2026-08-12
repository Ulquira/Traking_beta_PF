const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src/pages/Seguimiento.tsx');
let content = fs.readFileSync(file, 'utf8');

// The file got completely broken. Let's fix the whole AnimatePresence block at the end.
// We will look for: {/* Confirm & Success Modals inside Reprogram flow */}
const marker = '{/* Confirm & Success Modals inside Reprogram flow */}';
const idx = content.indexOf(marker);

if (idx !== -1) {
  content = content.substring(0, idx + marker.length) + `
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
 <AlertTriangle className="w-16 h-16 text-[#FF5A1F] mb-6" strokeWidth={1.5} />
 <h3 className="text-[18px] font-black text-gray-900 mb-4 leading-tight">¿Estás seguro de reprogramar tu visita?</h3>
 <p className="text-[12px] text-gray-500 mb-8 leading-relaxed">
 Al reprogramarla, se cancelará la fecha actual y deberás seleccionar una nueva disponibilidad para la visita.
 </p>
 <button 
 onClick={() => setReprogramStep('form')}
 className="w-full bg-[#FF5A1F] text-white font-bold h-12 rounded-full text-[14px] mb-3 shadow-lg shadow-[#FF5A1F]/20"
 >
 Confirmar
 </button>
 <button 
 onClick={() => setIsReprogramModalOpen(false)}
 className="w-full bg-white text-[#FF5A1F] font-bold h-12 rounded-full text-[14px]"
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
 <div className="w-20 h-20 bg-white border-4 border-[#FF5A1F] rounded-full flex items-center justify-center mb-6">
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
 window.location.reload();
 }}
 className="w-full bg-[#FF5A1F] text-white font-bold h-12 rounded-full text-[14px] shadow-lg shadow-[#FF5A1F]/20"
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
  fs.writeFileSync(file, content);
  console.log("Fixed!");
} else {
  console.log("Marker not found.");
}
