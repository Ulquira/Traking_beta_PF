const fs = require('fs');

let c = fs.readFileSync('src/pages/Seguimiento.tsx', 'utf8');

c = c.replace(
  /const \[encuesta, setEncuesta\] = useState\(\{[\s\S]*?\}\);/,
  `const [encuesta, setEncuesta] = useState({
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
 });`
);

c = c.replace(
  /if \(!encuesta\.probabilidad_recomendar\) \{/,
  `if (!encuesta.instalacion_concretada || !encuesta.satisfaccion_general || !encuesta.facilidad_gestion) {`
);

c = c.replace(
  /alert\("Por favor bríndanos una calificación del 1 al 10 antes de enviar\."\);/,
  `alert("Por favor responde las preguntas principales antes de enviar.");`
);

let uiStart = c.indexOf('{/* Pregunta 1 */}');
let uiEnd = c.indexOf('<Button \n onClick={handleEncuestaSubmit}');

if(uiStart !== -1 && uiEnd !== -1) {
  const newUI = `{/* Pregunta 1 */}
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
     <label key={\`\${aspect.key}_\${num}\`} className="flex-1">
     <input type="radio" name={aspect.key} value={num} onChange={(e) => setEncuesta({...encuesta, [aspect.key]: e.target.value})} className="peer hidden" />
     <div className="border border-gray-100 bg-gray-50 rounded-xl flex flex-col items-center justify-center py-2 cursor-pointer hover:bg-gray-100 peer-checked:border-[#E3001B] peer-checked:bg-[#E3001B]/10 transition-all">
     <span className={\`text-[14px] font-bold \${(encuesta as any)[aspect.key] === num.toString() ? 'text-[#E3001B]' : 'text-gray-500'}\`}>{num}</span>
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
 <label key={\`sat_\${num}\`} className="flex-1">
 <input type="radio" name="satisfaccion" value={num} onChange={(e) => {
   setEncuesta({...encuesta, satisfaccion_general: e.target.value, satisfaccion_comentario: ''});
 }} className="peer hidden" />
 <div className="border border-gray-100 bg-gray-50 rounded-xl flex flex-col items-center justify-center py-2 cursor-pointer hover:bg-gray-100 peer-checked:border-[#E3001B] peer-checked:bg-[#E3001B]/10 transition-all">
 <span className={\`text-[14px] font-bold \${encuesta.satisfaccion_general === num.toString() ? 'text-[#E3001B]' : 'text-gray-500'}\`}>{num}</span>
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
 <label key={\`fac_\${num}\`} className="flex-1">
 <input type="radio" name="facilidad" value={num} onChange={(e) => {
   setEncuesta({...encuesta, facilidad_gestion: e.target.value, facilidad_motivo: ''});
 }} className="peer hidden" />
 <div className="border border-gray-100 bg-gray-50 rounded-xl flex flex-col items-center justify-center py-2 cursor-pointer hover:bg-gray-100 peer-checked:border-[#E3001B] peer-checked:bg-[#E3001B]/10 transition-all">
 <span className={\`text-[14px] font-bold \${encuesta.facilidad_gestion === num.toString() ? 'text-[#E3001B]' : 'text-gray-500'}\`}>{num}</span>
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

 `;

  c = c.substring(0, uiStart) + newUI + c.substring(uiEnd);
}

fs.writeFileSync('src/pages/Seguimiento.tsx', c);

let cap = fs.readFileSync('capa_intermedia/index.ts', 'utf8');
cap = cap.replace(
  /const \{\s*token, llego_horario,[^{}]*?\} = req\.body;/m,
  `const { 
      token, instalacion_concretada, tecnico_trato, tecnico_puntualidad, tecnico_claridad, 
      tecnico_orden, tecnico_efectividad, satisfaccion_general, satisfaccion_comentario, 
      facilidad_gestion, facilidad_motivo 
    } = req.body;`
);

cap = cap.replace(
  /if \(!token \|\| !probabilidad_recomendar\) \{/,
  `if (!token || !satisfaccion_general) {`
);

cap = cap.replace(
  /await fs\.promises\.writeFile\(csvPath, 'FECHA_REGISTRO.*\\n', 'utf8'\);/,
  `await fs.promises.writeFile(csvPath, 'FECHA_REGISTRO,TOKEN,CONCRETO_INSTALACION,TRATO,PUNTUALIDAD,CLARIDAD,ORDEN,EFECTIVIDAD,SATISFACCION_GENERAL,SATISFACCION_COMENTARIO,FACILIDAD,FACILIDAD_MOTIVO\\n', 'utf8');`
);

cap = cap.replace(
  /const cleanComments = \(comentarios \|\| ''\)\.replace\(\/,\/g, ' '\);/,
  `const cleanComments = (satisfaccion_comentario || '').replace(/,/g, ' ');`
);

cap = cap.replace(
  /const csvLine = \`\$\{timestamp\},\$\{token\},\$\{llego_horario\}.*\\n\`;/,
  `const csvLine = \`\${timestamp},\${token},\${instalacion_concretada},\${tecnico_trato},\${tecnico_puntualidad},\${tecnico_claridad},\${tecnico_orden},\${tecnico_efectividad},\${satisfaccion_general},\${cleanComments},\${facilidad_gestion},\${facilidad_motivo || ''}\\n\`;`
);

fs.writeFileSync('capa_intermedia/index.ts', cap);

let ser = fs.readFileSync('server/index.ts', 'utf8');
ser = ser.replace(
  /const \{[\s\S]*?comentarios[\s\S]*?\} = req\.body;/,
  `const { 
    token, instalacion_concretada, tecnico_trato, tecnico_puntualidad, tecnico_claridad, 
    tecnico_orden, tecnico_efectividad, satisfaccion_general, satisfaccion_comentario, 
    facilidad_gestion, facilidad_motivo 
  } = req.body;`
);

ser = ser.replace(
  /if \(!token \|\| !probabilidad_recomendar\) \{/,
  `if (!token || !satisfaccion_general) {`
);

ser = ser.replace(
  /INSERT INTO ENCUESTAS \(token, llego_horario, calificacion_tecnico, explicacion_clara, tiempo_adecuado, informacion_clara, probabilidad_recomendar, comentarios\)/,
  `INSERT INTO ENCUESTAS (token, instalacion_concretada, tecnico_trato, tecnico_puntualidad, tecnico_claridad, tecnico_orden, tecnico_efectividad, satisfaccion_general, satisfaccion_comentario, facilidad_gestion, facilidad_motivo)`
);

ser = ser.replace(
  /VALUES \(\?, \?, \?, \?, \?, \?, \?, \?\)/,
  `VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
);

ser = ser.replace(
  /await pool\.query\(query, \[\n      token, \n      llego_horario \|\| null, \n      calificacion_tecnico \|\| null, \n      explicacion_clara \|\| null, \n      tiempo_adecuado \|\| null, \n      informacion_clara \|\| null, \n      probabilidad_recomendar, \n      comentarios \|\| ''\n    \]\);/,
  `await pool.query(query, [
      token, instalacion_concretada, tecnico_trato, tecnico_puntualidad, tecnico_claridad, 
      tecnico_orden, tecnico_efectividad, satisfaccion_general, satisfaccion_comentario, 
      facilidad_gestion, facilidad_motivo
    ]);`
);
fs.writeFileSync('server/index.ts', ser);
