const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src/pages/Seguimiento.tsx');
const brokenFile = file + '.broken';

// if broken doesn't exist we make it
if (!fs.existsSync(brokenFile)) {
    fs.copyFileSync(file, brokenFile);
}

let content = fs.readFileSync(file, 'utf8');

// Buscamos el inicio roto 
const markerStart = '{/* Vertical Timeline - Minimalista */}';
const start = content.indexOf(markerStart);
const markerEnd = '{/* MODALS REPROGRAMAR Y CANCELAR */}';
const end = content.indexOf(markerEnd, start);

if (start !== -1 && end !== -1) {
    const newContent = content.substring(0, start) + `
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
 <button 
 onClick={() => window.open('https://wa.me/51999999999')}
 className="w-full flex items-center justify-center gap-2 border border-[#E3001B] text-[#E3001B] h-12 rounded-full text-[14px] font-bold hover:bg-[#E3001B]/5 active:scale-95 transition-all"
 >
 Comunícate con nosotros
 <Phone className="w-4 h-4" />
 </button>
 <p className="text-[12px] text-gray-500 text-center mt-2">¿Necesitas ayuda?</p>
 </div>
 </>
 )}
 </div>
 </div>

 ` + content.substring(end);

 fs.writeFileSync(file, newContent);
 console.log("Fixed with JS file");
}
