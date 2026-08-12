const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src/pages/Seguimiento.tsx');
let content = fs.readFileSync(file, 'utf8');

const targetStr = ` {step.date && i === 0 && (
 <p className="text-[12px] text-gray-500 mt-1">
 {format(new Date(step.date), "dd-MM-yyyy, hh:mma a")}
 </p>
 )}
 </>
 )}

 {/* Technician Box integrado en la línea de tiempo */}
 {step.id === 'asignado' && isCompleted && tecnico && (
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
 <div className="flex flex-col gap-3 pt-6 pb-2 border-t border-gray-100">
 {status !== 'finalizada' && status !== 'cerrada' && (
 <button 
 onClick={() => {
 setIsReprogramModalOpen(true);
 setReprogramStep('confirm_initial');
 }}
 className="w-full bg-[#1a202c] text-white h-12 rounded-full text-[14px] font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-md"
 >
 {status === 'en_camino' ? (
  <>
    <MapPin className="w-[14px] h-[14px]" /> Seguir al técnico
  </>
 ) : (
  "Reprogramar solicitud"
 )}
 </button>
 )}
 <p className="text-[12px] text-gray-500 text-center mt-2">¿Necesitas ayuda?</p>
 <button 
 onClick={() => window.open('https://wa.me/51999999999')}
 className="w-full flex items-center justify-center gap-2 border border-[#E3001B] text-[#E3001B] h-12 rounded-full text-[14px] font-bold hover:bg-[#E3001B]/5 active:scale-95 transition-all"
 >
 Comunícate con nosotros
 <Phone className="w-4 h-4" />
 </button>
 </div>
 </>`;

// Actually the file content has:
//  {step.date && i === 0 && (
//  <p className="text-[12px] text-gray-500 mt-1">
//  {format(new Date(step.date), "dd-MM-yyyy, hh:mma a")}
//  </p>
//  )}
//  </>
//  )}
//  
//  {/* Action Button */}
//  {isCurrent && status !== 'finalizada' && status !== 'cerrada' && ( ... )}

const regexToReplace = /\{\/\* Action Button \*\/\}[\s\S]*?(?=\{\/\* Help Center CTA \(Bottom\) \*\/})/g;

if (content.match(regexToReplace)) {
  // Erase the old Action Button logic from the step map
  content = content.replace(regexToReplace, `
 {/* Technician Box integrado en la línea de tiempo */}
 {step.id === 'asignado' && isCompleted && tecnico && (
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
 `);

  // Now replace the Help Center part
  const helpRegex = /\{\/\* Help Center CTA \(Bottom\) \*\/\}[\s\S]*?<\/div>[\s]*<\/>/g;
  content = content.replace(helpRegex, `
 {/* Action Buttons and Help Center CTA (Bottom) */}
 <div className="flex flex-col gap-3 pt-6 pb-2 border-t border-gray-100">
 {status !== 'finalizada' && status !== 'cerrada' && (
 <button 
 onClick={() => {
 setIsReprogramModalOpen(true);
 setReprogramStep('confirm_initial');
 }}
 className="w-full bg-[#1a202c] text-white h-12 rounded-full text-[14px] font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-md"
 >
 {status === 'en_camino' ? (
  <>
    <MapPin className="w-[14px] h-[14px]" /> Seguir al técnico
  </>
 ) : (
  "Reprogramar solicitud"
 )}
 </button>
 )}
 <p className="text-[12px] text-gray-500 text-center mt-2">¿Necesitas ayuda?</p>
 <button 
 onClick={() => window.open('https://wa.me/51999999999')}
 className="w-full flex items-center justify-center gap-2 border border-[#E3001B] text-[#E3001B] h-12 rounded-full text-[14px] font-bold hover:bg-[#E3001B]/5 active:scale-95 transition-all"
 >
 Comunícate con nosotros
 <Phone className="w-4 h-4" />
 </button>
 </div>
 </>`);

  fs.writeFileSync(file, content);
  console.log("Replaced via regex logic");
} else {
  console.log("No match found");
}
