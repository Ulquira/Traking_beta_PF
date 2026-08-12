const fs = require('fs');

// 1. Quitar import inutilizado en Index
let file = 'src/pages/Index.tsx';
let code = fs.readFileSync(file, 'utf8');
code = code.replace(/import \{ PeruFibraLogo \} from "@\/components\/PeruFibraLogo";\r?\n/g, '');
fs.writeFileSync(file, code);

// 2. Arreglar el tipo de 'cerrada' en Seguimiento que causa error de Typescript porque olvidé actualizar la interfaz de la data
file = 'src/pages/Seguimiento.tsx';
code = fs.readFileSync(file, 'utf8');
code = code.replace(
  "status: 'programada' | 'asignado' | 'en_camino' | 'en_proceso' | 'finalizada';", 
  "status: 'programada' | 'asignado' | 'en_camino' | 'en_proceso' | 'finalizada' | 'cerrada';"
);
fs.writeFileSync(file, code);