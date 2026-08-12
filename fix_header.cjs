const fs = require('fs');

// 1. Modificar Index.tsx (Cabecera y Botones)
let f1 = 'src/pages/Index.tsx';
let c1 = fs.readFileSync(f1, 'utf8');

// Cabecera con degradado rojo
c1 = c1.replace(
  '<header className="absolute top-0 w-full z-50 bg-transparent">', 
  '<header className="absolute top-0 w-full z-50 bg-gradient-to-r from-primary to-primary-light shadow-md border-b-4 border-secondary">'
);

// Logo blanco a color (o amarillo si se ajusta el componente)
c1 = c1.replace(
  '<img src="/src/assets/logo-white.png" alt="Peru Fibra" className="h-12 w-auto object-contain" />',
  '<img src="/src/assets/logo-white.png" alt="Peru Fibra" className="h-12 w-auto object-contain drop-shadow-md" />' // Mantengo el blanco pero resalta mejor en rojo
);

// Botón de Escríbenos y nav text a blanco
c1 = c1.replace(
  '<nav className="hidden md:flex items-center gap-8 text-white font-bold">',
  '<nav className="hidden md:flex items-center gap-8 text-white font-bold">'
);

fs.writeFileSync(f1, c1);

// 2. Modificar ModeToggle.tsx (Iconos dark mode que se noten)
let f2 = 'src/components/ModeToggle.tsx';
let c2 = fs.readFileSync(f2, 'utf8');

c2 = c2.replace(
  'className="bg-transparent border-white/30 text-white hover:bg-white/20 rounded-full w-9 h-9 flex items-center justify-center"',
  'className="bg-white/20 border-white text-white hover:bg-white/40 hover:text-white rounded-full w-10 h-10 flex items-center justify-center shadow-sm"'
);
fs.writeFileSync(f2, c2);

