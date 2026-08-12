const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src/pages/Seguimiento.tsx');
let content = fs.readFileSync(file, 'utf8');

// Find the last AnimatePresence and properly close the component.
const index = content.lastIndexOf('Volver\n </button>\n </motion.div>\n </motion.div>\n )}');
if (index !== -1) {
  content = content.substring(0, index + 50) + `
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
 setReprogramStep('form');
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
}
