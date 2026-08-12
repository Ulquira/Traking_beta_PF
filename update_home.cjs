const fs = require('fs');

let code = fs.readFileSync('src/pages/Index.tsx', 'utf8');

// 1. Reemplazar el fondo de pantalla por el home.png
const oldBg = `<div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\\'60\\' height=\\'60\\' viewBox=\\'0 0 60 60\\' xmlns=\\'http://www.w3.org/2000/svg\\'%3E%3Cg fill=\\'none\\' fill-rule=\\'evenodd\\'%3E%3Cg fill=\\'%23ffffff\\' fill-opacity=\\'1\\'%3E%3Cpath d=\\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}></div>`;

const newBg = `<div className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-60 mix-blend-overlay" style={{ backgroundImage: 'url("/src/assets/home.png")' }}></div>
        <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/80 to-primary/40 z-0"></div>`;

code = code.replace(oldBg, newBg);

// 2. Reemplazar el logo blanco por el logo alternativo (blanco con letras amarillas)
code = code.replace('<img src="/src/assets/logo-white.png" alt="Peru Fibra" className="h-12 w-auto object-contain drop-shadow-md" />', '<img src="/src/assets/logo-alt-1.png" alt="Peru Fibra" className="h-12 w-auto object-contain drop-shadow-md" />');

// 3. Mejorar el botón de modo oscuro (amarillo de perufibra para resaltar)
code = code.replace('<div className="bg-primary/10 rounded-full p-1 border border-primary/20">', '<div className="bg-secondary/20 rounded-full p-1 border border-secondary/50 shadow-sm">');

fs.writeFileSync('src/pages/Index.tsx', code);
