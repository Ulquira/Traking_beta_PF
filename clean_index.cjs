const fs = require('fs');
let code = fs.readFileSync('src/pages/Index.tsx', 'utf8');

// Eliminar imports no usados
code = code.replace(/import \{ Search, Shield, Clock, CheckCircle2, ChevronRight \} from "lucide-react";\n/g, '');

// Eliminar FadeUpBox no usado
const fadeUpStart = code.indexOf('const FadeUpBox');
const fadeUpEnd = code.indexOf(');', fadeUpStart) + 3;
if (fadeUpStart !== -1) {
  code = code.substring(0, fadeUpStart) + code.substring(fadeUpEnd);
}

fs.writeFileSync('src/pages/Index.tsx', code);
