const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src/pages/Seguimiento.tsx');
let content = fs.readFileSync(file, 'utf8');

const regex = /\{\/\* Action Buttons and Help Center CTA \(Bottom\) \*\/\}[\s\S]*?<\/div>\s*<\/>/g;

if (content.match(regex)) {
  content = content.replace(regex, `
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
 </div>
 </motion.div>
 </div>
  `);
  fs.writeFileSync(file, content);
  console.log("Fixed via regex!");
} else {
  console.log("Not found.");
}
